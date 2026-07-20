import {
  EDITOR_BLOCKS,
  type EditorBlockCategory,
  type EditorBlockType,
} from '../../shared/editor-blocks';
import { randomKey } from './editor-ops';

export interface Insertable {
  type: string;
  title: string;
  category: EditorBlockCategory;
}

/** Shared with the Studio schema through shared/editor-blocks.ts. */
export const INSERTABLES: Insertable[] = EDITOR_BLOCKS.map((block) => ({
  type: block.type,
  title: block.title.de,
  category: block.category,
}));

function portableText(text: string) {
  return [
    {
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: randomKey(), text, marks: [] }],
    },
  ];
}

function heading() {
  return {
    _type: 'textHeading',
    _key: randomKey(),
    text: portableText('Heading'),
    level: 'h2',
    size: 'xl',
    textWrap: 'balance',
  };
}

function paragraph() {
  return {
    _type: 'textParagraph',
    _key: randomKey(),
    text: portableText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    size: 'md',
    color: 'default',
    textWrap: 'pretty',
    maxWidth: 60,
  };
}

/**
 * Canvas insertions bypass Sanity schema initial values, so every type gets a
 * complete, immediately visible value here.
 */
const INSERT_FACTORIES: Record<EditorBlockType, () => Record<string, unknown>> = {
  sectionText: () => ({
    _type: 'sectionText',
    _key: randomKey(),
    name: 'Text-Abschnitt',
    tone: 'light',
    align: 'left',
    content: [heading(), paragraph()],
  }),
  textEyebrow: () => ({ _type: 'textEyebrow', _key: randomKey(), text: 'Eyebrow' }),
  textHeading: heading,
  textParagraph: paragraph,
  cta: () => ({
    _type: 'cta',
    _key: randomKey(),
    label: 'Button',
    href: '#',
    variant: 'primary',
  }),
};

export function createInsertable(type: string): Record<string, unknown> | null {
  return type in INSERT_FACTORIES ? INSERT_FACTORIES[type as EditorBlockType]() : null;
}
