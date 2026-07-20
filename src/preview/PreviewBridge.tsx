import { useMemo } from 'react';
import { VisualEditing } from '@sanity/visual-editing/react';
import { baseIdOf } from '../lib/content/sections';
import { liveDocumentIds } from './live-docs';
import InsertPalette from './InsertPalette';
import MaxWidthResizer from './MaxWidthResizer';
import SpacingResizer from './SpacingResizer';
import CanvasKeyboard from './CanvasKeyboard';

/* ---------------------------------------------------------------------------
   Visual-Editing-Laufzeit der Vorschau - läuft auf JEDER Seite im Draft-Mode
   (BaseLayout via #preview-extras-Seam), unabhängig davon, ob die Seite eine
   Sections-Island hat. Ohne diese seitenweite Brücke meldet die Vorschau dem
   Studio NIE den aktuellen Pfad (enableVisualEditing ruft subscribe nur mit
   history-Adapter auf) → Presentation zeigt "No matching documents" und die
   URL-Leiste hängt - z. B. auf der 404-Seite oder Seiten ohne Sanity-Dokument.

   WICHTIG (Remarkable-Learning, Plan A.5): `useOptimistic` in der
   SectionsIsland liest einen Modul-globalen Actor, den <VisualEditing> hier
   setzt. Beide Islands importieren dieselben statischen Entries im selben
   Vite-Build → eine Modul-Instanz, ein Actor. Kein Lazy-Loading/dynamic()
   für irgendetwas aus @sanity/visual-editing einführen.
   --------------------------------------------------------------------------- */

const path = () => `${location.pathname}${location.search}`;

export default function PreviewBridge() {
  // History-Brücke Studio ↔ Vorschau. Astro ist eine MPA (volle Seitenwechsel):
  //  - subscribe: aktuelle Location beim Mount + bei Back/Forward melden.
  //  - update: Studio-gesteuerte Navigation als echten Seitenwechsel ausführen
  //    (Guard gegen Reload-Schleife, wenn die URL schon stimmt).
  const history = useMemo(
    () => ({
      subscribe: (navigate: (event: { type: 'push'; url: string }) => void) => {
        navigate({ type: 'push', url: path() });
        const report = () => navigate({ type: 'push', url: path() });
        window.addEventListener('popstate', report);
        return () => window.removeEventListener('popstate', report);
      },
      update: (update: { type: 'push' | 'replace' | 'pop'; url: string }) => {
        if (update.type === 'pop') {
          window.history.back();
        } else if (update.url !== path()) {
          window.location.href = update.url;
        }
      },
    }),
    [],
  );

  // Refresh-Politik: Mutationen an Dokumenten, die eine Live-Island dieser
  // Seite rendert, deckt deren Query ab - kein Reload (sonst blitzt nach jedem
  // Autosave der alte Stand auf). Alles andere (z. B. siteSettings →
  // Header/Footer) und manueller Refresh laden wie bisher voll neu.
  const refresh = (payload: { source: 'manual' | 'mutation'; document?: { _id?: string } }) => {
    if (payload.source === 'mutation' && liveDocumentIds.has(baseIdOf(payload.document?._id))) {
      return false;
    }
    window.location.reload();
    return new Promise<void>(() => {});
  };

  // InsertPalette (cmd+E) sitzt neben <VisualEditing> - beide lesen denselben
  // modul-globalen Optimistic-Actor (gleicher Vite-Build), also sieht die
  // Palette den Actor, den die Brücke setzt (kein React-Context nötig).
  return (
    <>
      <VisualEditing history={history} refresh={refresh} portal />
      <InsertPalette />
      <MaxWidthResizer />
      <SpacingResizer />
      <CanvasKeyboard />
    </>
  );
}
