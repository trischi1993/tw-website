#!/usr/bin/env node
/**
 * Erzeugt studio/seed.ndjson – den deterministischen, einsprachigen (Deutsch)
 * Start-Datensatz für das Sanity-Dataset.
 *
 *   node studio/scripts/make-seed.mjs       (oder: npm run seed:build  im studio/)
 *   sanity dataset import seed.ndjson production --replace
 *
 * Inhalt spiegelt src/lib/content/seed.ts (gleiche Texte, gleiche Abschnitts-
 * keys). Alle _key/_id sind fest und index-basiert, keine Zufalls-IDs, keine
 * Zeitstempel → derselbe Input ergibt immer dasselbe Dataset.
 *
 * Enthält die Singletons siteSettings + homePage (feste IDs) und eine
 * Beispielseite. Bewusst nur textbasierte Abschnitte (kein Bild) → der Import
 * braucht keine Asset-Uploads und bleibt reproduzierbar.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Content-Block-Helfer: bauen die Blöcke der `content`-Liste. Überschrift/Absatz
   tragen Rich Text (Portable Text). Deterministische keys (kein Zufall). */
const rt = (key, text) => [
  {
    _type: 'block',
    _key: `${key}-b`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
  },
];
const eyebrow = (key, text) => ({ _type: 'textEyebrow', _key: key, text });
const heading = (key, text, level) => ({
  _type: 'textHeading',
  _key: key,
  text: rt(key, text),
  ...(level ? { level } : {}),
});
const paragraph = (key, text) => ({ _type: 'textParagraph', _key: key, text: rt(key, text) });
const cta = (key, label, href, variant = 'primary') => ({
  _type: 'cta',
  _key: key,
  label,
  href,
  variant,
});

const settings = {
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
  footerNote: 'Diesen Hinweis in Sanity oder im Seed (src/lib/content/seed.ts) ersetzen.',
};

const homeSeo = {
  title: 'Tristan Weithaler',
  description: 'Platzhalter-Startseite. Diesen Inhalt in Sanity oder im Seed ersetzen.',
};

const homeSections = [
  {
    _type: 'sectionText',
    _key: 'intro',
    name: 'Intro',
    content: [
      eyebrow('intro-e', 'Abschnitt'),
      heading('intro-h', 'Abschnitts-Überschrift'),
      paragraph('intro-p0', 'Inhalt in Sanity oder im Seed (src/lib/content/seed.ts) hinzufügen.'),
      paragraph('intro-p1', 'Jeder Absatz ist ein eigener, im Canvas anklickbarer Block.'),
      cta('intro-cta', 'Beispielseite ansehen', '/beispiel/'),
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
];

const examplePage = {
  title: 'Beispielseite',
  slug: 'beispiel',
  seo: { title: 'Beispielseite', description: 'Eine Beispiel-Unterseite. In Sanity oder im Seed ersetzen.' },
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
};

const withKeys = (items) => items.map((it, i) => ({ _key: `nav${i}`, ...it }));

const docs = [
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: settings.siteName,
    tagline: settings.tagline,
    contact: settings.contact,
    nav: withKeys(settings.nav),
    legalLinks: [],
    social: [],
    footerNote: settings.footerNote,
  },
  {
    _id: 'homePage',
    _type: 'homePage',
    seo: { ...homeSeo, noindex: false },
    sections: homeSections,
  },
  {
    _id: 'page-beispiel',
    _type: 'page',
    title: examplePage.title,
    slug: { _type: 'slug', current: examplePage.slug },
    seo: { ...examplePage.seo, noindex: false },
    sections: examplePage.sections,
  },
];

const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
await writeFile(path.join(studioRoot, 'seed.ndjson'), ndjson);
console.log(`Wrote studio/seed.ndjson (${docs.length} documents).`);
