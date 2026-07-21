import { defineType, defineField } from 'sanity';
import { CaseIcon } from '@sanity/icons/Case';
import { t, tOptions } from '../uiLocale';
import type { SegmentedOption } from '../../components/inputs/SegmentedInput';

const CATEGORY_LABEL: Record<string, string> = {
  personal: 'Personal Brands & Selbständige',
  business: 'Startups & Unternehmen',
};

/**
 * COACHING (Sammlung „Coachings"). Die Karten der Section „Coachings (Tabs)"
 * kommen automatisch aus dieser Sammlung: nach Kategorie in die Tabs sortiert,
 * Reihenfolge über das Feld „Reihenfolge".
 */
export default defineType({
  name: 'service',
  title: t({ en: 'Coaching', de: 'Coaching' }),
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'name',
      title: t({ en: 'Name', de: 'Name' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'formName',
      title: t({ en: 'Name in the enquiry form', de: 'Name im Anfrage-Formular' }),
      description: t({
        en: 'Shorter name shown in the multi-select of the enquiry modal.',
        de: 'Kürzerer Name für die Mehrfach-Auswahl im Anfrage-Modal.',
      }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'category',
      title: t({ en: 'Category', de: 'Kategorie' }),
      description: t({
        en: 'Which tab the card appears in.',
        de: 'In welchem Tab die Karte erscheint.',
      }),
      type: 'string',
      initialValue: 'personal',
      options: {
        layout: 'radio',
        list: tOptions([
          { en: CATEGORY_LABEL.personal, value: 'personal' },
          { en: CATEGORY_LABEL.business, value: 'business' },
        ]) as SegmentedOption[],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: t({ en: 'Description', de: 'Beschreibung' }),
      type: 'text',
      rows: 5,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Image', de: 'Bild' }),
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'order',
      title: t({ en: 'Order', de: 'Reihenfolge' }),
      description: t({
        en: 'Ascending; lower numbers first.',
        de: 'Aufsteigend; kleinere Zahlen zuerst.',
      }),
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: t({ en: 'Order', de: 'Reihenfolge' }),
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', category: 'category', order: 'order', media: 'image' },
    prepare({ title, category, order, media }) {
      const cat = CATEGORY_LABEL[category as string] ?? '';
      return {
        title,
        subtitle: [order != null ? `#${order}` : null, cat].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
