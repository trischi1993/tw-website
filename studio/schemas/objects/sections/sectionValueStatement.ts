import { defineType, defineField } from 'sanity';
import { DoubleQuoteIcon } from '@sanity/icons/DoubleQuote';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** Großes Statement (Zeilen-Reveal-Animation beim Scrollen). */
export default defineType({
  name: 'sectionValueStatement',
  title: t({ en: 'Value statement', de: 'Großes Statement' }),
  type: 'object',
  icon: categoryIcon(DoubleQuoteIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'text',
      title: t({ en: 'Statement', de: 'Statement' }),
      description: t({
        en: 'The large statement, revealed line by line while scrolling.',
        de: 'Das große Statement, beim Scrollen Zeile für Zeile eingeblendet.',
      }),
      type: 'text',
      rows: 4,
      validation: (R) => R.required(),
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', tone: 'tone', text: 'text' },
    prepare({ title, tone, text }) {
      const typeLabel = t({ en: 'Value statement', de: 'Großes Statement' });
      return { title: title || text || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
