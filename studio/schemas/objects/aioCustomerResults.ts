import { defineField, defineType } from 'sanity';
import { AIO_CUSTOMER_RESULTS } from '../../../shared/aio-customer-results.mjs';

const requiredText = (
  name: string,
  title: string,
  group: 'intro' | 'growth' | 'case' | 'more',
  rows?: number,
) =>
  defineField({
    name,
    title,
    type: rows ? 'text' : 'string',
    ...(rows ? { rows } : {}),
    group,
    validation: (R) => R.required(),
  });

const growthStageField = (
  name: 'reach' | 'community' | 'customers',
  title: string,
) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'label',
        title: 'Schritt / Kategorie',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'heading',
        title: 'Überschrift',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'text',
        title: 'Beschreibung',
        type: 'text',
        rows: 2,
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'signal',
        title: 'Unteres Ergebnis-Label',
        type: 'string',
        validation: (R) => R.required(),
      }),
    ],
  });

const proofField = (
  name: 'proofFollowers' | 'proofViews' | 'proofLeads',
  title: string,
) =>
  defineField({
    name,
    title,
    type: 'object',
    group: 'case',
    fields: [
      defineField({
        name: 'badge',
        title: 'Badge-Text auf dem Screenshot',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'value',
        title: 'Große Kennzahl',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'description',
        title: 'Beschreibung unter der Kennzahl',
        type: 'string',
        validation: (R) => R.required(),
      }),
    ],
  });

const customerField = (
  name: keyof typeof AIO_CUSTOMER_RESULTS.customers,
  title: string,
  badgeCount: number,
) =>
  defineField({
    name,
    title,
    type: 'object',
    initialValue: AIO_CUSTOMER_RESULTS.customers[name],
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: 'source',
        title: 'Kunde / Rollenbezeichnung',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'value',
        title: 'Große Kennzahl',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'label',
        title: 'Beschreibung unter der Kennzahl',
        type: 'string',
        validation: (R) => R.required(),
      }),
      defineField({
        name: 'badges',
        title: 'Badge-Texte auf den Screenshots',
        description:
          'Die Reihenfolge entspricht den Bildern der Karte. Das Bildlayout selbst bleibt geschützt im Code.',
        type: 'array',
        of: [{ type: 'string' }],
        validation: (R) => R.required().length(badgeCount),
      }),
    ],
  });

export default defineType({
  name: 'aioCustomerResults',
  title: 'AIO – Kundenerfolge',
  type: 'object',
  description:
    'Texte, Kennzahlen und Badge-Texte des Kundenerfolge-Bereichs. Bilder, Zuschnitte und Positionen bleiben im Website-Layout geschützt.',
  groups: [
    { name: 'intro', title: 'Abschnitts-Einstieg', default: true },
    { name: 'growth', title: 'Wachstumssystem' },
    { name: 'case', title: 'Steffi-Fallstudie' },
    { name: 'more', title: 'Alle weiteren Kundenerfolge (8)' },
  ],
  initialValue: AIO_CUSTOMER_RESULTS,
  fields: [
    requiredText('eyebrow', 'Kleine Überschrift (Eyebrow)', 'intro'),
    requiredText('heading', 'Hauptüberschrift', 'intro'),
    requiredText('intro', 'Einleitungstext', 'intro', 3),

    defineField({
      name: 'growthSystem',
      title: 'Dreistufiges Wachstumssystem',
      type: 'object',
      group: 'growth',
      initialValue: AIO_CUSTOMER_RESULTS.growthSystem,
      fields: [
        defineField({
          name: 'heading',
          title: 'Überschrift',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'status',
          title: 'Status-Label oben rechts',
          type: 'string',
          validation: (R) => R.required(),
        }),
        growthStageField('reach', 'Schritt 1 – Reichweite'),
        growthStageField('community', 'Schritt 2 – Follower'),
        growthStageField('customers', 'Schritt 3 – Kunden'),
      ],
    }),

    requiredText('caseLabel', 'Fallstudien-Label', 'case'),
    requiredText('caseIdentity', 'Kundenname / Unternehmen', 'case'),
    requiredText('caseHeadline', 'Fallstudien-Überschrift', 'case'),
    requiredText('durationBadge', 'Zeit-/Status-Badge', 'case'),
    proofField('proofFollowers', 'Ergebnis 1 – Follower'),
    proofField('proofViews', 'Ergebnis 2 – Aufrufe'),
    proofField('proofLeads', 'Ergebnis 3 – Kommentare / Leads'),
    requiredText('comparisonValue', 'Vorher-/Nachher-Kennzahl', 'case'),
    requiredText('comparisonText', 'Vorher-/Nachher-Beschreibung', 'case'),
    requiredText('beforeLabel', 'Regler-Label vorher', 'case'),
    requiredText('afterLabel', 'Regler-Label nachher', 'case'),

    requiredText('moreHeading', 'Überschrift', 'more'),
    requiredText('scrollLabel', 'Scroll-Hinweis', 'more'),
    defineField({
      name: 'customers',
      title: 'Alle weiteren Kundenerfolge (8)',
      description:
        'Hier findest du Seelen Grün, Friedrich, Christina Starke, Chalet Lefiro, Naomi, Naturnser Alm, die Küche by Untermarzoner und Alpin Arena Schnals.',
      type: 'object',
      group: 'more',
      initialValue: AIO_CUSTOMER_RESULTS.customers,
      options: { collapsible: true, collapsed: false },
      fields: [
        customerField('seelenGruen', 'Valeria & Raphael · Seelen Grün', 3),
        customerField('friedrich', 'Friedrich · Metallkünstler', 2),
        customerField('christina', 'Christina Starke · DIY & Interior', 2),
        customerField('chaletLefiro', 'Chalet Lefiro · Luxury Chalet', 2),
        customerField('naomi', 'Naomi · Mentorin', 2),
        customerField('naturnserAlm', 'Naturnser Alm', 2),
        customerField('untermarzoner', 'die Küche by Untermarzoner', 1),
        customerField('alpinArena', 'Alpin Arena Schnals', 1),
      ],
    }),
    requiredText('closingIntro', 'Abschlusskarte – Einstieg', 'more'),
    requiredText('closingHeading', 'Abschlusskarte – Überschrift', 'more', 2),
    requiredText('closingHighlight', 'Abschlusskarte – Hervorhebung', 'more'),
    requiredText('closingSource', 'Abschlusskarte – kleines Label', 'more'),
    requiredText('closingText', 'Abschlusskarte – Text', 'more', 2),
    requiredText('closingCta', 'Abschlusskarte – Button', 'more'),
  ],
});
