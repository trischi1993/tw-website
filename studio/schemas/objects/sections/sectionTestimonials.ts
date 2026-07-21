import { defineType, defineField } from 'sanity';
import { CommentIcon } from '@sanity/icons/Comment';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Testimonials: zweilagige Banner-Headline + 3er-Grid + „Mehr laden".
 * Die Karten kommen automatisch aus der Sammlung „Testimonials".
 */
export default defineType({
  name: 'sectionTestimonials',
  title: t({ en: 'Testimonials', de: 'Testimonials' }),
  type: 'object',
  icon: categoryIcon(CommentIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading (banner)', de: 'Überschrift (Laufband)' }),
      description: t({
        en: 'The large two-layer banner headline above the grid.',
        de: 'Die große zweilagige Banner-Headline über dem Raster.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'loadMoreLabel',
      title: t({ en: 'Button label: load more', de: 'Button-Text: Mehr laden' }),
      type: 'string',
      initialValue: 'Mehr Testimonials laden',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'initialCount',
      title: t({ en: 'Cards shown initially', de: 'Anfangs sichtbare Karten' }),
      description: t({ en: 'Original: 3.', de: 'Original: 3.' }),
      type: 'number',
      initialValue: 3,
      validation: (R) => R.integer().min(1),
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone' },
    prepare({ title, subtitle, tone }) {
      const typeLabel = t({ en: 'Testimonials', de: 'Testimonials' });
      return { title: title || subtitle || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
