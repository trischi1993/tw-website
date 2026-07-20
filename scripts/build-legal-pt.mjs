#!/usr/bin/env node
/**
 * Konvertiert die Rechtstexte (shared/legal/*.md, 1:1 aus dem Webflow-Export
 * extrahiert) in Portable-Text-Module (shared/legal/*-pt.mjs), die sowohl der
 * lokale Seed (src/lib/content/seed.ts) als auch der Sanity-Seed
 * (studio/scripts/make-seed.mjs) importieren. Deterministische _key.
 *
 *   node scripts/build-legal-pt.mjs
 *
 * Unterstützt: ## / ### / #### Überschriften, Absätze (Zeilenumbrüche innerhalb
 * eines Absatzes bleiben als \n erhalten → CSS white-space: pre-line),
 * [Text](URL)-Links, **fett**, - Listen.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const legalDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../shared/legal');

/** Inline-Markdown (Links, **fett**) → Portable-Text-Spans + markDefs. */
function parseInline(text, keyBase) {
  const children = [];
  const markDefs = [];
  let rest = text;
  let i = 0;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/;
  while (rest.length) {
    const m = rest.match(pattern);
    if (!m) {
      children.push({ _type: 'span', _key: `${keyBase}-s${i++}`, text: rest, marks: [] });
      break;
    }
    if (m.index > 0) {
      children.push({ _type: 'span', _key: `${keyBase}-s${i++}`, text: rest.slice(0, m.index), marks: [] });
    }
    if (m[1] !== undefined) {
      const linkKey = `${keyBase}-l${i}`;
      markDefs.push({ _type: 'link', _key: linkKey, href: m[2], newTab: true });
      children.push({ _type: 'span', _key: `${keyBase}-s${i++}`, text: m[1], marks: [linkKey] });
    } else {
      children.push({ _type: 'span', _key: `${keyBase}-s${i++}`, text: m[3], marks: ['strong'] });
    }
    rest = rest.slice(m.index + m[0].length);
  }
  if (children.length === 0) children.push({ _type: 'span', _key: `${keyBase}-s0`, text: '', marks: [] });
  return { children, markDefs };
}

function block(keyBase, style, text, extra = {}) {
  const { children, markDefs } = parseInline(text, keyBase);
  return { _type: 'block', _key: keyBase, style, markDefs, children, ...extra };
}

function mdToPt(md, prefix) {
  const blocks = [];
  let n = 0;
  const chunks = md.split(/\n\s*\n/);
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const key = () => `${prefix}${n++}`;

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/s);
    if (heading && !heading[2].includes('\n')) {
      // H1 der Seite überspringen (kommt aus dem Seitenkopf), Datumszeile eigener Absatz.
      if (heading[1].length === 1) continue;
      const style = `h${heading[1].length}`;
      blocks.push(block(key(), style, heading[2].trim()));
      continue;
    }
    if (/^\*Aktualisierungs-Datum/.test(trimmed)) continue; // steht im Seitenkopf
    if (trimmed.split('\n').every((l) => /^[-*]\s+/.test(l.trim()))) {
      for (const line of trimmed.split('\n')) {
        blocks.push(block(key(), 'normal', line.trim().replace(/^[-*]\s+/, ''), { listItem: 'bullet', level: 1 }));
      }
      continue;
    }
    blocks.push(block(key(), 'normal', trimmed));
  }
  return blocks;
}

for (const name of ['datenschutz', 'impressum']) {
  const md = await readFile(path.join(legalDir, `${name}.md`), 'utf8');
  const pt = mdToPt(md, name.slice(0, 2));
  const out =
    `/* AUTOGENERIERT von scripts/build-legal-pt.mjs aus shared/legal/${name}.md - nicht von Hand editieren. */\n` +
    `export default ${JSON.stringify(pt, null, 1)};\n`;
  await writeFile(path.join(legalDir, `${name}-pt.mjs`), out);
  console.log(`${name}: ${pt.length} Blöcke`);
}
