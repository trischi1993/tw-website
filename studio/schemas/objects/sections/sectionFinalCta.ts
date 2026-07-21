import { defineType, defineField } from 'sanity';
import { RocketIcon } from '@sanity/icons/Rocket';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields, ctaActionField, ctaHrefField, ctaNewTabField } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** Abschluss-CTA: schmale zentrierte Spalte mit Überschrift, Text, Button. */
export default defineType({
  name: 'sectionFinalCta',
  title: t({ en: 'Final CTA', de: 'Abschluss-CTA' }),
  type: 'object',
  icon: categoryIcon(RocketIcon, 'section'),
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
      name: 'text',
      title: t({ en: 'Text (optional)', de: 'Text (optional)' }),
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label', de: 'Button-Text' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    ctaActionField,
    ctaHrefField,
    ctaNewTabField,
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone' },
    prepare({ title, subtitle, tone }) {
      const typeLabel = t({ en: 'Final CTA', de: 'Abschluss-CTA' });
      return { title: title || subtitle || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
