import { defineField, type NumberOptions } from 'sanity';
import { SegmentedInput, type SegmentedOption } from '../../../components/inputs/SegmentedInput';
import { RangeSliderInput } from '../../../components/inputs/RangeSliderInput';
import { t, tOptions } from '../../uiLocale';

/* ---------------------------------------------------------------------------
   Wiederverwendbare Text-Element-Controls (heading + paragraph). Liegen AM
   Element (nicht an der Section) - jede Überschrift/jeder Absatz trägt sie selbst
   und ist im Canvas anklickbar (remarkable-Modell). Kleine Segmented-Buttons +
   Tooltip (kein Dropdown mit langer Erklärung); Default schon ausgewählt.
   Labels bilingual über t()/tOptions (Default EN, DE via SANITY_STUDIO_UI_LOCALE).
   Der Renderer mappt Token → CSS-Klasse/Var (src/lib/content/sections.ts).
   --------------------------------------------------------------------------- */

/** ch-Grenzen der Lese-Breite. Auch von der Phase-C-Canvas-Resize genutzt
 *  (dort in src/ gespiegelt halten). */
export const CH_MAX_WIDTH = {
  heading: { min: 8, max: 40, step: 0.5 },
  paragraph: { min: 20, max: 90, step: 1 },
} as const;

/** Semantische Ebene (h1-h6) als kleine Buttons - reine SEO/Struktur-Ebene,
 *  getrennt von der visuellen Größe. Erste Section = H1, weitere = H2 usw. */
export const levelField = defineField({
  name: 'level',
  title: t({ en: 'Semantic level', de: 'Semantische Ebene' }),
  description: t({
    en: 'The HTML tag (h1–h6) for SEO / structure — independent of the visual size. Use exactly one H1 per page (usually the first section).',
    de: 'Das HTML-Tag (h1–h6) für SEO / Struktur — unabhängig von der optischen Größe. Genau EIN H1 pro Seite (meist der erste Abschnitt).',
  }),
  type: 'string',
  initialValue: 'h2',
  options: {
    list: (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((v) => ({
      title: v.toUpperCase(),
      value: v,
    })) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/** Visuelle Größe der Überschrift (sm-4xl) - getrennt von der Ebene. */
export const headingSizeField = defineField({
  name: 'size',
  title: t({ en: 'Visual size', de: 'Optische Größe' }),
  description: t({
    en: 'How large the heading looks. Independent of the semantic level above.',
    de: 'Wie groß die Überschrift aussieht. Unabhängig von der semantischen Ebene darüber.',
  }),
  type: 'string',
  initialValue: 'xl',
  options: {
    list: tOptions([
      { en: 'Small', de: 'Klein', value: 'sm' },
      { en: 'Medium', de: 'Mittel', value: 'md' },
      { en: 'Large', de: 'Groß', value: 'lg' },
      { en: 'XL', value: 'xl' },
      { en: '2XL', value: '2xl' },
      { en: '3XL', value: '3xl' },
      { en: '4XL — Display', value: '4xl' },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/** Visuelle Größe des Absatzes (sm-xl). */
export const paragraphSizeField = defineField({
  name: 'size',
  title: t({ en: 'Visual size', de: 'Optische Größe' }),
  description: t({ en: 'Font size of this paragraph.', de: 'Schriftgröße dieses Absatzes.' }),
  type: 'string',
  initialValue: 'md',
  options: {
    list: tOptions([
      { en: 'Small', de: 'Klein', value: 'sm' },
      { en: 'Medium', de: 'Mittel', value: 'md' },
      { en: 'Large', de: 'Groß', value: 'lg' },
      { en: 'XL', value: 'xl' },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/** Textfarbe (theme-aware Surface-Tokens): normal / gedämpft / Akzent. */
export const colorField = defineField({
  name: 'color',
  title: t({ en: 'Color', de: 'Farbe' }),
  description: t({
    en: 'Text colour. Follows the section theme automatically.',
    de: 'Textfarbe. Folgt automatisch dem Farbschema des Abschnitts.',
  }),
  type: 'string',
  initialValue: 'default',
  options: {
    list: tOptions([
      { en: 'Default', de: 'Normal', value: 'default' },
      { en: 'Muted', de: 'Gedämpft', value: 'muted' },
      { en: 'Brand', de: 'Marke', value: 'brand' },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});

/** Zeilenumbruch (balance/pretty/none). initial je nach Element. */
export const textWrapField = (initial: 'balance' | 'pretty' | 'none') =>
  defineField({
    name: 'textWrap',
    title: t({ en: 'Text wrap', de: 'Zeilenumbruch' }),
    description: t({
      en: 'Balance evens out line lengths; Pretty avoids a lone last word. Switch off if it looks worse.',
      de: 'Ausbalanciert gleicht die Zeilenlängen aus; Sauber vermeidet ein einzelnes letztes Wort. Aus, wenn es schlechter aussieht.',
    }),
    type: 'string',
    initialValue: initial,
    options: {
      list: tOptions([
        { en: 'Balance', de: 'Ausbalanciert', value: 'balance' },
        { en: 'Pretty', de: 'Sauber', value: 'pretty' },
        { en: 'None', de: 'Aus', value: 'none' },
      ]) as SegmentedOption[],
    },
    components: { input: SegmentedInput },
  });

/** Lese-Breite in `ch` (Measure) als Slider. Bewusst FREIFORM (kein Token),
 *  laut Mandat erlaubt. `kind` wählt die Grenzen; `defaultCh` optional. */
export const maxWidthField = (kind: keyof typeof CH_MAX_WIDTH, defaultCh?: number) => {
  const b = CH_MAX_WIDTH[kind];
  return defineField({
    name: 'maxWidth',
    title: t({ en: 'Max width', de: 'Textbreite' }),
    description: t({
      en: 'Maximum line length, measured in characters (ch). Drag past the end for Auto (full width).',
      de: 'Maximale Zeilenlänge, in Zeichen gemessen (ch). Über das Ende hinaus = Auto (volle Breite).',
    }),
    type: 'number',
    ...(typeof defaultCh === 'number' ? { initialValue: defaultCh } : {}),
    // min/max/step liest der RangeSliderInput zur Laufzeit → Cast.
    options: {
      min: b.min,
      max: b.max,
      step: b.step,
      suffix: 'ch',
      allowUnset: true,
      unsetLabel: 'Auto',
    } as NumberOptions,
    components: { input: RangeSliderInput },
  });
};

/** Unterer Abstand (Spacing-Token) als kleine Buttons. `none` (=0) ist der
 *  Default → der SegmentedInput markiert „None" sofort blau (statt „nichts
 *  ausgewählt"), obwohl das Feld bis zur ersten Wahl unset bleibt. */
export const marginBottomField = defineField({
  name: 'marginBottom',
  title: t({ en: 'Bottom margin', de: 'Abstand unten' }),
  description: t({
    en: 'Extra space below this element, from the spacing scale.',
    de: 'Zusätzlicher Abstand unter diesem Element, aus der Abstands-Skala.',
  }),
  type: 'string',
  initialValue: 'none',
  options: {
    list: tOptions([
      { en: 'None', de: 'Kein', value: 'none' },
      { en: 'XS', value: 'xs' },
      { en: 'SM', value: 'sm' },
      { en: 'MD', value: 'md' },
      { en: 'LG', value: 'lg' },
      { en: 'XL', value: 'xl' },
      { en: '2XL', value: '2xl' },
      { en: '3XL', value: '3xl' },
    ]) as SegmentedOption[],
  },
  components: { input: SegmentedInput },
});
