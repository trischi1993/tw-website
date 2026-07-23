import { defineType, defineField } from 'sanity';
import { PlayIcon } from '@sanity/icons/Play';
import { nameField, anchorField } from './shared';
import { optionalRichText } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * AIO-Hero (Layout-Section): direktes Bunny-MP4 im iPhone-Mockup,
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
      name: 'videoUrl',
      title: t({ en: 'Bunny video URL', de: 'Bunny-Video-URL' }),
      description: t({
        en: 'Direct HTTPS URL to an MP4 on the Bunny CDN (*.b-cdn.net).',
        de: 'Direkte HTTPS-Adresse zu einer MP4-Datei im Bunny-CDN (*.b-cdn.net).',
      }),
      type: 'url',
      validation: (R) =>
        R.required()
          .uri({ scheme: ['https'] })
          .custom((value) => {
            if (!value) return true;
            try {
              const url = new URL(value);
              const isBunny = url.hostname === 'b-cdn.net' || url.hostname.endsWith('.b-cdn.net');
              const isMp4 = url.pathname.toLowerCase().endsWith('.mp4');
              return isBunny && isMp4
                ? true
                : t({
                    en: 'Use a direct HTTPS MP4 URL on *.b-cdn.net.',
                    de: 'Bitte eine direkte HTTPS-MP4-URL auf *.b-cdn.net verwenden.',
                  });
            } catch {
              return t({ en: 'Enter a valid URL.', de: 'Bitte eine gültige URL eingeben.' });
            }
          }),
    }),
    defineField({
      name: 'mockupImage',
      title: t({ en: 'Phone mockup image', de: 'iPhone-Mockup-Bild' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'posterImage',
      title: t({ en: 'Video poster', de: 'Video-Standbild' }),
      description: t({
        en: 'Shown while the video is loading or if it cannot be played.',
        de: 'Wird angezeigt, während das Video lädt oder falls es nicht abgespielt werden kann.',
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
