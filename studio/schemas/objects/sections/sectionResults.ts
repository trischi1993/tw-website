import { defineType, defineField } from 'sanity';
import { BarChartIcon } from '@sanity/icons/BarChart';
import { nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t, tOptions } from '../../uiLocale';
import { HOME_PROOF_CARD_SLOTS } from '../../../../shared/data/home-proof-card-slots.mjs';

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

const fixedResultCardField = (slot: (typeof HOME_PROOF_CARD_SLOTS)[number]) =>
  defineField({
    name: slot.field,
    title: slot.title,
    type: 'object',
    group: slot.group,
    options: { collapsible: true, collapsed: true },
    validation: (R) => R.required(),
    fields: [
      defineField({
        name: 'source',
        title: t({ en: 'Name / role', de: 'Name / Rollenbezeichnung' }),
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
        title: t({ en: 'Description below the result', de: 'Beschreibung unter der Kennzahl' }),
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'badges',
        title: t({ en: 'Badge texts on the screenshots', de: 'Badge-Texte auf den Screenshots' }),
        description: t({
          en: 'Order corresponds to the screenshots marked “Use badge text”.',
          de: 'Die Reihenfolge entspricht den Screenshots, bei denen „Badge-Text verwenden“ aktiviert ist.',
        }),
        type: 'array',
        of: [{ type: 'string' }],
        validation: (R) =>
          R.custom((value, context) => {
            const images = (context.parent as { images?: Array<{ hasBadge?: boolean }> } | undefined)?.images;
            if (!Array.isArray(images) || images.length === 0) return true;
            const expected = images.filter((image) => image?.hasBadge !== false).length;
            const actual = Array.isArray(value) ? value.filter((badge) => typeof badge === 'string' && badge.trim()).length : 0;
            return actual === expected
              ? true
              : t({
                  en: `Please enter exactly ${expected} badge text${expected === 1 ? '' : 's'}.`,
                  de: `Bitte genau ${expected} Badge-Text${expected === 1 ? '' : 'e'} eintragen.`,
                });
          }),
      }),
      defineField({
        name: 'images',
        title: t({ en: 'Screenshots', de: 'Screenshots' }),
        type: 'array',
        of: [
          {
            type: 'object',
            name: 'fixedProofImage',
            fields: [
              defineField({
                name: 'image',
                title: t({ en: 'Screenshot', de: 'Screenshot' }),
                type: 'imageWithAlt',
                validation: (R) => R.required(),
              }),
              defineField({
                name: 'hasBadge',
                title: t({ en: 'Use badge text', de: 'Badge-Text verwenden' }),
                description: t({
                  en: 'The matching text is maintained in the badge list above.',
                  de: 'Der zugehörige Text wird in der Badge-Liste darüber gepflegt.',
                }),
                type: 'boolean',
                initialValue: true,
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
                hidden: ({ parent }) => (parent as { hasBadge?: boolean } | undefined)?.hasBadge === false,
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
              select: { subtitle: 'crop', media: 'image', hasBadge: 'hasBadge' },
              prepare({ subtitle, media, hasBadge }) {
                return {
                  title: t({ en: 'Screenshot', de: 'Screenshot' }),
                  subtitle: [
                    hasBadge === false ? t({ en: 'Without badge', de: 'Ohne Badge' }) : undefined,
                    subtitle && subtitle !== 'none' ? subtitle : undefined,
                  ].filter(Boolean).join(' · ') || undefined,
                  media,
                };
              },
            },
          },
        ],
        validation: (R) => R.required().min(1).max(slot.key === 'customer-seelen-gruen' ? 4 : 3),
      }),
    ],
  });

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
      name: 'resultCards',
      title: t({ en: 'Result cards', de: 'Erfolgskarten' }),
      description: t({
        en: 'Fixed card structure for the homepage. Its content is independent from the AIO page.',
        de: 'Feste Kartenstruktur der Startseite. Die Inhalte sind unabhängig von der AIO-Seite.',
      }),
      type: 'object',
      options: { collapsible: true, collapsed: false },
      validation: (R) => R.required(),
      groups: [
        { name: 'own', title: t({ en: 'Own results (5)', de: 'Meine Erfolge (5)' }), default: true },
        { name: 'customer', title: t({ en: 'Customer results (9)', de: 'Kundenerfolge (9)' }) },
      ],
      fields: HOME_PROOF_CARD_SLOTS.map(fixedResultCardField),
    }),
    defineField({
      name: 'cards',
      title: t({ en: 'Legacy result cards', de: 'Bisherige Erfolgskarten' }),
      description: t({
        en: 'Compatibility data for the previous editor structure.',
        de: 'Kompatibilitätsdaten der bisherigen Eingabestruktur.',
      }),
      type: 'array',
      readOnly: true,
      hidden: ({ parent }) => Boolean((parent as { resultCards?: unknown } | undefined)?.resultCards),
      of: [
        {
          type: 'object',
          name: 'proofCard',
          fields: [
            defineField({ name: 'kind', title: 'Art', type: 'string' }),
            defineField({ name: 'source', title: 'Name / Rollenbezeichnung', type: 'string' }),
            defineField({ name: 'value', title: 'Große Kennzahl', type: 'string' }),
            defineField({ name: 'label', title: 'Beschreibung', type: 'string' }),
            defineField({
              name: 'images',
              title: 'Screenshots',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'proofImage',
                  fields: [
                    defineField({ name: 'image', title: 'Screenshot', type: 'imageWithAlt' }),
                    defineField({ name: 'badge', title: 'Badge-Text', type: 'string' }),
                    defineField({ name: 'badgePosition', title: 'Badge-Position', type: 'string' }),
                    defineField({ name: 'crop', title: 'Zuschnitt', type: 'string' }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
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
    select: { title: 'name', subtitle: 'heading', cards: 'cards', resultCards: 'resultCards' },
    prepare({ title, subtitle, cards, resultCards }) {
      const count = resultCards
        ? HOME_PROOF_CARD_SLOTS.filter((slot) => resultCards[slot.field]).length
        : Array.isArray(cards) ? cards.length : 0;
      const typeLabel = t({ en: 'Own & customer results', de: 'Meine Erfolge & Kundenerfolge' });
      return {
        title: title || typeLabel,
        subtitle: `${subtitle || typeLabel} · ${count}`,
      };
    },
  },
});
