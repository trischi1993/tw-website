import { defineType, defineField } from 'sanity';
import { HeartIcon } from '@sanity/icons/Heart';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t, tOptions } from '../../uiLocale';
import type { SegmentedOption } from '../../../components/inputs/SegmentedInput';

/** Interessen: 2 Highlights + zwei endlose Wort-Laufbänder. */
export default defineType({
  name: 'sectionInterests',
  title: t({ en: 'Interests', de: 'Interessen + Laufband' }),
  type: 'object',
  icon: categoryIcon(HeartIcon, 'section'),
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
      name: 'introLine',
      title: t({ en: 'Intro line (optional)', de: 'Einleitungszeile (optional)' }),
      type: 'string',
    }),
    defineField({
      name: 'highlights',
      title: t({ en: 'Highlights', de: 'Highlights' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'highlight',
          fields: [
            defineField({
              name: 'icon',
              title: t({ en: 'Icon', de: 'Icon' }),
              type: 'string',
              initialValue: 'reisen',
              options: {
                layout: 'radio',
                list: tOptions([
                  { en: 'Travel', de: 'Reisen', value: 'reisen' },
                  { en: 'Learning', de: 'Weiterbildung', value: 'weiterbildung' },
                ]) as SegmentedOption[],
              },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'title',
              title: t({ en: 'Title', de: 'Titel' }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'text',
              title: t({ en: 'Text', de: 'Text' }),
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'text' },
          },
        },
      ],
    }),
    defineField({
      name: 'marquee1',
      title: t({ en: 'Marquee row 1 (words)', de: 'Laufband-Zeile 1 (Wörter)' }),
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'marquee2',
      title: t({ en: 'Marquee row 2 (words)', de: 'Laufband-Zeile 2 (Wörter)' }),
      type: 'array',
      of: [{ type: 'string' }],
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone' },
    prepare({ title, subtitle, tone }) {
      const typeLabel = t({ en: 'Interests', de: 'Interessen + Laufband' });
      return { title: title || subtitle || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
