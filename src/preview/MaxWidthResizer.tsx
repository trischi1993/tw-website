import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useDocuments } from '@sanity/visual-editing/react';
import { at, set as mSet, unset as mUnset } from '@sanity/mutate';
import { activePreviewDoc } from './live-docs';
import { CH_MAX_WIDTH, isResizableKind, type ResizableKind } from './resize-bounds';
import { recordHistory } from './editor-history';

/* ---------------------------------------------------------------------------
   Canvas-maxWidth-Resizer: an der rechten Kante einer Überschrift/eines Absatzes
   erscheint ein blauer Ziehgriff; Ziehen setzt die Lese-Breite in `ch` live und
   snappt an die Feld-`step`. Über das Maximum hinaus = Auto (max-width: none).

   Faithful an flowtricks/remarkable (CanvasResizer.tsx), aber an unsere
   Architektur angepasst: der Griff lebt IN der Vorschau-Island und schreibt beim
   Loslassen DIREKT über den optimistischen Store (`useDocuments().patch` +
   @sanity/mutate) - kein BroadcastChannel-Umweg über das Studio nötig (remarkable
   brauchte den, weil deren Preview kein Write-Token hatte; unsere Island hat es).

   Zielelement + Feld-Pfad kommen aus data-el-kind/data-el-path (nur im Vorschau-
   Build gestempelt, siehe HeadingElement/ParagraphElement). Mountet neben
   <VisualEditing> in PreviewBridge; rendert nichts, solange kein Element unter
   dem Cursor liegt. Vollständig fail-open.
   --------------------------------------------------------------------------- */

const HANDLE_W = 10;
const Z = 2147483000;
const BLUE = '#3b82f6';

let measureCanvas: HTMLCanvasElement | null = null;
/** Breite eines „0"-Glyphs in px = 1ch in der Schrift des Elements. */
function chPx(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const fallback = parseFloat(cs.fontSize) * 0.5 || 8;
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return fallback;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx.measureText('0').width || fallback;
}
/** Aktueller maxWidth-Wert in ch: inline-Wert lesen, sonst gerenderte Breite. */
function currentCh(el: HTMLElement, ppu: number): number {
  const m = /^([\d.]+)ch$/.exec(el.style.maxWidth || '');
  if (m) return parseFloat(m[1]);
  return el.getBoundingClientRect().width / ppu;
}

interface Target {
  el: HTMLElement;
  kind: ResizableKind;
  path: string;
}
interface DragState extends Target {
  startX: number;
  startCh: number;
  ppu: number;
}

export default function MaxWidthResizer() {
  const { getDocument } = useDocuments();
  const getDocRef = useRef(getDocument);
  getDocRef.current = getDocument;

  const targetRef = useRef<Target | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const liveValueRef = useRef<number | null | undefined>(undefined);
  const rafRef = useRef(0);

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const reposition = useCallback(() => {
    setRect(targetRef.current ? targetRef.current.el.getBoundingClientRect() : null);
  }, []);

  const clearTarget = useCallback(() => {
    targetRef.current = null;
    setRect(null);
  }, []);

  // Element unter dem Cursor finden (durch das Presentation-Overlay hindurch).
  const detect = useCallback(
    (x: number, y: number) => {
      if (dragRef.current) return;
      const stack = document.elementsFromPoint(x, y) as HTMLElement[];
      const el = stack.find((e) => e.hasAttribute?.('data-el-kind'));
      const kind = el?.getAttribute('data-el-kind');
      const path = el?.getAttribute('data-el-path');
      if (el && isResizableKind(kind) && path) {
        targetRef.current = { el, kind, path };
        reposition();
      } else {
        clearTarget();
      }
    },
    [reposition, clearTarget],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => detect(e.clientX, e.clientY));
    };
    const onScroll = () => reposition();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [detect, reposition]);

  const commit = useCallback(async (path: string, value: number | null) => {
    const doc = activePreviewDoc.current;
    if (!doc) return;
    try {
      const documentStore = getDocRef.current(doc.id);
      const snapshot = await documentStore.getSnapshot();
      if (!snapshot) return;
      recordHistory(doc.id, snapshot);
      documentStore.patch([
        at(`${path}.maxWidth`, value === null ? mUnset() : mSet(value)),
      ] as never);
    } catch {
      /* fail-open */
    }
  }, []);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const t = targetRef.current;
    if (!t) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const ppu = chPx(t.el);
    dragRef.current = { ...t, startX: e.clientX, startCh: currentCh(t.el, ppu), ppu };
    liveValueRef.current = undefined;
    setDragging(true);
  };

  const onDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const b = CH_MAX_WIDTH[d.kind];
    const deltaCh = (e.clientX - d.startX) / d.ppu;
    const decimals = b.step < 1 ? String(b.step).split('.')[1]?.length ?? 0 : 0;
    const next = Number((Math.round((d.startCh + deltaCh) / b.step) * b.step).toFixed(decimals));
    const value: number | null = next > b.max ? null : Math.max(b.min, next);
    d.el.style.maxWidth = value === null ? 'none' : `${value}ch`;
    liveValueRef.current = value;
    setRect(d.el.getBoundingClientRect());
    setLabel({ text: value === null ? 'Auto' : `${value}ch`, x: e.clientX + 14, y: e.clientY - 10 });
  };

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const value = liveValueRef.current;
    dragRef.current = null;
    setDragging(false);
    setLabel(null);
    if (value !== undefined) void commit(d.path, value);
  };

  if (!rect) return null;
  const edgeX = rect.left + rect.width;
  const handleH = Math.max(24, Math.min(rect.height, 48));
  const centerY = rect.top + rect.height / 2;

  return (
    <div style={overlay}>
      <div
        style={{
          ...outline,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          outlineColor: dragging ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.5)',
        }}
      />
      <div
        onPointerDown={onDown}
        onPointerMove={onDrag}
        onPointerUp={onUp}
        title="Breite ziehen"
        style={{
          ...handle,
          left: edgeX - HANDLE_W / 2,
          top: centerY - handleH / 2,
          height: handleH,
        }}
      />
      {label && (
        <div style={{ ...labelStyle, left: label.x, top: label.y }}>{label.text}</div>
      )}
    </div>
  );
}

const overlay: CSSProperties = { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: Z };
const outline: CSSProperties = {
  position: 'fixed',
  outlineStyle: 'solid',
  outlineWidth: 1,
  outlineOffset: 2,
  borderRadius: 2,
  pointerEvents: 'none',
};
const handle: CSSProperties = {
  position: 'fixed',
  width: HANDLE_W,
  borderRadius: HANDLE_W,
  background: BLUE,
  border: '2px solid #fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
  cursor: 'ew-resize',
  pointerEvents: 'auto',
  touchAction: 'none',
};
const labelStyle: CSSProperties = {
  position: 'fixed',
  transform: 'translateY(-100%)',
  background: '#1b1b1d',
  color: '#fff',
  font: "12px ui-monospace, 'SF Mono', Menlo, monospace",
  padding: '2px 6px',
  borderRadius: 4,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
};
