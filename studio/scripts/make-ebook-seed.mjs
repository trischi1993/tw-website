#!/usr/bin/env node
/**
 * Erzeugt ausschließlich das Sanity-Singleton der E-Book-Landingpage.
 * Der getrennte Seed verhindert, dass die Integration versehentlich andere
 * bestehende Website-Dokumente ersetzt oder erneut importiert.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildEbookContent } from '../../shared/ebook-content.mjs';

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = path.resolve(studioRoot, '../src/assets/images');
const generatedRoot = path.join(studioRoot, '.generated');
const outputPath = path.join(generatedRoot, 'ebook-seed.ndjson');

function img(relPath, alt, caption) {
  const abs = path.join(assetsRoot, relPath);
  if (!existsSync(abs)) throw new Error(`[make-ebook-seed] Bild fehlt: ${abs}`);
  return {
    _type: 'imageWithAlt',
    _sanityAsset: `image@file://${abs}`,
    alt,
    ...(caption ? { caption } : {}),
  };
}

const content = buildEbookContent({ img });

const memberTypes = {
  'press.items': 'item',
  'benefits.items': 'item',
  'author.stats': 'stat',
  'chapters.items': 'chapter',
  'evergreen.results': 'item',
  'bundle.items': 'item',
  'audience.items': 'item',
  'reviews.messages': 'message',
  'faq.items': 'item',
};

for (const [fieldPath, memberType] of Object.entries(memberTypes)) {
  const [objectName, fieldName] = fieldPath.split('.');
  const items = content[objectName]?.[fieldName];
  if (!Array.isArray(items)) continue;
  content[objectName][fieldName] = items.map((item) => ({ _type: memberType, ...item }));
}

const document = {
  _id: 'ebookPage',
  _type: 'ebookPage',
  ...content,
  seo: { noindex: false, ...content.seo },
};

await mkdir(generatedRoot, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(document)}\n`);
console.log(`Wrote ${outputPath} (1 document).`);
