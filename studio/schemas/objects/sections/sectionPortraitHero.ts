import { defineType, defineField, type Rule } from 'sanity';
import { UserIcon } from '@sanity/icons/User';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t, tOptions } from '../../uiLocale';
import type { SegmentedOption } from '../../../components/inputs/SegmentedInput';

/**
 * Über-mich-Hero (Layout-Section): Vorstellungstext + Portrait (2:3) +
 * Social-Icons. Layout fest verdrahtet.
 */
export default defineType({
  name: 'sectionPortraitHero',
  title: t({ en: 'Portrait hero', de: 'Hero mit Portrait (Über mich)' }),
  type: 'object',
  icon: categoryIcon(UserIcon, 'section'),
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
      name: 'intro',
      title: t({ en: 'Intro text', de: 'Vorstellungstext' }),
      type: 'text',
      rows: 5,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Portrait', de: 'Portrait' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'socials',
      title: t({ en: 'Social profiles', de: 'Social-Profile' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'social',
          fields: [
            defineField({
              name: 'platform',
              title: t({ en: 'Platform', de: 'Plattform' }),
              type: 'string',
              initialValue: 'instagram',
              options: {
                layout: 'radio',
                list: tOptions([
                  { en: 'Instagram', value: 'instagram' },
                  { en: 'LinkedIn', value: 'linkedin' },
                ]) as SegmentedOption[],
              },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'href',
              title: t({ en: 'Profile URL', de: 'Profil-URL' }),
              type: 'string',
              // Cast: `.uri()` existiert zur Laufzeit auch auf String-Feldern (siehe cta.ts).
              validation: (R) => (R as unknown as Rule).required().uri({ scheme: ['http', 'https'] }),
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'href' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', media: 'image' },
    prepare({ title, subtitle, media }) {
      return {
        title: title || subtitle || t({ en: 'Portrait hero', de: 'Hero mit Portrait (Über mich)' }),
        subtitle,
        media,
      };
    },
  },
});
