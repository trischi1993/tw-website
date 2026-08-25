import { defineType, defineField } from 'sanity';
import { BarChartIcon } from '@sanity/icons/BarChart';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** Startseiten-Carousel mit Tristans eigenen Erfolgen und Kundenerfolgen. */
export default defineType({
  name: 'sectionResults',
  title: t({ en: 'Own & customer results', de: 'Meine Erfolge & Kundenerfolge' }),
  type: 'object',
  icon: categoryIcon(BarChartIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      description: t({
        en: 'The compact heading above the carousel.',
        de: 'Die kompakte Überschrift oberhalb des Carousels.',
      }),
      type: 'string',
      initialValue: 'Lass Ergebnisse aus der Praxis sprechen.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ownLabel',
      title: t({ en: 'Own results label', de: 'Label „Meine Erfolge“' }),
      type: 'string',
      initialValue: 'Meine Erfolge',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'customerLabel',
      title: t({ en: 'Customer results label', de: 'Label „Kundenerfolge“' }),
      type: 'string',
      initialValue: 'Kundenerfolge',
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading' },
    prepare({ title, subtitle }) {
      const typeLabel = t({ en: 'Own & customer results', de: 'Meine Erfolge & Kundenerfolge' });
      return { title: title || typeLabel, subtitle: subtitle || typeLabel };
    },
  },
});
