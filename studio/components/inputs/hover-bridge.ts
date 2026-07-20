/**
 * Studio-Seite des Hover-Preview-Kanals (Phase B.2).
 *
 * Ein Custom-Input (SegmentedInput) meldet beim Überfahren einer Option
 * `{ key, field, value }` an die Vorschau-Island, die daraus rein visuell einen
 * Klassen-/Attribut-Flip macht (kein Patch, kein Re-Render) - Millisekunden.
 * Mouse-out (oder ein neuer Hover) räumt auf, Klick macht den echten set()-Patch.
 *
 * Transport: eigener @sanity/comlink-v4-Kanal, NICHT Presentations interner
 * (der ist als internal markiert). Die Rollen sind ggü. Presentation UMGEKEHRT:
 * der Controller (Handshake-Initiator, braucht ein Ziel-Window) lebt in der
 * Island IM iframe und zielt auf window.parent; hier im Studio-Parent sitzt der
 * passive Node, der sein Gegenüber aus dem Handshake (event.source) lernt - wir
 * besitzen das Presentation-iframe nicht und können es nicht als Ziel setzen.
 * Gegenstück: src/preview/hover-channel.ts. Isolation über eigenen `domain`.
 *
 * Fail-open: Bricht der Kanal (kein Preview offen, Origin-Mismatch, was auch
 * immer), fehlt nur das Hover-Preview - Editieren, Autosave und echte Patches
 * laufen unberührt weiter. Jede Kanal-Operation ist in try/catch gekapselt.
 */
import { createNode, type Node } from '@sanity/comlink';
import type { Path } from 'sanity';
import type { EditorAction } from '../../../shared/editor-actions';
export type { EditorAction } from '../../../shared/editor-actions';

/**
 * Nachrichten Studio -> Vorschau. `field`/`value` sind Strings (Segmented-
 * Optionen). MUSS mit src/preview/hover-channel.ts (HoverToPreview) übereinstimmen.
 */
export type StudioToPreview =
  | {
      type: 'hover';
      // `key` = nächster _key (Section-Instanz, für den data-section-key-Fallback).
      // `elPath` = serialisierter Element-Pfad (== data-el-path im DOM), gesetzt für
      // Felder AN einem Element (heading/paragraph); leer/kein Treffer → Section-Flip.
      data: { key: string; field: string; value: string; elPath?: string };
      response?: undefined;
    }
  | { type: 'hover-end'; data?: undefined; response?: undefined }
  // Klick = echter Patch: den aktuellen Hover-Flip STEHEN lassen (Revert
  // verwerfen), bis die Live-Query React konvergiert. Sonst würde das nächste
  // Mouse-out auf den alten Stand zurückspringen und der neue Wert erschiene erst
  // nach der Query-Latenz (fühlt sich wie „dauert 2-3 s" an).
  | { type: 'hover-commit'; data?: undefined; response?: undefined }
  // cmd+E bei Fokus im Studio-Fenster → Insert-Palette im Vorschau-iframe öffnen.
  | { type: 'open-palette'; data?: undefined; response?: undefined }
  | {
      type: 'editor-command';
      data: { action: EditorAction };
      response?: undefined;
    };

type PreviewToStudio = { type: 'canvas-select'; data?: undefined; response?: undefined };

/** Eigener Namespace - trennt uns sauber von Presentations Kanal ('sanity/*'). */
const DOMAIN = 'upgreight/hover';

let node: Node<StudioToPreview, PreviewToStudio> | null = null;

function getNode(): Node<StudioToPreview, PreviewToStudio> | null {
  if (node) return node;
  if (typeof window === 'undefined') return null;
  try {
    const created = createNode<StudioToPreview, PreviewToStudio>({
      name: 'studio-hover',
      connectTo: 'preview-island',
      domain: DOMAIN,
    });
    created.on('canvas-select', () => {
      window.dispatchEvent(new CustomEvent('upgreight:canvas-select'));
      return undefined;
    });
    created.start();
    node = created;
  } catch {
    return null;
  }
  return node;
}

/**
 * Serialisiert einen Form-Pfad in die EXAKTE Schreibweise der `data-el-path`-
 * Attribute im DOM (TextSection.tsx): `sections[_key=="S"]`, `.heading`,
 * `.body[_key=="P"]`. So findet die Vorschau das getroffene Element ohne die
 * Section neu zu raten. Muss mit TextSection.tsx übereinstimmen.
 */
function serializePath(segments: Path): string {
  let out = '';
  for (const seg of segments) {
    if (typeof seg === 'string') out += out ? `.${seg}` : seg;
    else if (typeof seg === 'number') out += `[${seg}]`;
    else if (seg && typeof seg === 'object' && '_key' in seg)
      out += `[_key=="${(seg as { _key: string })._key}"]`;
  }
  return out;
}

/**
 * Form-Pfad → { key, field, elPath }.
 *  - `field`  = letztes String-Segment (Feldname).
 *  - `key`    = nächster _key (Section-Instanz) für den Section-Fallback.
 *  - `elPath` = serialisierter Pfad OHNE das Feld-Segment (== data-el-path). Deckt
 *    Section-Level (endet auf `[_key=="S"]`, ohne DOM-Treffer → Fallback) UND
 *    Per-Element (endet auf `.heading` / `.body[_key=="P"]`) ab; die Vorschau
 *    entscheidet anhand des DOM, welcher Flip greift.
 */
function targetOf(path: Path): { key: string; field: string; elPath: string } | null {
  const last = path[path.length - 1];
  const field = typeof last === 'string' ? last : undefined;
  let key: string | undefined;
  for (let i = path.length - 1; i >= 0; i--) {
    const seg = path[i];
    if (seg && typeof seg === 'object' && '_key' in seg) {
      key = (seg as { _key: string })._key;
      break;
    }
  }
  if (!field || !key) return null;
  return { key, field, elPath: serializePath(path.slice(0, -1)) };
}

/**
 * Node früh starten (beim Mounten eines Segmented-Felds), damit der Handshake
 * zur Vorschau schon steht, bevor der erste Hover kommt - sonst hinge genau der
 * erste Hover am 500-ms-Handshake-Intervall. Idempotent, fail-open.
 */
export function warmHoverBridge(): void {
  try {
    getNode();
  } catch {
    /* fail-open */
  }
}

/** Hover-Vorschau für den Wert einer Option anstoßen. Fail-open. */
export function sendHover(path: Path, value: string): void {
  const target = targetOf(path);
  if (!target) return;
  try {
    getNode()?.post('hover', { ...target, value });
  } catch {
    /* fail-open */
  }
}

/** Hover-Vorschau beenden (Mouse-out) - die Vorschau stellt den echten Stand zurück. */
export function endHover(): void {
  try {
    getNode()?.post('hover-end');
  } catch {
    /* fail-open */
  }
}

/**
 * Klick übernommen: den aktuellen Hover-Flip STEHEN lassen (Revert verwerfen),
 * bis die Live-Query React konvergiert. Nötig, weil viele Controls (size/level/
 * padding/gap/…) UNSET sind und damit NICHT in der Content-Source-Map stehen →
 * der Studio-Turbo-Overlay kann sie nicht streamen, der Wert erschiene erst nach
 * dem Commit-Refetch (~2-3 s). Ohne diesen Commit spränge das nächste Mouse-out
 * auf den alten Stand zurück (fühlt sich wie „dauert 2-3 s" an). Fail-open.
 * Gegenstück: src/preview/hover-channel.ts ('hover-commit').
 */
export function commitHover(): void {
  try {
    getNode()?.post('hover-commit');
  } catch {
    /* fail-open */
  }
}

/**
 * cmd+E an die Vorschau weiterreichen: liegt der Tastatur-Fokus im Studio-Fenster
 * (z. B. nachdem ein Canvas-Klick den Fokus ins Formularfeld verschoben hat),
 * feuert der Shortcut hier statt im iframe. Ist kein Preview verbunden, ist der
 * Post ein No-op - dann macht cmd+E im bloßen Structure-Tool nichts (wie bei
 * Remarkable). Fail-open. Gegenstück: src/preview/hover-channel.ts ('open-palette').
 */
export function sendOpenPalette(): void {
  try {
    getNode()?.post('open-palette');
  } catch {
    /* fail-open */
  }
}

/** Forward a block-editing shortcut to the preview, which owns the selection. */
export function sendEditorCommand(action: EditorAction): void {
  try {
    getNode()?.post('editor-command', { action });
  } catch {
    /* fail-open */
  }
}
