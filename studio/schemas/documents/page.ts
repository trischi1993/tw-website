import { defineType, defineField } from 'sanity';
import { DocumentIcon } from '@sanity/icons/Document';
import { languageField, languageLabel } from '../objects/language';
import { sectionsField } from '../objects/sectionsField';

/**
 * SEITE – eine frei zusammenstellbare Unterseite (z. B. „Umgebung &
 * Aktivitäten“). Der Inhalt wird aus Abschnitten zusammengesetzt, die
 * in beliebiger Reihenfolge angeordnet werden können.
 *
 * Hinweis: Die Adresse (URL) ergibt sich aus dem „URL-Kürzel“. Wird es
 * nach dem Start geändert, ändert sich die Adresse der Seite.
 */
export default defineType({
  name: 'page',
  title: 'Seite',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Inhalt', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Vom Plugin @sanity/document-internationalization verwaltet (versteckt,
    // schreibgeschützt). Die Verknüpfung der Sprachversionen läuft über das
    // „Übersetzungen“-Menü und ein translation.metadata-Dokument.
    { ...languageField({ hidden: true }), group: 'content' },
    defineField({
      name: 'title',
      title: 'Titel',
      description: 'Der Titel der Seite. Erscheint u. a. als Überschrift im Browser-Tab.',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-Kürzel',
      description:
        'Der Teil der Web-Adresse nach dem „/“ (z. B. „beispiel“ ergibt example.com/beispiel/). Auf „Generieren“ klicken, um es aus dem Titel zu erzeugen. Nach dem Start besser nicht mehr ändern, das ändert die Adresse der Seite.',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Teilen',
      type: 'seo',
      group: 'seo',
    }),
    {
      ...sectionsField({
        description:
          'Die Inhaltsblöcke dieser Seite, von oben nach unten. „Add item“ oder ⌘/Strg+E zum Einfügen; per Ziehen umsortieren.',
      }),
      group: 'content',
    },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    prepare({ title, slug, language }) {
      const lang = languageLabel(language);
      const path = slug ? (language === 'en' ? `/en/${slug}/` : `/${slug}/`) : 'kein URL-Kürzel';
      return { title: title || 'Seite', subtitle: [lang, path].filter(Boolean).join(' · ') };
    },
  },
});
