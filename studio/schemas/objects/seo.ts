import { defineType, defineField } from 'sanity';

/**
 * Suchmaschinen- & Teilen-Einstellungen einer Seite (Google-Treffer und
 * Vorschau beim Teilen in WhatsApp, Facebook etc.).
 */
export default defineType({
  name: 'seo',
  title: 'SEO & Teilen',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'title',
      title: 'Seitentitel (für Google & Browser-Tab)',
      description:
        'Erscheint als blaue Überschrift im Google-Treffer und im Browser-Tab. Idealerweise 50–60 Zeichen, höchstens 65.',
      type: 'string',
      validation: (R) =>
        R.max(65).warning('Über 65 Zeichen kürzt Google den Titel meist ab.'),
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung (Google-Snippet)',
      description:
        'Der erklärende Text unter dem Titel im Google-Treffer. Idealerweise 120–155 Zeichen, höchstens 160.',
      type: 'text',
      rows: 3,
      validation: (R) =>
        R.max(160).warning('Über 160 Zeichen kürzt Google die Beschreibung ab.'),
    }),
    defineField({
      name: 'image',
      title: 'Vorschaubild beim Teilen (optional)',
      description:
        'Das Bild, das beim Teilen des Links in WhatsApp, Facebook & Co. erscheint. Bleibt es leer, wird automatisch ein passendes Bild der Seite verwendet.',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'noindex',
      title: 'Von Google ausschließen',
      description:
        'Nur aktivieren, wenn diese Seite NICHT bei Google erscheinen soll (z. B. eine Dankesseite). Im Normalfall ausgeschaltet lassen.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
