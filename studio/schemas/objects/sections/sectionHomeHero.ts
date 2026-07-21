import { defineType, defineField } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Startseiten-Hero (Layout-Section): zweizeilige H1, CTA (öffnet das
 * Anfrage-Modal) und großes Bild mit Scroll-Wipe-Reveal. Layout fest
 * verdrahtet - deshalb nur Name + Anker, keine Style-Felder.
 */
export default defineType({
  name: 'sectionHomeHero',
  title: t({ en: 'Home hero', de: 'Hero (Startseite)' }),
  type: 'object',
  icon: categoryIcon(HomeIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'headingSmall',
      title: t({ en: 'Heading, small line', de: 'Überschrift, kleine Zeile' }),
      description: t({ en: 'The smaller first line of the H1.', de: 'Die kleinere erste Zeile der H1.' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingLarge',
      title: t({ en: 'Heading, large line', de: 'Überschrift, große Zeile' }),
      description: t({ en: 'The large second line of the H1.', de: 'Die große zweite Zeile der H1.' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label', de: 'Button-Text' }),
      description: t({
        en: 'The glow button. It opens the enquiry modal.',
        de: 'Der Glow-Button. Er öffnet das Anfrage-Modal.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Hero image', de: 'Hero-Bild' }),
      description: t({
        en: 'The large image revealed while scrolling.',
        de: 'Das große Bild, das beim Scrollen freigelegt wird.',
      }),
      type: 'imageWithAlt',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'headingLarge', media: 'image' },
    prepare({ title, subtitle, media }) {
      return { title: title || t({ en: 'Home hero', de: 'Hero (Startseite)' }), subtitle, media };
    },
  },
});
