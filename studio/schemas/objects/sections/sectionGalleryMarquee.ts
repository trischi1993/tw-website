import { defineType, defineField } from 'sanity';
import { ImagesIcon } from '@sanity/icons/Images';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Horizontale Bild-Galerie („Bekannt aus" bzw. die ALL-IN-ONE-Säulen).
 * `titlesVisible` steuert, ob die Titel als Overlay sichtbar sind.
 */
export default defineType({
  name: 'sectionGalleryMarquee',
  title: t({ en: 'Gallery marquee', de: 'Bild-Galerie (Laufband)' }),
  type: 'object',
  icon: categoryIcon(ImagesIcon, 'section'),
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
      name: 'titlesVisible',
      title: t({ en: 'Show titles on the images', de: 'Titel auf den Bildern zeigen' }),
      description: t({
        en: 'On: title overlay on each card (“Known from”). Off: titles are for screen readers only (AIO pillars).',
        de: 'An: Titel-Overlay auf jeder Karte („Bekannt aus"). Aus: Titel nur für Screenreader (AIO-Säulen).',
      }),
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'items',
      title: t({ en: 'Images', de: 'Bilder' }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'title',
              title: t({ en: 'Title', de: 'Titel' }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'image',
              title: t({ en: 'Image', de: 'Bild' }),
              type: 'imageWithAlt',
            }),
          ],
          preview: {
            select: { title: 'title', media: 'image' },
          },
        },
      ],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label (optional)', de: 'Button-Text (optional)' }),
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: t({ en: 'Button link', de: 'Button-Link' }),
      type: 'string',
      hidden: ({ parent }) => !(parent as { ctaLabel?: string } | undefined)?.ctaLabel,
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone', items: 'items' },
    prepare({ title, subtitle, tone, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      const typeLabel = t({ en: 'Gallery marquee', de: 'Bild-Galerie (Laufband)' });
      return {
        title: title || subtitle || typeLabel,
        subtitle: `${sectionSubtitle(typeLabel, tone)} · ${count}`,
      };
    },
  },
});
