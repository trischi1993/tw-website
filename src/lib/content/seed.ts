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

/* ===========================================================================
   SEED-INHALT (einsprachig Deutsch, generischer Platzhalter)

   Quelle der Inhalte, solange die Seite ohne Sanity läuft. Die Struktur ist
   deckungsgleich mit dem Sanity-Seed (studio/scripts/make-seed.mjs) – gleiche
   Texte, gleiche _key –, damit der Umstieg auf Sanity byte-stabil bleibt.

   Der Inhalt einer Section ist EINE `content`-Liste aus Blöcken (Überzeile /
   Überschrift / Absatz / CTA); Überschrift/Absatz tragen Rich Text (Portable Text).
   =========================================================================== */

/* Content-Block-Helfer: bauen die typisierten Blöcke inkl. Rich Text.
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

export const siteSettings: SiteSettings = {
  siteName: 'Tristan Weithaler',
  tagline: 'Südtirols erster Social Media Business Coach',
  contact: {
    ownerName: 'Tristan Weithaler',
    addressLines: ['Beispielstraße 1'],
    locality: 'Ort',
    region: 'Südtirol',
    postalCode: '00000',
    country: 'Italien',
    countryCode: 'IT',
    email: 'hallo@example.com',
    phone: '+39 000 000000',
    phoneHref: 'tel:+39000000000',
  },
  nav: [{ label: 'Beispielseite', href: '/beispiel/' }],
  legalLinks: [],
  social: [],
  footerNote: 'Diesen Hinweis in Sanity oder im Seed (src/lib/content/seed.ts) ersetzen.',
};

/* --------------------------------------------------------------------------- */

export const home: HomeContent = {
  seo: {
    title: 'Tristan Weithaler',
    description:
      'Platzhalter-Startseite. Diesen Inhalt in Sanity oder im Seed ersetzen.',
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
};

/* --------------------------------------------------------------------------- */

export const pages: SitePage[] = [
  {
    title: 'Beispielseite',
    slug: 'beispiel',
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
];
