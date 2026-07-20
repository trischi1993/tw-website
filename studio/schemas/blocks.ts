import {
  CONTENT_BLOCK_TYPES,
  EDITOR_BLOCKS,
  SECTION_BLOCK_TYPES,
  type EditorBlockCategory,
} from '../../shared/editor-blocks';

/**
 * Block-Registry: welcher Objekt-Typ ist eine „Section“ (Top-Level-Baustein
 * einer Seite, kommt ins `sections[]`-Array) bzw. eine „Component“ (nur in
 * Slots INNERHALB einer Section, nie top-level)?
 *
 * Die Trennung wird rein deklarativ über die `of[]`-Listen erzwungen
 * (`sections[]` listet nur Section-Typen, Components stehen nur in den `of[]`
 * INNERHALB einer Section) - eine Component kann so gar nicht als Section
 * eingefügt werden. Diese Registry liefert nur die Kategorie fürs Insert-Menü:
 * Farb-Punkt (grün/orange), Legende, ggf. Gruppen-Tabs.
 *
 * Neuen Typ ergänzen: hier eintragen UND den Schema-Typ in schemas/index.ts
 * registrieren (Sections zusätzlich implizit über sectionsField, das aus
 * SECTION_TYPES gespeist wird).
 */

export type BlockCategory = EditorBlockCategory;

export const BLOCK_CATEGORY: Record<string, BlockCategory> = Object.fromEntries(
  EDITOR_BLOCKS.map((block) => [block.type, block.category]),
);

export const CATEGORY_COLOR: Record<BlockCategory, string> = {
  section: '#43d675', // grün
  component: '#f5a623', // orange
};

export const CATEGORY_LABEL: Record<BlockCategory, string> = {
  section: 'Sections',
  component: 'Components',
};

export const SECTION_TYPES: string[] = [...SECTION_BLOCK_TYPES];

export const COMPONENT_TYPES: string[] = [...CONTENT_BLOCK_TYPES];

export function categoryOf(typeName: string): BlockCategory | undefined {
  return BLOCK_CATEGORY[typeName];
}
