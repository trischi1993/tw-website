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
  { type: 'sectionText', title: { de: 'Text-Abschnitt', en: 'Text section' }, category: 'section' },
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
