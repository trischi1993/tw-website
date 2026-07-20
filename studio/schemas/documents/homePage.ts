import { defineType, defineField } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';
import { languageField, languageLabel } from '../objects/language';
import { sectionsField } from '../objects/sectionsField';

/**
 * STARTSEITE (pro Sprache ein Singleton: homePage-de / homePage-en). Wie jede
 * Seite aus Abschnitten zusammengesetzt, in beliebiger Reihenfolge.
 */
export default defineType({
  name: 'homePage',
  title: 'Startseite',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'content', title: 'Inhalt', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    { ...languageField({ hidden: true }), group: 'content' },
    defineField({
      name: 'seo',
      title: 'SEO & Teilen',
      type: 'seo',
      group: 'seo',
    }),
    {
      ...sectionsField({
        description:
          'Die Inhaltsblöcke der Startseite, von oben nach unten. „Add item“ oder ⌘/Strg+E zum Einfügen; per Ziehen umsortieren.',
      }),
      group: 'content',
    },
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      return { title: 'Startseite', subtitle: languageLabel(language) || 'ohne Sprache' };
    },
  },
});
