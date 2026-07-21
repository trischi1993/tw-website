import { defineType, defineField, type Rule } from 'sanity';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * „Spezifische Coachings": Tabs je Zielgruppe; die Karten kommen automatisch
 * aus der Sammlung „Coachings" (nach Kategorie gefiltert, nach Reihenfolge
 * sortiert) - hier werden nur Texte und Limits gepflegt.
 */
export default defineType({
  name: 'sectionServicesTabs',
  title: t({ en: 'Services tabs', de: 'Coachings (Tabs)' }),
  type: 'object',
  icon: categoryIcon(ThLargeIcon, 'section'),
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
      name: 'subtext',
      title: t({ en: 'Subtext', de: 'Untertext' }),
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tabLabelPersonal',
      title: t({ en: 'Tab label: personal', de: 'Tab-Beschriftung: Selbstständige' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'tabLabelBusiness',
      title: t({ en: 'Tab label: business', de: 'Tab-Beschriftung: Unternehmen' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'limit',
      title: t({ en: 'Cards per tab (max.)', de: 'Karten je Tab (max.)' }),
      description: t({
        en: 'Maximum number of cards per tab (original: 8). Empty = all.',
        de: 'Maximale Kartenzahl je Tab (Original: 8). Leer = alle.',
      }),
      type: 'number',
      validation: (R) => R.integer().min(0),
    }),
    defineField({
      name: 'ctaModalLabel',
      title: t({ en: 'Button label: enquiry', de: 'Button-Text: Anfrage' }),
      description: t({ en: 'Opens the enquiry modal.', de: 'Öffnet das Anfrage-Modal.' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'calendlyLabel',
      title: t({ en: 'Button label: Calendly', de: 'Button-Text: Calendly' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'calendlyUrl',
      title: t({ en: 'Calendly URL', de: 'Calendly-URL' }),
      type: 'string',
      // Cast: `.uri()` existiert zur Laufzeit auch auf String-Feldern (siehe cta.ts).
      validation: (R) => (R as unknown as Rule).required().uri({ scheme: ['http', 'https'] }),
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone' },
    prepare({ title, subtitle, tone }) {
      const typeLabel = t({ en: 'Services tabs', de: 'Coachings (Tabs)' });
      return { title: title || subtitle || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
