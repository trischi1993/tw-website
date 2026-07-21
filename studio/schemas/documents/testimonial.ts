import { defineType, defineField } from 'sanity';
import { DoubleQuoteIcon } from '@sanity/icons/DoubleQuote';
import { t } from '../uiLocale';

/**
 * TESTIMONIAL (Sammlung „Testimonials"). Die Karten der Testimonial-Section
 * kommen automatisch aus dieser Sammlung, sortiert über „Reihenfolge"
 * (ohne Wert → ans Ende).
 */
export default defineType({
  name: 'testimonial',
  title: t({ en: 'Testimonial', de: 'Testimonial' }),
  type: 'document',
  icon: DoubleQuoteIcon,
  fields: [
    defineField({
      name: 'name',
      title: t({ en: 'Name', de: 'Name' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'role',
      title: t({ en: 'Role / context', de: 'Tätigkeit / Kontext' }),
      description: t({
        en: 'E.g. “Mentor & influencer (18,000+ followers)”.',
        de: 'Z. B. „Mentorin & Influencerin (18.000+ Follower)".',
      }),
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: t({ en: 'Quote', de: 'Zitat' }),
      type: 'text',
      rows: 6,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Photo', de: 'Foto' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'order',
      title: t({ en: 'Order', de: 'Reihenfolge' }),
      description: t({
        en: 'Ascending; empty → at the end.',
        de: 'Aufsteigend; leer → ans Ende.',
      }),
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: t({ en: 'Order', de: 'Reihenfolge' }),
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
});
