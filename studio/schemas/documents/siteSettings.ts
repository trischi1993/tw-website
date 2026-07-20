import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { languageField, languageLabel } from '../objects/language';

/**
 * EINSTELLUNGEN (pro Sprache ein Singleton: siteSettings-de / siteSettings-en).
 * Hier stehen Name, Kontaktdaten, Navigation und Footer-Links.
 * Diese Inhalte erscheinen im Kopf- und Fußbereich jeder Seite der Sprache.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Einstellungen',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'Allgemein', default: true },
    { name: 'contact', title: 'Kontakt' },
    { name: 'navigation', title: 'Navigation & Footer' },
  ],
  fields: [
    { ...languageField({ hidden: true }), group: 'general' },
    defineField({
      name: 'siteName',
      title: 'Name der Website',
      description: 'Der Name der Website, wie er im Logo-Text und im Browser-Tab erscheint (z. B. „Meine Firma“).',
      type: 'string',
      group: 'general',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Leitspruch',
      description: 'Der kurze Leitspruch unter dem Namen (z. B. „Kurz gesagt, worum es geht.“).',
      type: 'string',
      group: 'general',
    }),

    /* --- Kontakt ------------------------------------------------------------ */
    defineField({
      name: 'contact',
      title: 'Kontaktdaten',
      description: 'Anschrift und Kontaktmöglichkeiten. Erscheinen im Footer und in den strukturierten Daten für Google.',
      type: 'object',
      group: 'contact',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'ownerName',
          title: 'Inhaber / Firma',
          description: 'Wer hinter der Website steht (z. B. „Meine Firma GmbH“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'addressLines',
          title: 'Anschrift (Zeilen)',
          description: 'Die Straße/Hausnummer in einer oder mehreren Zeilen (z. B. „Beispielstraße 1“). Eine Zeile pro Eintrag.',
          type: 'array',
          of: [{ type: 'string' }],
          validation: (R) => R.required().min(1),
        }),
        defineField({
          name: 'locality',
          title: 'Ort',
          description: 'Die Ortschaft (z. B. „Berlin“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'region',
          title: 'Region',
          description: 'Die Region/Provinz (z. B. „Bayern“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'postalCode',
          title: 'Postleitzahl',
          description: 'Die PLZ (z. B. „10115“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'country',
          title: 'Land',
          description: 'Das Land in Worten (z. B. „Deutschland“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'countryCode',
          title: 'Länderkürzel',
          description: 'Das zweistellige Länderkürzel (z. B. „DE“ für Deutschland).',
          type: 'string',
          validation: (R) => R.required().length(2).uppercase(),
        }),
        defineField({
          name: 'email',
          title: 'E-Mail',
          description: 'Die Kontakt-E-Mail-Adresse.',
          type: 'string',
          validation: (R) => R.required().email(),
        }),
        defineField({
          name: 'phone',
          title: 'Telefonnummer (angezeigt)',
          description: 'Die Telefonnummer, wie sie angezeigt wird (z. B. „+49 30 0000000“).',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'phoneHref',
          title: 'Telefonnummer (für Anruf-Link)',
          description:
            'Dieselbe Nummer ohne Leerzeichen, mit „tel:“ davor (z. B. „tel:+49300000000“). So funktioniert der Klick-zum-Anrufen-Link.',
          type: 'string',
          validation: (R) =>
            R.required().regex(/^tel:\+?[0-9]+$/, {
              name: 'tel-Link',
              invert: false,
            }).error('Format: „tel:“ gefolgt von der Nummer ohne Leerzeichen, z. B. tel:+49300000000.'),
        }),
        defineField({
          name: 'geo',
          title: 'Koordinaten (für Kartenlink)',
          description: 'Geografische Lage für die Karte. Optional.',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({
              name: 'lat',
              title: 'Breitengrad (lat)',
              description: 'z. B. 46.6213',
              type: 'number',
            }),
            defineField({
              name: 'lng',
              title: 'Längengrad (lng)',
              description: 'z. B. 10.6402',
              type: 'number',
            }),
          ],
        }),
      ],
    }),

    /* --- Navigation & Footer ------------------------------------------------ */
    defineField({
      name: 'nav',
      title: 'Hauptnavigation',
      description: 'Die Links im Menü oben. Reihenfolge per Ziehen änderbar.',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'navItem' }],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'legalLinks',
      title: 'Rechtliche Links (Footer)',
      description: 'Links wie Impressum und Datenschutz, ganz unten im Footer.',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'navItem' }],
    }),
    defineField({
      name: 'social',
      title: 'Social-Media-Links',
      description: 'Profile wie Instagram. Können leer bleiben.',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'navItem' }],
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer-Text',
      description: 'Ein kurzer beschreibender Satz im Footer.',
      type: 'text',
      rows: 2,
      group: 'general',
    }),
  ],
  preview: {
    select: { title: 'siteName', subtitle: 'tagline', language: 'language' },
    prepare({ title, subtitle, language }) {
      const lang = languageLabel(language);
      return {
        title: title || 'Einstellungen',
        subtitle: [lang, subtitle || 'Website-Einstellungen'].filter(Boolean).join(' · '),
      };
    },
  },
});
