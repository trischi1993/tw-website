#!/usr/bin/env node
/**
 * Erzeugt studio/seed.ndjson – den deterministischen Start-Datensatz für das
 * Sanity-Dataset (tristanweithaler.com, einsprachig Deutsch).
 *
 *   npm run seed:build          (im studio/)
 *   npm run import-seed         (baut den Seed und importiert ihn)
 *
 * Inhalte kommen aus EINER Quelle: shared/site-content.mjs (dieselbe, die
 * src/lib/content/seed.ts lokal instanziiert) – gleiche Texte, gleiche _key
 * → der Umstieg auf Sanity bleibt byte-stabil. Bilder werden als
 * `_sanityAsset: image@file://…`-Referenzen emittiert; `sanity dataset import`
 * lädt die Dateien beim Import hoch.
 *
 * Transformationen gegenüber der Quelle (nur Sanity-Formalia):
 *  - `anchor` (String) → Slug-Objekt
 *  - eingebettete services/testimonials der Sections entfernt (kommen zur
 *    Laufzeit per GROQ-Subquery herein) → eigene service-/testimonial-Dokumente
 *  - Array-Objekte bekommen den _type ihres Schema-Members (item/card/…)
 *  - nav/legalLinks/social bekommen _key
 */
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildContent } from '../../shared/site-content.mjs';

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = path.resolve(studioRoot, '../src/assets/images');

/* img()-Callback: Sanity-Upload-Referenz mit absolutem file://-Pfad. */
function img(relPath, alt, caption) {
  const abs = path.join(assetsRoot, relPath);
  if (!existsSync(abs)) throw new Error(`[make-seed] Bild fehlt: ${abs}`);
  return {
    _type: 'image',
    _sanityAsset: `image@file://${abs}`,
    alt,
    ...(caption ? { caption } : {}),
  };
}

const content = buildContent({ img });

/* --- Sanity-Formalia ------------------------------------------------------- */

const withKeys = (items = [], prefix = 'k') =>
  items.map((it, i) => ({ _key: `${prefix}${i}`, ...it }));

/** _type der Array-Member je Section-Typ und Feld (== Studio-Schema). */
const MEMBER_TYPE = {
  sectionGalleryMarquee: { items: 'item' },
  sectionUspList: { items: 'item' },
  sectionFaq: { items: 'item' },
  sectionTimeline: { items: 'item' },
  sectionBonuses: { cards: 'card' },
  sectionInterests: { highlights: 'highlight' },
  sectionPortraitHero: { socials: 'social' },
};

function toSanitySection(section) {
  const { services, testimonials, anchor, ...rest } = section;
  const out = { ...rest };
  if (anchor) out.anchor = { _type: 'slug', current: anchor };
  const memberTypes = MEMBER_TYPE[section._type] ?? {};
  for (const [field, memberType] of Object.entries(memberTypes)) {
    if (Array.isArray(out[field])) {
      out[field] = out[field].map((item) => ({ _type: memberType, ...item }));
    }
  }
  return out;
}

const toSanityPage = (page) => ({
  _id: `page-${page.slug}`,
  _type: 'page',
  title: page.title,
  slug: { _type: 'slug', current: page.slug },
  seo: { noindex: false, ...page.seo },
  sections: page.sections.map(toSanitySection),
});

/* --- Dokumente ------------------------------------------------------------- */

const s = content.siteSettings;

const docs = [
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: s.siteName,
    tagline: s.tagline,
    contact: s.contact,
    nav: withKeys(s.nav, 'nav'),
    headerCta: s.headerCta,
    legalLinks: withKeys(s.legalLinks, 'legal'),
    social: withKeys(s.social, 'social'),
    footerNote: s.footerNote,
  },
  {
    _id: 'homePage',
    _type: 'homePage',
    seo: { noindex: false, ...content.home.seo },
    sections: content.home.sections.map(toSanitySection),
  },
  ...content.pages.map(toSanityPage),
  ...content.services.map((svc) => ({
    _id: svc.id,
    _type: 'service',
    name: svc.name,
    formName: svc.formName,
    category: svc.category,
    description: svc.description,
    image: svc.image,
    ...(svc.order != null ? { order: svc.order } : {}),
  })),
  ...content.testimonials.map((tst) => ({
    _id: tst.id,
    _type: 'testimonial',
    name: tst.name,
    ...(tst.role ? { role: tst.role } : {}),
    text: tst.text,
    image: tst.image,
    ...(tst.order != null ? { order: tst.order } : {}),
  })),
];

const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
await writeFile(path.join(studioRoot, 'seed.ndjson'), ndjson);
console.log(`Wrote studio/seed.ndjson (${docs.length} documents).`);
