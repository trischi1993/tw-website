import { defineType, defineField } from 'sanity';
import { TimelineIcon } from '@sanity/icons/Timeline';
import { nameField, anchorField } from './shared';
import { richTextField, ptToPlain } from '../text/richText';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Werdegang-Timeline (Layout-Section): horizontaler Pin-Scroll mit Stationen
 * (Original: 9). Layout fest verdrahtet.
 */
export default defineType({
  name: 'sectionTimeline',
  title: t({ en: 'Timeline', de: 'Werdegang-Timeline' }),
  type: 'object',
  icon: categoryIcon(TimelineIcon, 'section'),
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
      title: t({ en: 'Stations', de: 'Stationen' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'year',
              title: t({ en: 'Year', de: 'Jahr' }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'title',
              title: t({ en: 'Title', de: 'Titel' }),
              description: t({
                en: 'Line breaks are kept.',
                de: 'Zeilenumbrüche bleiben erhalten.',
              }),
              type: 'text',
              rows: 2,
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'titleSmall',
              title: t({ en: 'Smaller title', de: 'Kleinerer Titel' }),
              type: 'boolean',
              initialValue: false,
            }),
            richTextField({ name: 'description', title: t({ en: 'Description', de: 'Beschreibung' }) }),
            defineField({
              name: 'image',
              title: t({ en: 'Image', de: 'Bild' }),
              type: 'imageWithAlt',
            }),
          ],
          preview: {
            select: { title: 'year', subtitle: 'title', media: 'image', description: 'description' },
            prepare({ title, subtitle, media, description }) {
              return { title, subtitle: subtitle || ptToPlain(description), media };
            },
          },
        },
      ],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', items: 'items' },
    prepare({ title, subtitle, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      const typeLabel = t({ en: 'Timeline', de: 'Werdegang-Timeline' });
      return { title: title || subtitle || typeLabel, subtitle: `${typeLabel} · ${count}` };
    },
  },
});
