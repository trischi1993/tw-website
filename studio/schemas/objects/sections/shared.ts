import { defineField } from 'sanity';
import { SegmentedInput, type SegmentedOption } from '../../../components/inputs/SegmentedInput';
import { t, tOptions } from '../../uiLocale';

/* --- Identität: interner Name + optionaler Anker (#id) -------------------- */

/** Interner Name - nur im Studio (Abschnittsliste, Vorschau-Titel). */
export const nameField = defineField({
  name: 'name',
  title: t({ en: 'Internal name', de: 'Interner Name' }),
  description: t({
    en: 'Only shown here in the Studio, to help you find this section.',
    de: 'Nur hier im Studio, damit du den Abschnitt wiederfindest.',
  }),
  type: 'string',
  initialValue: 'Section',
});

/** Optionale Anker-ID: gesetzt → `<section id>` für #-Sprunglinks (z. B. Navi).
 *  „Generieren" leitet sie aus dem internen Namen ab. */
export const anchorField = defineField({
  name: 'anchor',
  title: t({ en: 'Anchor ID (optional)', de: 'Anker-ID (optional)' }),
  description: t({
    en: 'Set to jump to this section with #id (e.g. from the navigation). “Generate” derives it from the internal name.',
    de: 'Setzen, um per #id zu diesem Abschnitt zu springen (z. B. aus der Navigation). „Generieren“ leitet sie aus dem internen Namen ab.',
  }),
  type: 'slug',
  options: { source: 'name' },
});

/* ---------------------------------------------------------------------------
   Geteilte SECTION-Level-Controls (Farbton, Abstände, Ausrichtung, volle Höhe).
   JEDE Section erbt denselben Satz - einmal ins Template, nicht pro Kunde neu.
   Alles ist ein TOKEN; der Renderer mappt Token → CSS-Var/-Klasse
   (src/lib/content/sections.ts). Flach, KEINE Tabs (Julian: „auf All fields sehen").
   Segmented-Buttons + Hover-Preview über SegmentedInput; Beschreibung als Tooltip.
   Labels bilingual (Default EN, DE via SANITY_STUDIO_UI_LOCALE).

   Text-Controls (Größe/Ebene/Farbe/Umbruch/Breite) liegen NICHT hier, sondern
   am jeweiligen Text-Element (schemas/objects/text/*).
   --------------------------------------------------------------------------- */

/** „Farbton“ (Surface-Theme). Ein Klassen-Flip; alle Kinder folgen den Tokens. */
export const toneField = defineField({
  name: 'tone',
  title: t({ en: 'Theme', de: 'Farbton' }),
  description: t({
    en: 'Background of this section. Hover an option to preview it live.',
    de: 'Hintergrund dieses Abschnitts. Fahre über eine Option für die Live-Vorschau.',
  }),
  type: 'string',
  initialValue: 'light',
  options: {
    list: tOptions([
      { en: 'Light', de: 'Hell', value: 'light', description: { en: 'Default: light ground, dark text.', de: 'Standard: heller Grund, dunkler Text.' } },
      { en: 'Light (alt)', de: 'Hell (alt.)', value: 'alt', description: { en: 'Slightly offset light ground — gentle rhythm between two light sections.', de: 'Leicht abgesetzter heller Grund — sanfter Rhythmus zwischen zwei hellen Abschnitten.' } },
      { en: 'Dark', de: 'Dunkel', value: 'dark', description: { en: 'Accent section: dark ground, light text. Content follows automatically.', de: 'Akzent-Abschnitt: dunkler Grund, heller Text. Inhalte folgen automatisch.' } },
      { en: 'Brand', de: 'Marke', value: 'brand', description: { en: 'Section in the brand colour: coloured ground, light text.', de: 'Abschnitt in der Markenfarbe: farbige Fläche, heller Text.' } },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/** Horizontale Ausrichtung des Inhalts (kaskadiert via --alignment auf alle Kinder). */
export const alignField = defineField({
  name: 'align',
  title: t({ en: 'Horizontal alignment', de: 'Horizontale Ausrichtung' }),
  description: t({
    en: 'Horizontal alignment of the section content. Hover to preview.',
    de: 'Horizontale Ausrichtung des Abschnitts-Inhalts. Hover zeigt die Wirkung.',
  }),
  type: 'string',
  initialValue: 'left',
  options: {
    list: tOptions([
      { en: 'Left', de: 'Links', value: 'left', description: { en: 'Left-aligned — calm, good for longer copy.', de: 'Linksbündig — ruhig, gut für längere Texte.' } },
      { en: 'Center', de: 'Zentriert', value: 'center', description: { en: 'Centered — for short, punchy sections.', de: 'Zentriert — für kurze, plakative Abschnitte.' } },
      { en: 'Right', de: 'Rechts', value: 'right', description: { en: 'Right-aligned — for asymmetric or RTL-leaning layouts.', de: 'Rechtsbündig — für asymmetrische Layouts.' } },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/* --- Vertikaler Abstand (Padding); pageTop nur oben (Platz für fixe Kopfzeile) */
const paddingTopOptions = tOptions([
  { en: 'None', de: 'Kein', value: 'none', description: { en: 'No top padding — flush.', de: 'Kein Abstand oben — bündig.' } },
  { en: 'Even', de: 'Bündig', value: 'even', description: { en: 'Same as the horizontal inset — for fully framed sections.', de: 'Gleich dem Seitenrand — für rundum umrahmte Abschnitte.' } },
  { en: 'Small', de: 'Klein', value: 'small', description: { en: 'Compact.', de: 'Kompakt.' } },
  { en: 'Medium', de: 'Mittel', value: 'medium', description: { en: 'Default.', de: 'Standard.' } },
  { en: 'Large', de: 'Groß', value: 'large', description: { en: 'Generous, for calm prominent sections.', de: 'Großzügig, für ruhige prominente Abschnitte.' } },
  { en: 'Page top', de: 'Seitenanfang', value: 'pageTop', description: { en: 'Clears a fixed header — for the first section (top only).', de: 'Platz für die feste Kopfzeile — für den ersten Abschnitt (nur oben).' } },
]) as SegmentedOption[];
const paddingBottomOptions = paddingTopOptions.filter((o) => o.value !== 'pageTop');

export const paddingTopField = defineField({
  name: 'paddingTop',
  title: t({ en: 'Padding top', de: 'Abstand oben' }),
  description: t({ en: 'Vertical padding at the top edge.', de: 'Vertikaler Abstand am oberen Rand.' }),
  type: 'string',
  initialValue: 'medium',
  options: { list: paddingTopOptions },
  components: { input: SegmentedInput },
});

export const paddingBottomField = defineField({
  name: 'paddingBottom',
  title: t({ en: 'Padding bottom', de: 'Abstand unten' }),
  description: t({ en: 'Vertical padding at the bottom edge.', de: 'Vertikaler Abstand am unteren Rand.' }),
  type: 'string',
  initialValue: 'medium',
  options: { list: paddingBottomOptions },
  components: { input: SegmentedInput },
});

/* --- Abstand zwischen den Blöcken der Section (Gap) ----------------------- */
export const gapField = defineField({
  name: 'gap',
  title: t({ en: 'Gap', de: 'Innenabstand' }),
  description: t({
    en: 'Space between the blocks of this section. None = blocks touch (work with per-element margins instead).',
    de: 'Abstand zwischen den Blöcken dieses Abschnitts. Kein = Blöcke stoßen an (stattdessen mit Element-Abständen arbeiten).',
  }),
  type: 'string',
  initialValue: 'md',
  options: {
    list: tOptions([
      { en: 'None', de: 'Kein', value: 'none' },
      { en: 'XS', value: 'xs' },
      { en: 'SM', value: 'sm' },
      { en: 'MD', value: 'md' },
      { en: 'LG', value: 'lg' },
      { en: 'XL', value: 'xl' },
      { en: '2XL', value: '2xl' },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/* --- Volle Bildschirmhöhe ------------------------------------------------ */
export const fullHeightField = defineField({
  name: 'fullHeight',
  title: t({ en: 'Full viewport height', de: 'Volle Bildschirmhöhe' }),
  description: t({
    en: 'Section fills at least the full viewport height and centres its content — for hero sections.',
    de: 'Abschnitt füllt mindestens die volle Sichthöhe und zentriert den Inhalt — für Hero-Abschnitte.',
  }),
  type: 'boolean',
  initialValue: false,
});

/**
 * Geteilter Section-Layout-Block, in der remarkable-Reihenfolge: Padding oben,
 * Padding unten, Horizontale Ausrichtung, Gap, Volle Höhe. Jede Section spreizt
 * ihn nach dem Theme (tone) ihrer Style-Felder ein.
 */
export const sectionStyleFields = [
  paddingTopField,
  paddingBottomField,
  alignField,
  gapField,
  fullHeightField,
];

const TONE_LABEL: Record<string, string> = {
  light: t({ en: 'Light', de: 'Hell' }),
  alt: t({ en: 'Light (alt)', de: 'Hell (alt.)' }),
  dark: t({ en: 'Dark', de: 'Dunkel' }),
  brand: t({ en: 'Brand', de: 'Marke' }),
};

/** Hilfstext für die Vorschau: Abschnittstyp + ggf. Farbton. */
export function sectionSubtitle(typeLabel: string, tone?: string): string {
  const label = tone && TONE_LABEL[tone] ? ` · ${TONE_LABEL[tone]}` : '';
  return `${typeLabel}${label}`;
}
