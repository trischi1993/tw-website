/// <reference types="astro/client" />

/**
 * Die Seiten importieren den Sections-Host über den Subpath `#sections-host`
 * (package.json → "imports"). Diese Deklaration gibt ihm einen Typ, damit
 * `astro check` nicht meckert. Aufgelöst wird er in Produktion auf den
 * statischen Host, im Vorschau-Build per Alias auf den Live-Island-Host.
 */
declare module '#sections-host' {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}

/**
 * Gleiches Seam-Muster für die seitenweite Vorschau-Laufzeit: in Produktion
 * eine leere Komponente, im Vorschau-Build die Visual-Editing-Brücke.
 */
declare module '#preview-extras' {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
