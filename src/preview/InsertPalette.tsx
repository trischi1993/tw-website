import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useDocuments } from '@sanity/visual-editing/react';
import { INSERTABLES, createInsertable, type Insertable } from './insertables';
import { activePreviewDoc } from './live-docs';
import { selectElementByKey } from './select-section';
import { recordHistory } from './editor-history';
import { createInsertPatch } from './insert-operation';

/* ---------------------------------------------------------------------------
   cmd+E-Insert-Palette IM Vorschau-Canvas - der verifizierte Weg aus
   flowtricks/remarkable (InsertPalette.tsx), auf Sections + deren `content[]`-
   Slot angepasst.

     ⌘/Ctrl + E  oder  ⌘/Ctrl + F  → öffnen/schließen
     tippen filtert · ↑/↓ wählt · Enter fügt ein · Esc schließt

   Sections landen hinter der umgebenden Section. Content landet direkt hinter
   dem selektierten Content bzw. am Ende der selektierten Section.

   Das Einfügen läuft über denselben optimistischen Dokument-Store wie das
   Drag-Reorder (`useDocuments().patch`), erscheint also sofort. Danach wird das
   frische Element auf dem Canvas selektiert. Rendert nichts, wenn geschlossen.

   Mountet SEITENWEIT neben <VisualEditing> in PreviewBridge - nur im Draft-Mode-
   Vorschau-Build, nie in Prod. Öffnen aus dem Studio-Fenster kommt über den
   comlink-Kanal (hover-channel → CustomEvent 'upgreight:insert-palette').
   --------------------------------------------------------------------------- */

export default function InsertPalette() {
  const { getDocument } = useDocuments();
  // Live-Ref, damit die einmal registrierten Listener stets das aktuelle
  // getDocument nutzen, ohne bei jedem Render neu zu subscriben.
  const getDocumentRef = useRef(getDocument);
  getDocumentRef.current = getDocument;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');

  const openRef = useRef(open);
  openRef.current = open;
  const selectedPathRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INSERTABLES;
    return INSERTABLES.filter(
      (it) => it.title.toLowerCase().includes(q) || it.type.toLowerCase().includes(q),
    );
  }, [query]);

  // Highlight im Bereich halten, während die Liste filtert.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    setError('');
  }, []);

  const openPalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setError('');
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const doInsert = useCallback(
    async (insertable: Insertable) => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const target = activePreviewDoc.current;
        if (!target) return;

        const doc = getDocumentRef.current(target.id);
        const snapshot = (await doc.getSnapshot()) as Record<string, unknown> | null;
        if (!snapshot) return;

        const block = createInsertable(insertable.type) as
          | ({ _key: string; _type: string } & Record<string, unknown>)
          | null;
        if (!block) return;
        const selectionPath = selectedPathRef.current;
        const patch = createInsertPatch(snapshot, selectionPath, insertable, block);

        close();
        recordHistory(target.id, snapshot);
        doc.patch([patch] as never);
        selectElementByKey(block._key);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Block konnte nicht eingefügt werden.');
        if (import.meta.env.DEV) console.warn('InsertPalette: insert failed', err);
      } finally {
        busyRef.current = false;
      }
    },
    [close],
  );

  // Selektion verfolgen, Shortcut abfangen, Studio-forwarded Öffnen empfangen.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest('[data-insert-palette]')) return;
      const el = target?.closest<HTMLElement>(
        '[data-el-path], [data-section-key]',
      );
      selectedPathRef.current =
        el?.getAttribute('data-el-path') ??
        (el?.dataset.sectionKey ? `sections[_key=="${el.dataset.sectionKey}"]` : null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const isToggle =
        mod &&
        !e.altKey &&
        !e.shiftKey &&
        (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F');
      if (isToggle) {
        // ⌘F nicht aus einem echten Textfeld stehlen (außer unserem Input).
        const t = e.target as HTMLElement | null;
        const inField =
          !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!openRef.current && inField && t !== inputRef.current) return;
        e.preventDefault();
        if (openRef.current) close();
        else openPalette();
        return;
      }
      if (e.key === 'Escape' && openRef.current) {
        e.preventDefault();
        close();
      }
    };

    // Aus dem Studio-Fenster forwarded (hover-channel empfängt 'open-palette').
    const onForwardOpen = () => openPalette();

    document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('upgreight:insert-palette', onForwardOpen);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('upgreight:insert-palette', onForwardOpen);
    };
  }, [close, openPalette]);

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) void doInsert(r);
    }
  };

  if (!open) return null;

  return (
    <div data-insert-palette="" style={backdrop} onMouseDown={close}>
      <div style={box} onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Block einfügen …"
          style={input}
          autoFocus
          spellCheck={false}
        />
        <div style={list}>
          {results.map((it, i) => (
            <div
              key={it.type}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                void doInsert(it);
              }}
              style={{ ...row, ...(i === activeIndex ? rowActive : null) }}
            >
              <span
                style={{
                  ...dot,
                  background: it.category === 'section' ? '#43d675' : '#f5a623',
                }}
              />
              {it.title}
            </div>
          ))}
          {results.length === 0 && <div style={emptyRow}>Kein Treffer</div>}
        </div>
        {error && <div style={errorRow}>{error}</div>}
      </div>
    </div>
  );
}

const backdrop: CSSProperties = {
  position: 'fixed',
  inset: 0,
  // Über dem Canvas-Overlay, damit dessen Ring nicht über die Palette malt.
  zIndex: 2147483647,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: '12vh',
};

const box: CSSProperties = {
  width: 'min(560px, 92vw)',
  background: '#1b1b1d',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
  overflow: 'hidden',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#fff',
  fontSize: 16,
  padding: '16px 18px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const list: CSSProperties = { maxHeight: 320, overflowY: 'auto', padding: 6 };

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 12px',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.85)',
  fontSize: 14,
  cursor: 'pointer',
  userSelect: 'none',
};

const rowActive: CSSProperties = { background: 'rgba(255,255,255,0.09)', color: '#fff' };

const dot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  flex: '0 0 auto',
};

const emptyRow: CSSProperties = { padding: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14 };
const errorRow: CSSProperties = {
  padding: '10px 14px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  color: '#ffb4b4',
  fontSize: 13,
};
