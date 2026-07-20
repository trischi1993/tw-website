/**
 * Single registry for every block editors may insert. The Studio schema and the
 * Presentation command palette both derive their lists from this file.
 */
export type EditorBlockCategory = 'section' | 'component';

export interface EditorBlockDefinition {
  type: string;
  title: { de: string; en: string };
  category: EditorBlockCategory;
}

export const EDITOR_BLOCKS = [
  /* --- Sections (Top-Level-Bausteine einer Seite) -------------------------- */
  { type: 'sectionText', title: { de: 'Text-Abschnitt', en: 'Text section' }, category: 'section' },
  { type: 'sectionHomeHero', title: { de: 'Hero (Startseite)', en: 'Home hero' }, category: 'section' },
  { type: 'sectionValueStatement', title: { de: 'Großes Statement', en: 'Value statement' }, category: 'section' },
  { type: 'sectionResults', title: { de: 'Zahlen & Fakten', en: 'Results cards' }, category: 'section' },
  { type: 'sectionSplitCta', title: { de: 'Text + Bild mit CTA', en: 'Split CTA' }, category: 'section' },
  { type: 'sectionServicesTabs', title: { de: 'Coachings (Tabs)', en: 'Services tabs' }, category: 'section' },
  { type: 'sectionGalleryMarquee', title: { de: 'Bild-Galerie (Laufband)', en: 'Gallery marquee' }, category: 'section' },
  { type: 'sectionUspList', title: { de: 'USP-Liste', en: 'USP list' }, category: 'section' },
  { type: 'sectionTestimonials', title: { de: 'Testimonials', en: 'Testimonials' }, category: 'section' },
  { type: 'sectionFaq', title: { de: 'FAQ', en: 'FAQ' }, category: 'section' },
  { type: 'sectionVideoHero', title: { de: 'Hero mit Video (AIO)', en: 'Video hero' }, category: 'section' },
  { type: 'sectionModule', title: { de: 'Programm-Abschnitt (Modul)', en: 'Program module' }, category: 'section' },
  { type: 'sectionBonuses', title: { de: 'Bonusse', en: 'Bonuses' }, category: 'section' },
  { type: 'sectionFinalCta', title: { de: 'Abschluss-CTA', en: 'Final CTA' }, category: 'section' },
  { type: 'sectionPortraitHero', title: { de: 'Hero mit Portrait (Über mich)', en: 'Portrait hero' }, category: 'section' },
  { type: 'sectionTimeline', title: { de: 'Werdegang-Timeline', en: 'Timeline' }, category: 'section' },
  { type: 'sectionInterests', title: { de: 'Interessen + Laufband', en: 'Interests' }, category: 'section' },
  { type: 'sectionPageHeader', title: { de: 'Seitenkopf', en: 'Page header' }, category: 'section' },
  { type: 'sectionRichText', title: { de: 'Rich Text (Rechtstext)', en: 'Rich text' }, category: 'section' },

  /* --- Components (nur innerhalb einer Section) ---------------------------- */
  { type: 'textEyebrow', title: { de: 'Überzeile', en: 'Eyebrow' }, category: 'component' },
  { type: 'textHeading', title: { de: 'Überschrift', en: 'Heading' }, category: 'component' },
  { type: 'textParagraph', title: { de: 'Textabsatz', en: 'Paragraph' }, category: 'component' },
  { type: 'cta', title: { de: 'CTA-Button', en: 'CTA button' }, category: 'component' },
] as const satisfies readonly EditorBlockDefinition[];

export type EditorBlockType = (typeof EDITOR_BLOCKS)[number]['type'];

export const SECTION_BLOCK_TYPES = EDITOR_BLOCKS.filter(
  (block) => block.category === 'section',
).map((block) => block.type);

export const CONTENT_BLOCK_TYPES = EDITOR_BLOCKS.filter(
  (block) => block.category === 'component',
).map((block) => block.type);
