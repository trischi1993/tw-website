import { defineType, defineField } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { richTextField, ptToPlain } from '../text/richText';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** FAQ-Accordion (Plus/Minus, animierte Höhe). */
export default defineType({
  name: 'sectionFaq',
  title: t({ en: 'FAQ', de: 'FAQ' }),
  type: 'object',
  icon: categoryIcon(HelpCircleIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'items',
      title: t({ en: 'Questions', de: 'Fragen' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'question',
              title: t({ en: 'Question', de: 'Frage' }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            richTextField({ name: 'answer', title: t({ en: 'Answer', de: 'Antwort' }) }),
          ],
          preview: {
            select: { title: 'question', answer: 'answer' },
            prepare({ title, answer }) {
              return { title, subtitle: ptToPlain(answer) };
            },
          },
        },
      ],
      validation: (R) => R.required().min(1),
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone', items: 'items' },
    prepare({ title, subtitle, tone, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      const typeLabel = t({ en: 'FAQ', de: 'FAQ' });
      return {
        title: title || subtitle || typeLabel,
        subtitle: `${sectionSubtitle(typeLabel, tone)} · ${count}`,
      };
    },
  },
});
