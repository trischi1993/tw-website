import { useEffect } from 'react';
import {
  sendEditorCommand,
  sendOpenPalette,
  warmHoverBridge,
  type EditorAction,
} from './inputs/hover-bridge';
import { editorActionForKey } from '../../shared/editor-actions';

/**
 * Ein Klick auf ein Vorschau-Overlay kann den Tastatur-Fokus ins Studio-Fenster
 * ziehen - ein danach gedrücktes cmd+E feuert dann HIER statt im iframe. Dieser
 * globale Listener reicht cmd+E/⌘F über den comlink-Kanal an die Vorschau
 * (InsertPalette) weiter, damit sich die Palette öffnet, egal wo der Fokus
 * gerade liegt (das Verhalten aus flowtricks/remarkable EditorKeyForwarder -
 * dort via BroadcastChannel, bei uns via comlink, weil Studio und Vorschau
 * verschiedene Origins haben).
 *
 * Tastendrücke in einem Textfeld werden in Ruhe gelassen (⌘F-Suche, Tippen
 * bleiben nutzbar). Ist kein Preview verbunden, ist das Weiterreichen ein No-op.
 * Rendert nichts; via studio.components.layout auf JEDER Studio-Seite gemountet.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return (
    typeof el.closest === 'function' &&
    !!el.closest('[contenteditable="true"], [role="textbox"]')
  );
}

export function EditorKeyForwarder() {
  useEffect(() => {
    // Node vorwärmen, damit der Handshake schon steht, bevor cmd+E kommt.
    warmHoverBridge();

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const palette =
        mod &&
        !e.altKey &&
        !e.shiftKey &&
        (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F');
      if (palette) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        sendOpenPalette();
        return;
      }

      const action: EditorAction | null = editorActionForKey(e);
      if (!action || isEditableTarget(e.target)) return;
      const selection = document.getSelection?.();
      if (
        action === 'copy' &&
        selection &&
        !selection.isCollapsed &&
        selection.toString().trim()
      ) {
        return;
      }
      e.preventDefault();
      sendEditorCommand(action);
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return null;
}
