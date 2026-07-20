import TextSection from './TextSection';
import type { Section } from '../../lib/content/types';

/**
 * Mappt das modulare `sections[]`-Array (Startseite + jede Seite) auf
 * Komponenten - der editierbare Page-Builder: Abschnitte sind sortier- und
 * wiederverwendbar, mit Farbton/Ausrichtung aus Sanity.
 *
 * React statt .astro, damit dieselbe Liste zweimal läuft:
 *  - Produktion: statisch zur Buildzeit gerendert (SectionsHost.astro,
 *    kein client:-Directive) → null React-JS im Output.
 *  - Vorschau: hydriert in der Live-Island (src/preview/SectionsIsland.tsx),
 *    die pro Tastenanschlag neue Daten aus dem Studio pusht.
 *
 * Der Starter liefert EINEN neutralen Abschnittstyp (sectionText). Pro Projekt
 * die Design-Abschnitte ergänzen: neuer case hier, Komponente daneben,
 * Studio-Schema + Registrierung, Projektion/Mapper in lib/content/sections.ts,
 * Typ in lib/content/types.ts.
 */

/** data-sanity-Attribute für einen GROQ-Pfad - nur in der Vorschau gesetzt. */
export type EditAttr = (path: string) => Record<string, string> | undefined;

export default function SectionsList({
  sections,
  edit,
}: {
  sections: Section[];
  edit?: EditAttr;
}) {
  return (
    <>
      {sections.map((s) => {
        switch (s._type) {
          case 'sectionText':
            return <TextSection key={s._key} section={s} edit={edit} />;
          default:
            return null;
        }
      })}
    </>
  );
}
