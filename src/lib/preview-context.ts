import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Pro-Anfrage-Zustand für die Live-Vorschau.
 *
 * Die Middleware setzt diesen Kontext pro Request (nur im Vorschau-Build und
 * nur wenn der Draft-Mode-Cookie gesetzt ist). `src/lib/sanity.ts` liest ihn
 * und schaltet dann von „veröffentlicht (CDN)" auf „Entwürfe (mit Token)" um.
 *
 * In Produktion wird `runWithPreview` nie aufgerufen → `getPreviewContext()`
 * liefert `undefined` → es bleibt beim veröffentlichten Standard-Client.
 * Damit ist die Produktion vom Vorschau-Pfad unberührt.
 */
export interface PreviewContext {
  /** Sanity-Perspektive, z. B. "drafts". */
  perspective: string;
  /** Lese-Token (nur Vorschau-Umgebung). */
  token?: string;
  /** Studio-URL - Ziel der data-sanity-Click-to-edit-Attribute (SectionsHost → Island). */
  studioUrl?: string;
  /** stega (unsichtbare Zeichen in Strings) bleibt AUS - Click-to-edit läuft
   *  über explizite data-sanity-Attribute; anschalten wäre nur der Fallback. */
  stega?: boolean;
}

const storage = new AsyncLocalStorage<PreviewContext>();

export function runWithPreview<T>(ctx: PreviewContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getPreviewContext(): PreviewContext | undefined {
  return storage.getStore();
}
