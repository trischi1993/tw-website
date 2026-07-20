import { defineType, defineField } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';
import { sectionsField } from '../objects/sectionsField';

/**
 * STARTSEITE (Singleton mit fester ID `homePage`). Wie jede Seite aus
 * Abschnitten zusammengesetzt, in beliebiger Reihenfolge.
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
    prepare() {
      return { title: 'Startseite' };
    },
  },
});
