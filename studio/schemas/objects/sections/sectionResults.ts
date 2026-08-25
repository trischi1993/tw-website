import { defineType, defineField } from 'sanity';
import { BarChartIcon } from '@sanity/icons/BarChart';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t, tOptions } from '../../uiLocale';

const badgePositions = tOptions([
  { en: 'Top left', de: 'Oben links', value: 'top-left' },
  { en: 'Top right', de: 'Oben rechts', value: 'top-right' },
  { en: 'Middle left', de: 'Mittig links', value: 'middle-left' },
  { en: 'Middle right', de: 'Mittig rechts', value: 'middle-right' },
  { en: 'Bottom left', de: 'Unten links', value: 'bottom-left' },
  { en: 'Bottom right', de: 'Unten rechts', value: 'bottom-right' },
  { en: 'Between bio and link', de: 'Zwischen Bio und Link', value: 'bio-link-right' },
  { en: 'Over the right reel', de: 'Über dem rechten Reel', value: 'reel-right' },
]);

const cropOptions = tOptions([
  { en: 'No special crop', de: 'Kein spezieller Zuschnitt', value: 'none' },
  { en: 'Trim bottom edge', de: 'Unteren Rand kürzen', value: 'trim-bottom' },
  { en: 'Crop at insights circle', de: 'Am Insights-Kreis abschneiden', value: 'circle' },
  { en: 'Hide chat contact bar', de: 'Chat-Kontaktleiste ausblenden', value: 'chat-header' },
  { en: 'Tristan profile crop', de: 'Tristan-Profil-Zuschnitt', value: 'profile-tristan' },
  { en: 'Mindful Stays profile crop', de: 'Mindful-Stays-Profil-Zuschnitt', value: 'profile-mindful' },
]);

/** Vollstaendig editierbares Startseiten-Carousel: Inhalt und Bildregeln leben in Sanity. */
export default defineType({
  name: 'sectionResults',
  title: t({ en: 'Own & customer results', de: 'Meine Erfolge & Kundenerfolge' }),
  type: 'object',
  icon: categoryIcon(BarChartIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      description: t({
        en: 'The compact heading above the carousel.',
        de: 'Die kompakte Überschrift oberhalb des Carousels.',
      }),
      type: 'string',
      initialValue: 'Lass Ergebnisse aus der Praxis sprechen.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ownLabel',
      title: t({ en: 'Own results label', de: 'Label „Meine Erfolge“' }),
      type: 'string',
      initialValue: 'Meine Erfolge',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'customerLabel',
      title: t({ en: 'Customer results label', de: 'Label „Kundenerfolge“' }),
      type: 'string',
      initialValue: 'Kundenerfolge',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'cards',
      title: t({ en: 'Result cards', de: 'Erfolgskarten' }),
      description: t({
        en: 'Order by dragging. Keep own results first so the two jump buttons remain predictable.',
        de: 'Reihenfolge per Ziehen ändern. Eigene Erfolge zuerst lassen, damit die beiden Sprung-Buttons eindeutig bleiben.',
      }),
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'proofCard',
          fields: [
            defineField({
              name: 'kind',
              title: t({ en: 'Result type', de: 'Art des Erfolgs' }),
              type: 'string',
              initialValue: 'customer',
              options: {
                layout: 'radio',
                list: tOptions([
                  { en: 'Own result', de: 'Mein Erfolg', value: 'own' },
                  { en: 'Customer result', de: 'Kundenerfolg', value: 'customer' },
                ]),
              },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'source',
              title: t({ en: 'Name and category', de: 'Name und Kategorie' }),
              description: t({
                en: 'The small line above the main number, e.g. “Tristan Weithaler · Personal Brand”.',
                de: 'Die kleine Zeile über der großen Zahl, z. B. „Tristan Weithaler · Personal Brand“.',
              }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'value',
              title: t({ en: 'Main result', de: 'Große Kennzahl' }),
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'label',
              title: t({ en: 'Short description', de: 'Kurze Beschreibung' }),
              type: 'text',
              rows: 2,
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'images',
              title: t({ en: 'Screenshots', de: 'Screenshots' }),
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'proofImage',
                  fields: [
                    defineField({
                      name: 'image',
                      title: t({ en: 'Screenshot', de: 'Screenshot' }),
                      type: 'imageWithAlt',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'badge',
                      title: t({ en: 'KPI badge (optional)', de: 'KPI-Badge (optional)' }),
                      type: 'string',
                    }),
                    defineField({
                      name: 'badgePosition',
                      title: t({ en: 'Badge position', de: 'Badge-Position' }),
                      description: t({
                        en: 'Place the badge where it does not cover a name, profile picture or KPI.',
                        de: 'Dort platzieren, wo kein Name, Profilbild oder KPI verdeckt wird.',
                      }),
                      type: 'string',
                      options: { list: badgePositions },
                      hidden: ({ parent }) => !(parent as { badge?: string } | undefined)?.badge,
                    }),
                    defineField({
                      name: 'crop',
                      title: t({ en: 'Special crop', de: 'Spezieller Zuschnitt' }),
                      description: t({
                        en: 'Only use the matching preset for screenshots that need a protected crop.',
                        de: 'Nur das passende Preset für Screenshots verwenden, die einen geschützten Zuschnitt brauchen.',
                      }),
                      type: 'string',
                      initialValue: 'none',
                      options: { list: cropOptions },
                    }),
                  ],
                  preview: {
                    select: { title: 'badge', subtitle: 'crop', media: 'image' },
                    prepare({ title, subtitle, media }) {
                      return {
                        title: title || t({ en: 'Screenshot', de: 'Screenshot' }),
                        subtitle: subtitle && subtitle !== 'none' ? subtitle : undefined,
                        media,
                      };
                    },
                  },
                },
              ],
              validation: (R) => R.required().min(1).max(3),
            }),
          ],
          preview: {
            select: { title: 'source', subtitle: 'value', kind: 'kind', media: 'images.0.image' },
            prepare({ title, subtitle, kind, media }) {
              const kindLabel = kind === 'own'
                ? t({ en: 'Own result', de: 'Mein Erfolg' })
                : t({ en: 'Customer result', de: 'Kundenerfolg' });
              return { title, subtitle: `${kindLabel} · ${subtitle || ''}`, media };
            },
          },
        },
      ],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'closingCard',
      title: t({ en: 'Closing CTA card', de: 'Abschlusskarte mit CTA' }),
      type: 'object',
      validation: (R) => R.required(),
      fields: [
        defineField({ name: 'kicker', title: t({ en: 'Small gold line', de: 'Kleine goldene Zeile' }), type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'heading', title: t({ en: 'Heading', de: 'Überschrift' }), type: 'text', rows: 3, validation: (R) => R.required() }),
        defineField({ name: 'hint', title: t({ en: 'Short hint', de: 'Kurzer Hinweis' }), type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'source', title: t({ en: 'Lower label', de: 'Unteres Label' }), type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'text', title: t({ en: 'CTA text', de: 'CTA-Text' }), type: 'text', rows: 2, validation: (R) => R.required() }),
        defineField({ name: 'ctaLabel', title: t({ en: 'Button label', de: 'Button-Text' }), type: 'string', validation: (R) => R.required() }),
        defineField({
          name: 'ctaAction',
          title: t({ en: 'Button action', de: 'Button-Aktion' }),
          type: 'string',
          initialValue: 'modal',
          options: {
            layout: 'radio',
            list: tOptions([
              { en: 'Open coaching form', de: 'Coaching-Formular öffnen', value: 'modal' },
              { en: 'Open link', de: 'Link öffnen', value: 'link' },
            ]),
          },
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'ctaHref',
          title: t({ en: 'Button link', de: 'Button-Link' }),
          type: 'string',
          hidden: ({ parent }) => (parent as { ctaAction?: string } | undefined)?.ctaAction !== 'link',
          validation: (R) => R.custom((value, context) => {
            const parent = context.parent as { ctaAction?: string } | undefined;
            return parent?.ctaAction === 'link' && !value
              ? t({ en: 'A link is required.', de: 'Bitte einen Link eintragen.' })
              : true;
          }),
        }),
        defineField({
          name: 'ctaNewTab',
          title: t({ en: 'Open link in new tab', de: 'Link in neuem Tab öffnen' }),
          type: 'boolean',
          initialValue: false,
          hidden: ({ parent }) => (parent as { ctaAction?: string } | undefined)?.ctaAction !== 'link',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', cards: 'cards' },
    prepare({ title, subtitle, cards }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      const typeLabel = t({ en: 'Own & customer results', de: 'Meine Erfolge & Kundenerfolge' });
      return {
        title: title || typeLabel,
        subtitle: `${subtitle || typeLabel} · ${count}`,
      };
    },
  },
});
