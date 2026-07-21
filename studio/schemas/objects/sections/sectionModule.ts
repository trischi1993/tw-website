import { defineType, defineField } from 'sanity';
import { StackIcon } from '@sanity/icons/Stack';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Programm-Abschnitt (Layout-Section): Titelzeile + statisches Laufband +
 * Bullets + Bild auf Gold-Quadrat, optional 1:1-Coaching-Teil mit
 * Hintergrundvideo. Layout fest verdrahtet.
 */
export default defineType({
  name: 'sectionModule',
  title: t({ en: 'Program module', de: 'Programm-Abschnitt (Modul)' }),
  type: 'object',
  icon: categoryIcon(StackIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'titleRowText',
      title: t({ en: 'Title row text', de: 'Text der Titelzeile' }),
      description: t({ en: 'E.g. “Modul” or “Deine Resultate”.', de: 'Z. B. „Modul" oder „Deine Resultate".' }),
      type: 'string',
      initialValue: 'Modul',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'number',
      title: t({ en: 'Module number (optional)', de: 'Modul-Nummer (optional)' }),
      description: t({ en: 'E.g. “01”. Empty for “Deine Resultate”.', de: 'Z. B. „01". Leer bei „Deine Resultate".' }),
      type: 'string',
    }),
    defineField({
      name: 'bannerWord',
      title: t({ en: 'Banner word', de: 'Laufband-Wort' }),
      description: t({
        en: 'The word repeated in the static banner row.',
        de: 'Das Wort, das im statischen Laufband wiederholt wird.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'bannerGold',
      title: t({ en: 'Last banner word in gold', de: 'Letztes Laufband-Wort in Gold' }),
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'bullets',
      title: t({ en: 'Bullet points', de: 'Aufzählungspunkte' }),
      type: 'array',
      of: [{ type: 'string' }],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'bulletsNowrap',
      title: t({ en: 'Keep bullets on one line', de: 'Bullets nicht umbrechen' }),
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Image', de: 'Bild' }),
      description: t({ en: 'Sits on the gold square.', de: 'Liegt auf dem goldenen Quadrat.' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'imageWide',
      title: t({ en: 'Wide image', de: 'Breites Bild' }),
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'coachingHeading',
      title: t({ en: '1:1 part: heading (optional)', de: '1:1-Teil: Überschrift (optional)' }),
      type: 'string',
    }),
    defineField({
      name: 'coachingText',
      title: t({ en: '1:1 part: text', de: '1:1-Teil: Text' }),
      type: 'text',
      rows: 3,
      hidden: ({ parent }) => !(parent as { coachingHeading?: string } | undefined)?.coachingHeading,
    }),
    defineField({
      name: 'videoSrc',
      title: t({ en: '1:1 part: background video', de: '1:1-Teil: Hintergrundvideo' }),
      description: t({ en: 'Path, e.g. /videos/modul1.mp4', de: 'Pfad, z. B. /videos/modul1.mp4' }),
      type: 'string',
      hidden: ({ parent }) => !(parent as { coachingHeading?: string } | undefined)?.coachingHeading,
    }),
    defineField({
      name: 'videoPoster',
      title: t({ en: '1:1 part: video poster', de: '1:1-Teil: Video-Standbild' }),
      description: t({ en: 'Path, e.g. /videos/modul1-poster.jpg', de: 'Pfad, z. B. /videos/modul1-poster.jpg' }),
      type: 'string',
      hidden: ({ parent }) => !(parent as { coachingHeading?: string } | undefined)?.coachingHeading,
    }),
  ],
  preview: {
    select: { title: 'name', number: 'number', heading: 'heading', media: 'image' },
    prepare({ title, number, heading, media }) {
      const typeLabel = t({ en: 'Program module', de: 'Programm-Abschnitt (Modul)' });
      return {
        title: title || (number ? `Modul ${number}` : heading || typeLabel),
        subtitle: heading,
        media,
      };
    },
  },
});
