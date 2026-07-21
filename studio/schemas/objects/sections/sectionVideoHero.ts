import { defineType, defineField } from 'sanity';
import { PlayIcon } from '@sanity/icons/Play';
import { nameField, anchorField } from './shared';
import { optionalRichText } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * AIO-Hero (Layout-Section): Vimeo-Video im iPhone-Mockup (consent-gated),
 * CTA öffnet das AIO-Bewerbungs-Modal. Layout fest verdrahtet.
 */
export default defineType({
  name: 'sectionVideoHero',
  title: t({ en: 'Video hero', de: 'Hero mit Video (AIO)' }),
  type: 'object',
  icon: categoryIcon(PlayIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    optionalRichText({ name: 'intro', title: t({ en: 'Intro text', de: 'Einleitung' }) }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label', de: 'Button-Text' }),
      description: t({
        en: 'Opens the ALL-IN-ONE application modal.',
        de: 'Öffnet das ALL-IN-ONE-Bewerbungs-Modal.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'vimeoId',
      title: t({ en: 'Vimeo video ID', de: 'Vimeo-Video-ID' }),
      description: t({
        en: 'The number in the Vimeo URL (e.g. 1164742630). Loads only after cookie consent.',
        de: 'Die Nummer in der Vimeo-URL (z. B. 1164742630). Lädt erst nach Cookie-Zustimmung.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'mockupImage',
      title: t({ en: 'Phone mockup image', de: 'iPhone-Mockup-Bild' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'posterImage',
      title: t({ en: 'Video poster (before consent)', de: 'Video-Standbild (vor Zustimmung)' }),
      description: t({
        en: 'Shown instead of the video until the visitor accepts media cookies.',
        de: 'Wird statt des Videos gezeigt, bis Medien-Cookies akzeptiert wurden.',
      }),
      type: 'imageWithAlt',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', media: 'mockupImage' },
    prepare({ title, subtitle, media }) {
      return { title: title || subtitle || t({ en: 'Video hero', de: 'Hero mit Video (AIO)' }), subtitle, media };
    },
  },
});
