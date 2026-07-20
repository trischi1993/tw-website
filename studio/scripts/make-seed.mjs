#!/usr/bin/env node
/**
 * Erzeugt studio/seed.ndjson – den deterministischen, zweisprachigen
 * Start-Datensatz für das Sanity-Dataset.
 *
 *   node studio/scripts/make-seed.mjs       (oder: npm run seed:build  im studio/)
 *   sanity dataset import seed.ndjson production --replace
 *
 * Inhalt spiegelt src/lib/content/seed.ts (gleiche Texte, gleiche Abschnitts-
 * keys). Alle _key/_id sind fest und index-basiert, keine Zufalls-IDs, keine
 * Zeitstempel → derselbe Input ergibt immer dasselbe Dataset.
 *
 * Enthält:
 *  - Singletons je Sprache: siteSettings-de/-en, homePage-de/-en (feste IDs)
 *  - eine zweisprachige Beispielseite: page „example-de“/„example-en“ plus ein
 *    translation.metadata-Dokument, das beide verknüpft (so wie es das Plugin
 *    @sanity/document-internationalization beim „Übersetzen“ anlegt).
 *
 * Bewusst nur textbasierte Abschnitte (kein Bild) → der Import braucht keine
 * Asset-Uploads und bleibt reproduzierbar.
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

const settings = {
  de: {
    siteName: 'Astro Starter',
    tagline: 'Ein schlanker Astro- und Sanity-Starter.',
    contact: { ...contactBase, country: 'Deutschland' },
    nav: [{ label: 'Beispielseite', href: '/beispiel/' }],
    footerNote: 'Diesen Hinweis in Sanity oder im Seed (src/lib/content/seed.ts) ersetzen.',
  },
  en: {
    siteName: 'Astro Starter',
    tagline: 'A clean Astro and Sanity starter.',
    contact: { ...contactBase, country: 'Germany' },
    nav: [{ label: 'Example page', href: '/en/example/' }],
    footerNote: 'Replace this note in Sanity or the seed (src/lib/content/seed.ts).',
  },
};

const homeSeo = {
  de: {
    title: 'Astro Starter',
    description:
      'Ein schlanker, generischer Astro- und Sanity-Starter. Diesen Inhalt in Sanity oder im Seed ersetzen.',
  },
  en: {
    title: 'Astro Starter',
    description:
      'A clean, generic Astro and Sanity starter. Replace this content in Sanity or the seed.',
  },
};

const homeSections = {
  de: [
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
  ],
  en: [
    {
      _type: 'sectionText',
      _key: 'intro',
      name: 'Intro',
      content: [
        eyebrow('intro-e', 'Section'),
        heading('intro-h', 'Section heading'),
        paragraph('intro-p0', 'Add your content in Sanity or the seed (src/lib/content/seed.ts).'),
        paragraph('intro-p1', 'Each paragraph is its own block — clickable in the canvas.'),
        cta('intro-cta', 'View example page', '/en/example/'),
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
};

const examplePage = {
  de: {
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
  },
  en: {
    title: 'Example page',
    slug: 'example',
    seo: { title: 'Example page', description: 'An example subpage. Replace it in Sanity or the seed.' },
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
};

const withKeys = (items) => items.map((it, i) => ({ _key: `nav${i}`, ...it }));

const docs = [];
for (const lang of ['de', 'en']) {
  const s = settings[lang];
  docs.push({
    _id: `siteSettings-${lang}`,
    _type: 'siteSettings',
    language: lang,
    siteName: s.siteName,
    tagline: s.tagline,
    contact: s.contact,
    nav: withKeys(s.nav),
    legalLinks: [],
    social: [],
    footerNote: s.footerNote,
  });
  docs.push({
    _id: `homePage-${lang}`,
    _type: 'homePage',
    language: lang,
    seo: { ...homeSeo[lang], noindex: false },
    sections: homeSections[lang],
  });
  const ex = examplePage[lang];
  docs.push({
    _id: `example-${lang}`,
    _type: 'page',
    language: lang,
    title: ex.title,
    slug: { _type: 'slug', current: ex.slug },
    seo: { ...ex.seo, noindex: false },
    sections: ex.sections,
  });
}

// translation.metadata verknüpft die beiden Beispielseiten – so wie es das
// Plugin beim „Übersetzen“ anlegt. Format seit Plugin v6 (intern
// sanity-plugin-internationalized-array v5): die Sprache steht in einem
// eigenen `language`-Feld, nicht mehr im `_key`; Items tragen den Typ
// `internationalizedArrayReferenceValue`.
docs.push({
  _id: 'example-translations',
  _type: 'translation.metadata',
  schemaTypes: ['page'],
  translations: [
    {
      _key: 'de',
      _type: 'internationalizedArrayReferenceValue',
      language: 'de',
      value: { _type: 'reference', _ref: 'example-de' },
    },
    {
      _key: 'en',
      _type: 'internationalizedArrayReferenceValue',
      language: 'en',
      value: { _type: 'reference', _ref: 'example-en' },
    },
  ],
});

const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
await writeFile(path.join(studioRoot, 'seed.ndjson'), ndjson);
console.log(`Wrote studio/seed.ndjson (${docs.length} documents).`);
