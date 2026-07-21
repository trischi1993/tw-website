import { defineType, defineField } from 'sanity';
import { StarIcon } from '@sanity/icons/Star';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** Bonus-Karten (3er-Reihe) + optionaler CTA. */
export default defineType({
  name: 'sectionBonuses',
  title: t({ en: 'Bonuses', de: 'Bonusse' }),
  type: 'object',
  icon: categoryIcon(StarIcon, 'section'),
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
      title: t({ en: 'Intro text (optional)', de: 'Einleitung (optional)' }),
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'cards',
      title: t({ en: 'Bonus cards', de: 'Bonus-Karten' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'card',
          fields: [
            defineField({
              name: 'tag',
              title: t({ en: 'Tag', de: 'Etikett' }),
              description: t({ en: 'E.g. “Bonus 1”.', de: 'Z. B. „Bonus 1".' }),
              type: 'string',
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
            defineField({
              name: 'image',
              title: t({ en: 'Image', de: 'Bild' }),
              type: 'imageWithAlt',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'tag', media: 'image' },
          },
        },
      ],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label (optional)', de: 'Button-Text (optional)' }),
      description: t({
        en: 'Opens the ALL-IN-ONE application modal.',
        de: 'Öffnet das ALL-IN-ONE-Bewerbungs-Modal.',
      }),
      type: 'string',
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone', cards: 'cards' },
    prepare({ title, subtitle, tone, cards }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      const typeLabel = t({ en: 'Bonuses', de: 'Bonusse' });
      return {
        title: title || subtitle || typeLabel,
        subtitle: `${sectionSubtitle(typeLabel, tone)} · ${count}`,
      };
    },
  },
});
