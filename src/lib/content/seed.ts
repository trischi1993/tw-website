import type {
  SiteSettings,
  HomeContent,
  SitePage,
  EyebrowEl,
  HeadingEl,
  ParagraphEl,
  HeadingLevel,
  RichText,
  CtaEl,
  CtaVariant,
} from './types';
import type { Locale } from '../i18n';

/* ===========================================================================
   SEED-INHALT (zweisprachig, generischer Platzhalter)

   Quelle der Inhalte, solange die Seite ohne Sanity läuft. Pro Sprache (de/en)
   ein eigener Datensatz – wie später in Sanity (ein Dokument je Sprache). Die
   _key der Abschnitte sind in beiden Sprachen gleich, damit Struktur und
   Sanity-Seed deckungsgleich bleiben.

   Der Inhalt einer Section ist EINE `content`-Liste aus Blöcken (Überzeile /
   Überschrift / Absatz / CTA); Überschrift/Absatz tragen Rich Text (Portable Text).
   Der Starter liefert EINEN neutralen Abschnittstyp (sectionText); pro Projekt
   die Sektionen des Designs ergänzen. Alles hier ist generischer Platzhalter.
   =========================================================================== */

/* Content-Block-Helfer: bauen die neuen typisierten Blöcke inkl. Rich Text.
   Deterministische _key (kein Zufall) → byte-stabiler Seed. */
function rt(keyBase: string, text: string): RichText {
  return [
    {
      _type: 'block',
      _key: `${keyBase}-b`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `${keyBase}-s`, text, marks: [] }],
    },
  ];
}
function eyebrow(key: string, text: string): EyebrowEl {
  return { _key: key, _type: 'textEyebrow', text };
}
function heading(key: string, text: string, level?: HeadingLevel): HeadingEl {
  return { _key: key, _type: 'textHeading', text: rt(key, text), level };
}
function paragraph(key: string, text: string): ParagraphEl {
  return { _key: key, _type: 'textParagraph', text: rt(key, text) };
}
function cta(key: string, label: string, href: string, variant?: CtaVariant): CtaEl {
  return { _key: key, _type: 'cta', label, href, variant };
}

const contactBase = {
  ownerName: 'Ihre Firma',
  addressLines: ['Beispielstraße 1'],
  locality: 'Ort',
  region: 'Region',
  postalCode: '00000',
  countryCode: 'DE',
  email: 'hallo@example.com',
  phone: '+49 000 000000',
  phoneHref: 'tel:+49000000000',
};

export const siteSettings: Record<Locale, SiteSettings> = {
  de: {
    siteName: 'Astro Starter',
    tagline: 'Ein schlanker Astro- und Sanity-Starter.',
    contact: { ...contactBase, country: 'Deutschland' },
    nav: [{ label: 'Beispielseite', href: '/beispiel/' }],
    legalLinks: [],
    social: [],
    footerNote: 'Diesen Hinweis in Sanity oder im Seed (src/lib/content/seed.ts) ersetzen.',
  },
  en: {
    siteName: 'Astro Starter',
    tagline: 'A clean Astro and Sanity starter.',
    contact: { ...contactBase, country: 'Germany' },
    nav: [{ label: 'Example page', href: '/en/example/' }],
    legalLinks: [],
    social: [],
    footerNote: 'Replace this note in Sanity or the seed (src/lib/content/seed.ts).',
  },
};

/* --------------------------------------------------------------------------- */

export const home: Record<Locale, HomeContent> = {
  de: {
    seo: {
      title: 'Astro Starter',
      description:
        'Ein schlanker, generischer Astro- und Sanity-Starter. Diesen Inhalt in Sanity oder im Seed ersetzen.',
    },
    sections: [
      {
        _type: 'sectionText',
        _key: 'intro',
        name: 'Intro',
        content: [
          eyebrow('intro-e', 'Abschnitt'),
          heading('intro-h', 'Abschnitts-Überschrift'),
          paragraph('intro-p0', 'Inhalt in Sanity oder im Seed (src/lib/content/seed.ts) hinzufügen.'),
          paragraph('intro-p1', 'Jeder Absatz ist ein eigener, im Canvas anklickbarer Block.'),
          cta('intro-cta', 'Beispielseite ansehen', '/beispiel/', 'primary'),
        ],
      },
      {
        _type: 'sectionText',
        _key: 'second',
        name: 'Zweiter Abschnitt',
        tone: 'alt',
        align: 'center',
        content: [
          heading('second-h', 'Zweiter Abschnitt'),
          paragraph('second-p0', 'Abschnitte sind modular: frei sortierbar, im Farbton (hell/alt/dunkel/Marke) und in der Ausrichtung anpassbar – auf der Startseite wie auf jeder Unterseite.'),
          cta('second-cta', 'Kontakt aufnehmen', 'mailto:hallo@example.com', 'link'),
        ],
      },
    ],
  },

  en: {
    seo: {
      title: 'Astro Starter',
      description:
        'A clean, generic Astro and Sanity starter. Replace this content in Sanity or the seed.',
    },
    sections: [
      {
        _type: 'sectionText',
        _key: 'intro',
        name: 'Intro',
        content: [
          eyebrow('intro-e', 'Section'),
          heading('intro-h', 'Section heading'),
          paragraph('intro-p0', 'Add your content in Sanity or the seed (src/lib/content/seed.ts).'),
          paragraph('intro-p1', 'Each paragraph is its own block — clickable in the canvas.'),
          cta('intro-cta', 'View example page', '/en/example/', 'primary'),
        ],
      },
      {
        _type: 'sectionText',
        _key: 'second',
        name: 'Second section',
        tone: 'alt',
        align: 'center',
        content: [
          heading('second-h', 'Second section'),
          paragraph('second-p0', 'Sections are modular: reorder them freely and tweak tone (light/alt/dark/brand) and alignment — on the home page and on any subpage.'),
          cta('second-cta', 'Get in touch', 'mailto:hallo@example.com', 'link'),
        ],
      },
    ],
  },
};

/* ---------------------------------------------------------------------------
   Eine zweisprachige Beispielseite (DE/EN), verknüpft über `translations`. Zeigt
   das Seiten-System + die Sprachpaarung. In Sanity übernimmt die Verknüpfung das
   „Übersetzungen“-Menü (translation.metadata); hier im Seed wird sie direkt
   gesetzt. Slugs dürfen je Sprache abweichen (beispiel ↔ example).
   --------------------------------------------------------------------------- */
const exampleTranslations = [
  { language: 'de' as Locale, slug: 'beispiel' },
  { language: 'en' as Locale, slug: 'example' },
];

export const pages: SitePage[] = [
  {
    language: 'de',
    title: 'Beispielseite',
    slug: 'beispiel',
    translations: exampleTranslations,
    seo: {
      title: 'Beispielseite',
      description: 'Eine Beispiel-Unterseite. In Sanity oder im Seed ersetzen.',
    },
    sections: [
      {
        _type: 'sectionText',
        _key: 'intro',
        name: 'Intro',
        content: [
          heading('ex-intro-h', 'Beispielseite'),
          paragraph('ex-intro-p0', 'Diese Unterseite nutzt dasselbe modulare Abschnitts-System wie die Startseite.'),
          paragraph('ex-intro-p1', 'Abschnitte in Sanity oder im Seed hinzufügen, entfernen und umsortieren.'),
        ],
      },
    ],
  },
  {
    language: 'en',
    title: 'Example page',
    slug: 'example',
    translations: exampleTranslations,
    seo: {
      title: 'Example page',
      description: 'An example subpage. Replace it in Sanity or the seed.',
    },
    sections: [
      {
        _type: 'sectionText',
        _key: 'intro',
        name: 'Intro',
        content: [
          heading('ex-intro-h', 'Example page'),
          paragraph('ex-intro-p0', 'This subpage uses the same modular section system as the home page.'),
          paragraph('ex-intro-p1', 'Add, remove and reorder sections in Sanity or the seed.'),
        ],
      },
    ],
  },
];
