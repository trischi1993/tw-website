import { defineField } from 'sanity';
import { CATEGORY_LABEL, SECTION_TYPES } from '../blocks';

/**
 * Geteiltes „Abschnitte“-Array für Startseite und Seiten. An EINER Stelle
 * konfiguriert (vorher in homePage.ts + page.ts dupliziert):
 *
 *  - erlaubte Typen: nur Section-Typen (aus SECTION_TYPES). Components leben in
 *    Slots INNERHALB einer Section, nie hier - dadurch per Konstruktion
 *    unmöglich, eine Component als Section einzufügen.
 *  - aufgewertetes natives Insert-Menü (@sanity/insert-menu): Suche, Grid/Liste,
 *    Typ-Icons mit Kategorie-Punkt; Gruppen-Tabs sobald es mehrere Typen gibt.
 *
 * cmd+E öffnet die Insert-Palette IM Vorschau-Canvas (src/preview/InsertPalette
 * .tsx, Muster aus flowtricks/remarkable), nicht hier im Formular - dort fügt
 * sie relativ zur Selektion ein und selektiert das neue Element. In der bloßen
 * Structure-Ansicht (ohne Vorschau) bleibt der sichtbare „Add item“-Button.
 *
 * Neuen Section-Typ hinzufügen: in schemas/blocks.ts als 'section' eintragen +
 * Schema-Typ in schemas/index.ts registrieren - hier ist nichts zu tun.
 */
export function sectionsField(overrides: { description?: string } = {}) {
  const groups =
    SECTION_TYPES.length > 1
      ? [{ name: 'sections', title: CATEGORY_LABEL.section, of: SECTION_TYPES }]
      : undefined;

  return defineField({
    name: 'sections',
    title: 'Abschnitte',
    description:
      overrides.description ??
      'Die Inhaltsblöcke, von oben nach unten. „Add item“ zum Einfügen (oder ⌘/Strg+E in der Vorschau); per Ziehen umsortieren.',
    type: 'array',
    of: SECTION_TYPES.map((name) => ({ type: name })),
    options: {
      insertMenu: {
        filter: 'auto',
        views: [{ name: 'list' }, { name: 'grid' }],
        ...(groups ? { groups } : {}),
      },
    },
    validation: (R) => R.required().min(1),
  });
}
