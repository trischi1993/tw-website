import { defineField, defineType } from 'sanity';
import { BookIcon } from '@sanity/icons/Book';
import { richTextField, ptToPlain } from '../objects/text/richText';

const requiredString = (name: string, title: string, rows?: number) =>
  defineField({
    name,
    title,
    type: rows ? 'text' : 'string',
    ...(rows ? { rows } : {}),
    validation: (R) => R.required(),
  });

const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'imageWithAlt',
    validation: (R) => R.required(),
  });

const objectField = (name: string, title: string, fields: any[], group: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    options: { collapsible: true, collapsed: false },
    fields,
    validation: (R) => R.required(),
  });

const imageItem = (label: string) => ({
  type: 'object',
  name: 'item',
  fields: [imageField('image', 'Bild')],
  preview: {
    select: { title: 'image.alt', media: 'image.asset' },
    prepare({ title, media }: any) {
      return { title: title || label, media };
    },
  },
});

/**
 * E-BOOK-LANDINGPAGE – Singleton mit fester ID `ebookPage`.
 *
 * Das conversion-optimierte Layout bleibt fest im Frontend. Redakteure können
 * alle sichtbaren Inhalte und Bilder pflegen, aber weder den Checkout-Pfad
 * noch Domain-/Systeme.io-Verbindungen verändern.
 */
export default defineType({
  name: 'ebookPage',
  title: 'E-Book Landingpage',
  type: 'document',
  icon: BookIcon,
  groups: [
    { name: 'seo', title: 'SEO & Produkt' },
    { name: 'hero', title: 'Hero & Einstieg', default: true },
    { name: 'content', title: 'Inhalt & Autor' },
    { name: 'offer', title: 'Angebot & Zielgruppen' },
    { name: 'proof', title: 'Ergebnisse & Vertrauen' },
    { name: 'final', title: 'Abschluss & FAQ' },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'SEO & Teilen',
      type: 'seo',
      group: 'seo',
      validation: (R) => R.required(),
    }),

    objectField(
      'product',
      'Produktangaben',
      [
        requiredString('name', 'Produktname'),
        defineField({
          name: 'pageCount',
          title: 'Seitenzahl',
          type: 'number',
          validation: (R) => R.required().integer().positive(),
        }),
        requiredString('chapterCount', 'Kapitelangabe'),
        defineField({
          name: 'bonusCount',
          title: 'Anzahl Boni',
          type: 'number',
          validation: (R) => R.required().integer().min(0),
        }),
        defineField({
          name: 'price',
          title: 'Preis für strukturierte Daten',
          description:
            'Nur ändern, wenn der tatsächliche Preis im Systeme.io-Bestellformular ebenfalls angepasst wurde.',
          type: 'number',
          validation: (R) => R.required().positive(),
        }),
        defineField({
          name: 'priceCurrency',
          title: 'Währung',
          type: 'string',
          options: { list: [{ title: 'Euro', value: 'EUR' }], layout: 'radio' },
          validation: (R) => R.required(),
        }),
        requiredString('totalValue', 'Gesamtwert (Anzeige)'),
      ],
      'seo',
    ),

    objectField(
      'hero',
      'Hero',
      [
        requiredString('eyebrow', 'Kleine Überschrift'),
        requiredString('title', 'Hauptüberschrift – erste Zeile'),
        requiredString('titleHighlight', 'Hauptüberschrift – hervorgehoben'),
        requiredString('lead', 'Kurzversprechen'),
        requiredString('text', 'Einleitung', 3),
        requiredString('ctaLabel', 'Buttontext'),
        requiredString('pricePrefix', 'Preiszeile – erster Teil'),
        requiredString('priceText', 'Preiszeile – hervorgehoben'),
        defineField({
          name: 'stampText',
          title: 'Stempeltext',
          description: 'Ein Zeilenumbruch teilt den Text im runden Stempel.',
          type: 'text',
          rows: 2,
          validation: (R) => R.required(),
        }),
        imageField('image', 'Hero-Mockup'),
        imageField('phoneImage', 'Smartphone-Inhalt'),
      ],
      'hero',
    ),

    objectField(
      'press',
      'Bekannt aus',
      [
        requiredString('heading', 'Überschrift'),
        defineField({
          name: 'items',
          title: 'Logos',
          type: 'array',
          of: [imageItem('Logo')],
          validation: (R) => R.required().min(1),
        }),
      ],
      'proof',
    ),

    objectField(
      'intro',
      'Strategie-Einstieg',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Statement'),
        requiredString('headingHighlight', 'Hervorgehobener Schlusssatz'),
        requiredString('text', 'Beschreibung', 4),
      ],
      'hero',
    ),

    objectField(
      'benefits',
      'Vorteile',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        requiredString('intro', 'Einleitung', 3),
        defineField({
          name: 'items',
          title: 'Vorteile',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'item',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icon',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Einblicke', value: 'insights' },
                      { title: 'Strategie', value: 'strategy' },
                      { title: 'Schritte', value: 'steps' },
                      { title: 'Learnings', value: 'learnings' },
                    ],
                  },
                  validation: (R) => R.required(),
                }),
                requiredString('title', 'Titel'),
                requiredString('text', 'Text', 3),
              ],
              preview: { select: { title: 'title', subtitle: 'text' } },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
        requiredString('note', 'Hinweis über dem Button'),
        requiredString('ctaLabel', 'Buttontext'),
      ],
      'hero',
    ),

    objectField(
      'author',
      'Autor',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        imageField('image', 'Autorenfoto'),
        requiredString('caption', 'Bildunterschrift'),
        requiredString('captionHighlight', 'Hervorgehobene Bildunterschrift'),
        defineField({
          name: 'paragraphs',
          title: 'Vorstellungstexte',
          type: 'array',
          of: [{ type: 'text', rows: 4 }],
          validation: (R) => R.required().min(1),
        }),
        defineField({
          name: 'stats',
          title: 'Kennzahlen',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'stat',
              fields: [
                defineField({
                  name: 'value',
                  title: 'Zahl',
                  type: 'number',
                  validation: (R) => R.required().min(0),
                }),
                requiredString('suffix', 'Suffix (z. B. K+)'),
                requiredString('label', 'Beschriftung'),
              ],
              preview: {
                select: { value: 'value', suffix: 'suffix', title: 'label' },
                prepare({ value, suffix, title }: any) {
                  return { title, subtitle: `${value ?? ''}${suffix ?? ''}` };
                },
              },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
      ],
      'content',
    ),

    objectField(
      'chapters',
      'Kapitel',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        requiredString('intro', 'Einleitung', 4),
        imageField('image', 'Kapitel-Mockup'),
        imageField('phoneImage', 'Smartphone-Inhalt'),
        defineField({
          name: 'items',
          title: 'Kapitel',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'chapter',
              fields: [
                requiredString('number', 'Nummer'),
                requiredString('title', 'Titel'),
                requiredString('text', 'Kurzbeschreibung'),
              ],
              preview: {
                select: { number: 'number', title: 'title', subtitle: 'text' },
                prepare({ number, title, subtitle }: any) {
                  return { title: `${number || ''} ${title || ''}`.trim(), subtitle };
                },
              },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
        requiredString('note', 'Hinweis über dem Button'),
        requiredString('ctaLabel', 'Buttontext'),
      ],
      'content',
    ),

    objectField(
      'evergreen',
      'Ergebnisse & Evergreen-Strategien',
      [
        requiredString('carouselLabel', 'Barrierefreie Karussell-Beschriftung'),
        requiredString('carouselMeta', 'Karussell-Fußzeile'),
        defineField({
          name: 'results',
          title: 'Instagram-Ergebnisse',
          type: 'array',
          of: [imageItem('Ergebnis')],
          validation: (R) => R.required().min(1),
        }),
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        requiredString('text', 'Beschreibung', 6),
      ],
      'proof',
    ),

    objectField(
      'bundle',
      'Komplettpaket',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        requiredString('intro', 'Einleitung', 3),
        defineField({
          name: 'items',
          title: 'Bestandteile',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'item',
              fields: [
                requiredString('eyebrow', 'Kennzeichnung'),
                requiredString('title', 'Titel'),
                requiredString('text', 'Beschreibung', 4),
                requiredString('value', 'Wert'),
                requiredString('price', 'Preis/Status'),
                imageField('image', 'Produktbild'),
              ],
              preview: {
                select: { title: 'title', subtitle: 'eyebrow', media: 'image.asset' },
              },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
        requiredString('totalLabel', 'Gesamtwert – Beschriftung'),
        requiredString('totalValue', 'Gesamtwert'),
        requiredString('priceLabel', 'Investition – Beschriftung'),
        requiredString('price', 'Investition'),
        requiredString('ctaLabel', 'Buttontext'),
      ],
      'offer',
    ),

    objectField(
      'audience',
      'Zielgruppen',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        defineField({
          name: 'items',
          title: 'Zielgruppen',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'item',
              fields: [
                requiredString('title', 'Titel'),
                requiredString('text', 'Beschreibung', 4),
                imageField('image', 'Bild'),
              ],
              preview: { select: { title: 'title', subtitle: 'text', media: 'image.asset' } },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
      ],
      'offer',
    ),

    objectField(
      'reviews',
      'Erfahrungen',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        defineField({
          name: 'featured',
          title: 'Hervorgehobene Rezension',
          type: 'object',
          fields: [
            requiredString('name', 'Name'),
            requiredString('role', 'Rolle/Einordnung'),
            requiredString('text', 'Zitat', 6),
            imageField('image', 'Portrait'),
          ],
          validation: (R) => R.required(),
          preview: { select: { title: 'name', subtitle: 'role', media: 'image.asset' } },
        }),
        defineField({
          name: 'messages',
          title: 'Käufer-Nachrichten',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'message',
              fields: [imageField('image', 'Freigestellte PN')],
              preview: { select: { title: 'image.alt', media: 'image.asset' } },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
      ],
      'proof',
    ),

    objectField(
      'finalCta',
      'Abschluss-CTA',
      [
        requiredString('kicker', 'Kleine Überschrift'),
        requiredString('heading', 'Überschrift'),
        requiredString('text', 'Text', 3),
        requiredString('pricePrefix', 'Preis – Beschriftung'),
        requiredString('price', 'Preis'),
        requiredString('totalValue', 'Gesamtwert'),
        requiredString('ctaLabel', 'Buttontext'),
      ],
      'final',
    ),

    objectField(
      'faq',
      'FAQ',
      [
        requiredString('heading', 'Überschrift'),
        defineField({
          name: 'items',
          title: 'Fragen',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'item',
              fields: [
                requiredString('question', 'Frage'),
                richTextField({ name: 'answer', title: 'Antwort' }),
              ],
              preview: {
                select: { title: 'question', answer: 'answer' },
                prepare({ title, answer }: any) {
                  return { title, subtitle: ptToPlain(answer) };
                },
              },
            },
          ],
          validation: (R) => R.required().min(1),
        }),
      ],
      'final',
    ),
  ],
  preview: {
    prepare() {
      return { title: 'E-Book Landingpage', subtitle: 'ebook.tristanweithaler.com' };
    },
  },
});
