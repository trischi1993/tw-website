import { defineType, defineField, type Rule } from 'sanity';

/**
 * Ein Link mit Beschriftung – für Navigation, Footer-Links und Social-Profile.
 */
export default defineType({
  name: 'navItem',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Beschriftung',
      description: 'Der sichtbare Text des Links (z. B. „Ferienwohnung“ oder „Instagram“).',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'href',
      title: 'Ziel (URL)',
      description:
        'Wohin der Link führt. Interne Seiten beginnen mit „/“ (z. B. „/ferienwohnung/“ oder „/#willkommen“), externe Links mit „https://“.',
      type: 'string',
      // Scheme-Allowlist gegen javascript:/data:-XSS (zweite Ebene: safeHref im
      // Renderer, src/lib/safe-href.ts).
      validation: (R) =>
        (R as unknown as Rule).required().uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
});
