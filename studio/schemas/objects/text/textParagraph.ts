import { defineType } from 'sanity';
import { BlockquoteIcon } from '@sanity/icons/Blockquote';
import { paragraphSizeField, colorField, textWrapField, maxWidthField, marginBottomField } from './controls';
import { richTextField, ptToPlain } from './richText';
import { t } from '../../uiLocale';

/**
 * Wiederverwendbarer Absatz. Jeder Absatz ist ein eigenes, im Canvas anklickbares
 * Element mit eigenen Controls (Größe, Farbe, Zeilenumbruch, Breite, Abstand) -
 * so lässt sich Text je nach Länge breiter/schmaler stellen (Julians Wunsch).
 * Als Block-Typ in der `content`-Liste einer Section. Der Text ist Rich Text
 * (Bold/Italic/Link inline; der PT-Editor wächst mit dem Text - siehe richText).
 */
export default defineType({
  name: 'textParagraph',
  title: t({ en: 'Paragraph', de: 'Absatz' }),
  type: 'object',
  icon: BlockquoteIcon,
  // Breiter Dialog statt schmaler Pane → Rich-Text-Toolbar (Bold/Italic/Link)
  // steht inline statt im „…"-Overflow (siehe textHeading).
  options: { modal: { type: 'dialog', width: 2 } },
  fields: [
    richTextField(),
    paragraphSizeField,
    colorField,
    textWrapField('pretty'),
    maxWidthField('paragraph', 60), // Default 60 ch (gut lesbar)
    marginBottomField,
  ],
  preview: {
    select: { title: 'text', size: 'size' },
    prepare({ title, size }) {
      const s = ptToPlain(title);
      return {
        title: s || t({ en: 'Paragraph', de: 'Absatz' }),
        subtitle: `${t({ en: 'Paragraph', de: 'Absatz' })} · ${(size || 'md').toUpperCase()}`,
      };
    },
  },
});
