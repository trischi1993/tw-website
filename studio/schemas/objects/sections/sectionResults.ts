import { defineType, defineField } from 'sanity';
import { BarChartIcon } from '@sanity/icons/BarChart';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * „Zahlen & Fakten" (Layout-Section): geprägter Titel + aufgefächerte
 * Beweis-Karten (Scroll-Animation). Layout fest verdrahtet.
 */
export default defineType({
  name: 'sectionResults',
  title: t({ en: 'Results cards', de: 'Zahlen & Fakten' }),
  type: 'object',
  icon: categoryIcon(BarChartIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'title',
      title: t({ en: 'Title', de: 'Titel' }),
      description: t({
        en: 'The embossed background title behind the cards.',
        de: 'Der geprägte Hintergrund-Titel hinter den Karten.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'images',
      title: t({ en: 'Proof cards', de: 'Beweis-Karten' }),
      description: t({
        en: 'The screenshots fanned out while scrolling (original: 4).',
        de: 'Die Screenshots, die beim Scrollen aufgefächert werden (Original: 4).',
      }),
      type: 'array',
      of: [{ type: 'imageWithAlt' }],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'title', images: 'images' },
    prepare({ title, subtitle, images }) {
      const count = Array.isArray(images) ? images.length : 0;
      const typeLabel = t({ en: 'Results cards', de: 'Zahlen & Fakten' });
      return { title: title || typeLabel, subtitle: `${subtitle ?? typeLabel} · ${count}` };
    },
  },
});
