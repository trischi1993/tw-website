import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useDocuments } from '@sanity/visual-editing/react';
import { at, set } from '@sanity/mutate';
import { activePreviewDoc } from './live-docs';
import { SECTION_PAD, SECTION_GAP, spaceVar } from '../lib/content/sections';
import type { SectionPadToken, GapToken, SpaceToken } from '../lib/content/types';
import {
  PAD_TOP_TOKENS,
  PAD_BOTTOM_TOKENS,
  resolvePadScale,
  resolveGapScale,
  resolveMarginScale,
  snapSpacing,
  SPACING_LABEL,
  type SpacingStep,
} from './spacing-scale';
import { recordHistory } from './editor-history';

/* ---------------------------------------------------------------------------
   Canvas-Spacing-Resizer (Phase c.2). ZONE-BASIERT: es wird IMMER NUR die eine
   Abstands-Zone angezeigt, über der der Cursor gerade steht - mit schraffiertem
   Band + Ziehgriff. Ziehen snappt an die benannte Token-Skala (kein px-für-px)
   und schreibt beim Loslassen den TOKEN-String.

   Vier Zonen (nach dem Element unter dem Cursor):
    - Block (Überzeile/Überschrift/Absatz) → dessen Bottom-MARGIN (Band unter dem
      Block, `marginBottom`).
    - Section-Leerfläche, je nach Höhe:
        · oberes PADDING (`paddingTop`)  · unteres PADDING (`paddingBottom`)
        · der GAP zwischen genau den zwei Blöcken, zwischen denen der Cursor steht
          (`gap`, gilt für die ganze Section).

   Faithful an flowtricks/remarkable (SectionSpacingResizer + BlockMarginResizer +
   Gap-Teil von SpacingResizer), aber hover-lokalisiert statt „alle Griffe
   gleichzeitig" - das war Julians Kern-Feedback (nur zeigen, wo man hovert).

   Schreibpfad = optimistischer Store (`useDocuments().patch` + @sanity/mutate,
   Doc aus `activePreviewDoc`), der ms-schnelle Weg (unset-Felder wie `gap` stehen
   nicht in der Content-Source-Map). Live-Vorschau setzt exakt dieselben CSS-Vars
   wie der Render (sections.ts). Mount neben MaxWidthResizer in PreviewBridge.
   Fail-open. Der maxWidth-Griff (rechte Kante, eigenes Modul) koexistiert am
   Block, weil er eine andere Kante bedient.

   Pointer-Capture: da immer nur EIN Control gerendert wird, bleibt das Griff-
   Element über den Idle→Drag-Übergang an derselben JSX-Position gemountet -
   sonst ginge setPointerCapture beim ersten State-Update verloren.
   --------------------------------------------------------------------------- */

const Z = 2147483000;
const BLUE = '#3b82f6';
const GRAB_W = 56;
const GRAB_H = 8;
const STRIPES =
  'repeating-linear-gradient(-45deg, rgba(59,130,246,0.12) 0 6px, rgba(59,130,246,0.22) 6px 12px)';

type ZoneType = 'padTop' | 'padBottom' | 'gap' | 'margin';

/** Band-Geometrie in Viewport-px (Idle == aus `Zone`, Drag == aus Live-Messung). */
interface Geom {
  left: number;
  width: number;
  stripeTop: number;
  stripeH: number;
  grabY: number;
}

interface Zone extends Geom {
  type: ZoneType;
  sectionEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  gapAnchorEl: HTMLElement | null; // oberer Block des Gaps
  blockEl: HTMLElement | null;
  sectionKey: string;
  blockPath: string; // data-el-path des Blocks (für marginBottom-Commit)
}

/** Laufende Drag-Operation: alles, was onDrag/onUp brauchen. */
interface Drag {
  scale: SpacingStep[];
  startY: number;
  startPx: number;
  left: number;
  width: number;
  anchor: number; // fixe Oberkante des Bands
  label: string;
  mutate: (token: string) => void; // Live-CSS im Canvas
  grabY: (px: number) => number; // Griffposition je Bandhöhe
  commit: (token: string) => void; // optimistischer Patch
}

/** Direkte Content-Blöcke einer Section (Überzeile/Überschrift/Absatz). */
function contentBlocks(contentEl: HTMLElement): HTMLElement[] {
  return Array.from(contentEl.querySelectorAll<HTMLElement>(':scope > [data-el-kind]'));
}

/**
 * Die Abstands-Zone unter (x, y) bestimmen. Liegt ein BLOCK obenauf → dessen
 * Bottom-Margin; sonst die SECTION → oberes/unteres Padding bzw. der Gap zwischen
 * den zwei Blöcken, zwischen denen der Cursor steht. Kein Treffer → null.
 */
function computeZone(x: number, y: number): Zone | null {
  const stack = document.elementsFromPoint(x, y) as HTMLElement[];
  const topmost = stack.find(
    (el) => el.hasAttribute?.('data-el-kind') || el.hasAttribute?.('data-section-key'),
  );
  if (!topmost) return null;

  // --- Block: Bottom-Margin --------------------------------------------------
  if (topmost.hasAttribute('data-el-kind')) {
    const path = topmost.getAttribute('data-el-path');
    if (!path) return null;
    const r = topmost.getBoundingClientRect();
    const marginPx = parseFloat(getComputedStyle(topmost).marginBottom) || 0;
    return {
      type: 'margin',
      left: r.left,
      width: r.width,
      stripeTop: r.bottom,
      stripeH: marginPx,
      grabY: r.bottom, // Griff sitzt fix auf der Blockunterkante (Margin liegt außerhalb der Box)
      sectionEl: null,
      contentEl: null,
      gapAnchorEl: null,
      blockEl: topmost,
      sectionKey: '',
      blockPath: path,
    };
  }

  // --- Section: Padding oben/unten oder Gap ---------------------------------
  const sectionEl = topmost;
  const key = sectionEl.getAttribute('data-section-key');
  const contentEl = sectionEl.querySelector<HTMLElement>('.section__content');
  if (!key || !contentEl) return null;

  const sr = sectionEl.getBoundingClientRect();
  const cs = getComputedStyle(sectionEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const contentTop = sr.top + padTop;
  const contentBottom = sr.bottom - padBottom;

  if (y < contentTop) {
    return {
      type: 'padTop',
      left: sr.left,
      width: sr.width,
      stripeTop: sr.top,
      stripeH: padTop,
      grabY: contentTop,
      sectionEl,
      contentEl,
      gapAnchorEl: null,
      blockEl: null,
      sectionKey: key,
      blockPath: '',
    };
  }
  if (y > contentBottom) {
    return {
      type: 'padBottom',
      left: sr.left,
      width: sr.width,
      stripeTop: contentBottom,
      stripeH: padBottom,
      grabY: sr.bottom,
      sectionEl,
      contentEl,
      gapAnchorEl: null,
      blockEl: null,
      sectionKey: key,
      blockPath: '',
    };
  }

  // Zwischen zwei Blöcken? → Gap genau dieses Zwischenraums.
  const blocks = contentBlocks(contentEl);
  const cr = contentEl.getBoundingClientRect();
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = blocks[i].getBoundingClientRect();
    const b = blocks[i + 1].getBoundingClientRect();
    if (y >= a.bottom && y <= b.top) {
      return {
        type: 'gap',
        left: cr.left,
        width: cr.width,
        stripeTop: a.bottom,
        stripeH: Math.max(2, b.top - a.bottom),
        grabY: (a.bottom + b.top) / 2,
        sectionEl,
        contentEl,
        gapAnchorEl: blocks[i],
        blockEl: null,
        sectionKey: key,
        blockPath: '',
      };
    }
  }
  return null; // neben einem Block im Randbereich → keine Zone
}

export default function SpacingResizer() {
  const { getDocument } = useDocuments();
  const getDocRef = useRef(getDocument);
  getDocRef.current = getDocument;

  const dragRef = useRef<Drag | null>(null);
  const liveTokenRef = useRef<string | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null); // aktives interaktives Element
  const rafRef = useRef(0);

  const [zone, setZone] = useState<Zone | null>(null);
  const [active, setActive] = useState<ZoneType | null>(null);
  const [band, setBand] = useState<Geom | null>(null);
  const [label, setLabel] = useState<{ text: string; x: number; y: number } | null>(null);

  const detect = useCallback((x: number, y: number) => {
    if (dragRef.current) return;
    // Über dem eigenen Griff/Band nicht neu detektieren (Zone stabil halten).
    const stack = document.elementsFromPoint(x, y) as HTMLElement[];
    if (handleRef.current && (stack as Element[]).includes(handleRef.current)) return;
    setZone(computeZone(x, y));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => detect(e.clientX, e.clientY));
    };
    const onScroll = () => {
      if (!dragRef.current) setZone(null); // Rects werden stale → beim nächsten Move neu
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [detect]);

  const patch = useCallback(async (path: string, token: string) => {
    const doc = activePreviewDoc.current;
    if (!doc || !path) return;
    try {
      const documentStore = getDocRef.current(doc.id);
      const snapshot = await documentStore.getSnapshot();
      if (!snapshot) return;
      recordHistory(doc.id, snapshot);
      documentStore.patch([at(path, set(token))] as never);
    } catch {
      /* kein optimistischer Actor (nicht in Presentation) → ignorieren */
    }
  }, []);

  const startDrag = useCallback(
    (z: Zone, e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);

      let drag: Drag;
      switch (z.type) {
        case 'padTop': {
          const sec = z.sectionEl!;
          const r = sec.getBoundingClientRect();
          const startPx = parseFloat(getComputedStyle(sec).paddingTop) || 0;
          drag = {
            scale: resolvePadScale(PAD_TOP_TOKENS),
            startY: e.clientY,
            startPx,
            left: r.left,
            width: r.width,
            anchor: r.top, // Band wächst nach unten von der Section-Oberkante
            label: 'Padding top',
            mutate: (tk) => (sec.style.paddingTop = SECTION_PAD[tk as SectionPadToken]),
            grabY: (px) => r.top + px,
            commit: (tk) => void patch(`sections[_key=="${z.sectionKey}"].paddingTop`, tk),
          };
          break;
        }
        case 'padBottom': {
          const sec = z.sectionEl!;
          const r = sec.getBoundingClientRect();
          const startPx = parseFloat(getComputedStyle(sec).paddingBottom) || 0;
          const anchor = r.bottom - startPx; // Content-Unterkante (fix)
          drag = {
            scale: resolvePadScale(PAD_BOTTOM_TOKENS),
            startY: e.clientY,
            startPx,
            left: r.left,
            width: r.width,
            anchor,
            label: 'Padding bottom',
            mutate: (tk) => (sec.style.paddingBottom = SECTION_PAD[tk as SectionPadToken]),
            grabY: (px) => anchor + px,
            commit: (tk) => void patch(`sections[_key=="${z.sectionKey}"].paddingBottom`, tk),
          };
          break;
        }
        case 'gap': {
          const sec = z.sectionEl!;
          const content = z.contentEl!;
          const cr = content.getBoundingClientRect();
          const anchor = z.gapAnchorEl!.getBoundingClientRect().bottom; // fixe Gap-Oberkante
          const startPx = parseFloat(getComputedStyle(content).rowGap) || 0;
          drag = {
            scale: resolveGapScale(),
            startY: e.clientY,
            startPx,
            left: cr.left,
            width: cr.width,
            anchor,
            label: 'Gap',
            mutate: (tk) => sec.style.setProperty('--section-gap', SECTION_GAP[tk as GapToken]),
            grabY: (px) => anchor + px / 2,
            commit: (tk) => void patch(`sections[_key=="${z.sectionKey}"].gap`, tk),
          };
          break;
        }
        default: {
          // margin
          const block = z.blockEl!;
          const r = block.getBoundingClientRect();
          const startPx = parseFloat(getComputedStyle(block).marginBottom) || 0;
          drag = {
            scale: resolveMarginScale(),
            startY: e.clientY,
            startPx,
            left: r.left,
            width: r.width,
            anchor: r.bottom, // Margin wächst nach unten von der Blockunterkante
            label: 'Margin',
            mutate: (tk) => (block.style.marginBottom = spaceVar(tk as SpaceToken) ?? '0'),
            grabY: () => r.bottom, // Griff fix auf der Blockunterkante
            commit: (tk) => void patch(`${z.blockPath}.marginBottom`, tk),
          };
          break;
        }
      }

      dragRef.current = drag;
      liveTokenRef.current = null;
      setActive(z.type);
      // Initial-Band aus dem aktuellen Wert → kein Leerframe vor dem ersten Move.
      setBand({
        left: drag.left,
        width: drag.width,
        stripeTop: drag.anchor,
        stripeH: drag.startPx,
        grabY: drag.grabY(drag.startPx),
      });
    },
    [patch],
  );

  const onDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    // Nach unten ziehen = mehr Abstand; nach oben = weniger (Richtung 0).
    const snapped = snapSpacing(d.scale, Math.max(0, d.startPx + (e.clientY - d.startY)));
    liveTokenRef.current = snapped.token;
    d.mutate(snapped.token);
    setLabel({
      text: `${d.label} · ${SPACING_LABEL[snapped.token] ?? snapped.token}`,
      x: e.clientX + 14,
      y: e.clientY - 10,
    });
    setBand({
      left: d.left,
      width: d.width,
      stripeTop: d.anchor,
      stripeH: snapped.px,
      grabY: d.grabY(snapped.px),
    });
  }, []);

  const onUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* Capture schon weg → ignorieren */
    }
    const token = liveTokenRef.current;
    dragRef.current = null;
    liveTokenRef.current = null;
    setActive(null);
    setBand(null);
    setLabel(null);
    if (token) d.commit(token);
    // Zone am Loslasspunkt frisch messen (DOM hat sich geändert).
    setZone(computeZone(e.clientX, e.clientY));
  }, []);

  // ---- Rendering: immer NUR ein Control (Idle aus zone, Drag aus band) -----
  const kind = active ?? zone?.type ?? null;
  const geom = active && band ? band : zone;
  if (!kind || !geom) return null;

  const isGap = kind === 'gap';
  const grabLeft = geom.left + geom.width / 2 - GRAB_W / 2;
  // startDrag braucht die Zone; im Drag ist sie eingefroren (detect pausiert).
  const z = zone;

  return (
    <div style={overlay}>
      {isGap ? (
        <>
          <div
            ref={handleRef}
            onPointerDown={(e) => z && startDrag(z, e)}
            onPointerMove={onDrag}
            onPointerUp={onUp}
            title="Drag to set gap"
            style={{
              ...gapBand,
              left: geom.left,
              top: geom.stripeTop,
              width: geom.width,
              height: Math.max(2, geom.stripeH),
            }}
          />
          <div style={{ ...grab, pointerEvents: 'none', left: grabLeft, top: geom.grabY - GRAB_H / 2 }} />
        </>
      ) : (
        <>
          {geom.stripeH > 0 && (
            <div
              style={{ ...stripe, left: geom.left, top: geom.stripeTop, width: geom.width, height: geom.stripeH }}
            />
          )}
          <div
            ref={handleRef}
            onPointerDown={(e) => z && startDrag(z, e)}
            onPointerMove={onDrag}
            onPointerUp={onUp}
            title="Drag to resize spacing"
            style={{ ...grab, left: grabLeft, top: geom.grabY - GRAB_H / 2 }}
          />
        </>
      )}
      {label && <div style={{ ...labelStyle, left: label.x, top: label.y }}>{label.text}</div>}
    </div>
  );
}

const overlay: CSSProperties = { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: Z };
const stripe: CSSProperties = { position: 'fixed', background: STRIPES, pointerEvents: 'none' };
const gapBand: CSSProperties = {
  position: 'fixed',
  background: 'rgba(59,130,246,0.28)',
  outline: '1px solid rgba(59,130,246,0.8)',
  outlineOffset: -1,
  borderRadius: 2,
  cursor: 'ns-resize',
  pointerEvents: 'auto',
  touchAction: 'none',
};
const grab: CSSProperties = {
  position: 'fixed',
  width: GRAB_W,
  height: GRAB_H,
  borderRadius: GRAB_H,
  background: BLUE,
  border: '2px solid #fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
  cursor: 'ns-resize',
  pointerEvents: 'auto',
  touchAction: 'none',
};
const labelStyle: CSSProperties = {
  position: 'fixed',
  transform: 'translateY(-100%)',
  background: BLUE,
  color: '#fff',
  font: "12px ui-monospace, 'SF Mono', Menlo, monospace",
  padding: '2px 8px',
  borderRadius: 4,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
};
