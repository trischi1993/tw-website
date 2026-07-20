/**
 * Registry der Dokumente, die auf der aktuellen Seite von einer Live-Island
 * gerendert werden. Brücke zwischen den zwei Preview-Islands:
 *
 *  - `SectionsIsland` registriert beim Mount seine documentId,
 *  - `PreviewBridge` (Refresh-Politik) überspringt den Full-Reload für
 *    Mutationen an registrierten Dokumenten - die deckt die Live-Query ab.
 *
 * Funktioniert, weil beide Islands im selben Vite-Client-Build stecken:
 * Rollup garantiert EINE Modul-Instanz pro Build, auch über Chunk-Grenzen.
 * Fail-open: Ist die Island noch nicht registriert (Race beim Mount), gibt es
 * schlimmstenfalls einen überflüssigen Reload - nie einen verpassten Update.
 */
export const liveDocumentIds = new Set<string>();

/**
 * Das eine Sections-Dokument, das die aktuelle Vorschau-Seite bearbeitet -
 * gesetzt von `SectionsIsland` beim Mount. Die cmd+E-Palette (InsertPalette)
 * liest daraus Ziel-Id und -Typ fürs Einfügen, ohne das angeklickte Element
 * dekodieren zu müssen (eine Seite = ein Sections-Dokument). Holder-Objekt statt
 * `export let`, damit Leser immer den aktuellen Wert sehen. Fail-open: ist noch
 * nichts gesetzt (kein Island gemountet), tut die Palette nichts.
 */
export const activePreviewDoc: { current: { id: string; type: string } | null } = {
  current: null,
};
