import { defineType, defineField } from 'sanity';
import { UlistIcon } from '@sanity/icons/Ulist';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** USP-Liste: zweispaltige Zeilen mit animierten Trennlinien. */
export default defineType({
  name: 'sectionUspList',
  title: t({ en: 'USP list', de: 'USP-Liste' }),
  type: 'object',
  icon: categoryIcon(UlistIcon, 'section'),
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
      title: t({ en: 'Entries', de: 'Einträge' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'lead',
              title: t({ en: 'Lead-in (left, optional)', de: 'Stichwort (links, optional)' }),
              type: 'string',
            }),
            defineField({
              name: 'text',
              title: t({ en: 'Text', de: 'Text' }),
              type: 'text',
              rows: 2,
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'lead', subtitle: 'text' },
            prepare({ title, subtitle }) {
              return { title: title || subtitle, subtitle: title ? subtitle : undefined };
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
      const typeLabel = t({ en: 'USP list', de: 'USP-Liste' });
      return {
        title: title || subtitle || typeLabel,
        subtitle: `${sectionSubtitle(typeLabel, tone)} · ${count}`,
      };
    },
  },
});
