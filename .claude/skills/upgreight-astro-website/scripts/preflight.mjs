#!/usr/bin/env node
// preflight.mjs - launch safety checks for a built Astro site.
//
// Scans the rendered HTML in dist/ (the real output, regardless of how it was
// built - static, Sanity, or i18n) and reports the mechanical SEO / a11y / link
// problems that quietly hurt a client launch. Zero dependencies: just Node.
//
// Usage:
//   node preflight.mjs ./dist --site https://clientdomain.com
//   node preflight.mjs ./dist            (site origin inferred from <link canonical>)
//
// Exit code 1 if any ERRORs were found (wire it into CI / pre-deploy). Warnings
// don't fail the run but should be triaged.
//
// It is regex-based, not a full HTML parser - accurate for the regular markup
// Astro emits, but if a check looks wrong on hand-edited HTML, trust your eyes.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, extname } from 'node:path';

// ---------- args ----------
const args = process.argv.slice(2);
const distDir = args.find((a) => !a.startsWith('--')) || './dist';
const siteArg = (() => {
  const i = args.indexOf('--site');
  return i !== -1 ? args[i + 1] : null;
})();

if (!existsSync(distDir)) {
  console.error(`✖ dist directory not found: ${distDir}\n  Run \`npm run build\` first.`);
  process.exit(2);
}

let siteOrigin = null;
if (siteArg) {
  try { siteOrigin = new URL(siteArg).origin; } catch { /* ignore */ }
}

// ---------- collect issues ----------
const issues = []; // { file, level: 'error'|'warn', check, msg }
const add = (file, level, check, msg) => issues.push({ file, level, check, msg });

// ---------- walk dist ----------
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
const allFiles = walk(distDir);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

// ---------- path helpers ----------
// Normalize a URL path to a canonical key: leading slash, no trailing slash
// (except root), no index.html / .html suffix.
function normalizePath(p) {
  let s = p.split('#')[0].split('?')[0];
  if (!s.startsWith('/')) s = '/' + s;
  if (s.endsWith('/index.html')) s = s.slice(0, -'index.html'.length);
  else if (s.endsWith('.html')) s = s.slice(0, -'.html'.length);
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  try { s = decodeURI(s); } catch { /* keep raw */ }
  return s || '/';
}
// file path -> its public URL path key
function fileToPath(file) {
  const rel = '/' + relative(distDir, file).split(sep).join('/');
  return normalizePath(rel);
}

// Set of every page that exists in the build
const pageSet = new Set(htmlFiles.map(fileToPath));

// Does an internal target resolve to a real page or asset on disk?
function targetExists(pathKey, rawPath) {
  if (pageSet.has(pathKey)) return true;
  const candidates = [
    join(distDir, rawPath),
    join(distDir, rawPath, 'index.html'),
    join(distDir, rawPath + '.html'),
  ];
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
}

// ---------- tiny HTML helpers ----------
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3] ?? '') : null;
};
const tagsOf = (html, tag) => html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
const metas = (html) => tagsOf(html, 'meta');
const metaContent = (html, key) => {
  for (const m of metas(html)) {
    const n = (attr(m, 'name') || attr(m, 'property') || '').toLowerCase();
    if (n === key.toLowerCase()) return attr(m, 'content') ?? '';
  }
  return null;
};

// ---------- per-page checks ----------
const slugRe = /^[a-z0-9-]+$/;
const noindexPages = new Set();
let pagesScanned = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pagePath = fileToPath(file);
  const label = pagePath;
  pagesScanned++;

  // infer site origin from the first canonical if not supplied
  if (!siteOrigin) {
    const c = tagsOf(html, 'link').map((t) => ({ rel: attr(t, 'rel'), href: attr(t, 'href') }))
      .find((l) => (l.rel || '').toLowerCase() === 'canonical' && /^https?:\/\//.test(l.href || ''));
    if (c) { try { siteOrigin = new URL(c.href).origin; } catch { /* ignore */ } }
  }

  // <title>
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? titleM[1].trim() : null;
  if (!title) add(label, 'error', 'title', 'missing or empty <title>');

  // meta description
  const desc = metaContent(html, 'description');
  if (desc === null || desc.trim() === '') add(label, 'error', 'description', 'missing or empty meta description');
  else if (desc.length > 165) add(label, 'warn', 'description', `meta description is ${desc.length} chars (>165 may be truncated)`);

  // html lang
  const langM = html.match(/<html[^>]*\blang\s*=\s*("([^"]*)"|'([^']*)')/i);
  const lang = langM ? (langM[2] ?? langM[3] ?? '').trim() : null;
  if (!lang) add(label, 'error', 'lang', 'missing <html lang="…">');

  // canonical
  const links = tagsOf(html, 'link').map((t) => ({
    rel: (attr(t, 'rel') || '').toLowerCase(),
    href: attr(t, 'href'),
    hreflang: attr(t, 'hreflang'),
  }));
  const canonical = links.find((l) => l.rel === 'canonical');
  if (!canonical || !canonical.href) {
    add(label, 'error', 'canonical', 'missing <link rel="canonical">');
  } else if (!/^https?:\/\//.test(canonical.href)) {
    add(label, 'error', 'canonical', `canonical is not an absolute URL: ${canonical.href}`);
  } else {
    try {
      const cu = new URL(canonical.href);
      const cPath = normalizePath(cu.pathname);
      if (siteOrigin && cu.origin !== siteOrigin) {
        add(label, 'warn', 'canonical', `canonical host ${cu.origin} differs from site ${siteOrigin}`);
      }
      if (cPath !== pagePath) {
        if (!pageSet.has(cPath)) add(label, 'error', 'canonical', `canonical points to a page that does not exist in the build: ${cPath}`);
        else add(label, 'warn', 'canonical', `canonical is not self-referencing (points to ${cPath}) - intentional?`);
      }
    } catch { add(label, 'error', 'canonical', `canonical is not a valid URL: ${canonical.href}`); }
  }

  // robots / noindex
  const robots = (metaContent(html, 'robots') || '').toLowerCase();
  if (robots.includes('noindex')) noindexPages.add(pagePath);

  // Open Graph (warnings - best practice, may be skipped on utility pages)
  for (const key of ['og:title', 'og:description', 'og:image', 'og:url']) {
    if (metaContent(html, key) === null) add(label, 'warn', 'open-graph', `missing ${key}`);
  }

  // headings
  const heads = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1count = heads.filter((h) => h === 1).length;
  if (h1count === 0) add(label, 'error', 'headings', 'no <h1> on the page');
  else if (h1count > 1) add(label, 'warn', 'headings', `${h1count} <h1> elements (expected 1)`);
  for (let i = 1; i < heads.length; i++) {
    if (heads[i] - heads[i - 1] > 1) {
      add(label, 'warn', 'headings', `heading level jumps from h${heads[i - 1]} to h${heads[i]} (skipped a level)`);
      break;
    }
  }

  // images without alt attribute
  const imgs = tagsOf(html, 'img');
  const missingAlt = imgs.filter((t) => attr(t, 'alt') === null).length;
  if (missingAlt > 0) add(label, 'error', 'alt', `${missingAlt} <img> without an alt attribute (use alt="" only for decorative)`);

  // internal links
  const hrefs = (html.match(/<a\b[^>]*href\s*=\s*("[^"]*"|'[^']*')[^>]*>/gi) || [])
    .map((a) => attr(a, 'href')).filter(Boolean);
  for (const href of hrefs) {
    if (/^(mailto:|tel:|javascript:|data:|#)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      if (siteOrigin && href.startsWith(siteOrigin)) {
        const u = new URL(href);
        const key = normalizePath(u.pathname);
        if (!targetExists(key, u.pathname)) add(label, 'error', 'links', `broken internal link → ${href}`);
      }
      continue; // external
    }
    // root-relative or relative
    let u;
    try { u = new URL(href, 'http://local' + (pagePath === '/' ? '/' : pagePath + '/')); }
    catch { continue; }
    const key = normalizePath(u.pathname);
    if (!targetExists(key, u.pathname)) add(label, 'error', 'links', `broken internal link → ${href} (resolves to ${key})`);
  }

  // hreflang alternates must point at pages that exist
  const alts = links.filter((l) => l.rel === 'alternate' && l.hreflang && l.href);
  let hasXDefault = false;
  for (const a of alts) {
    if ((a.hreflang || '').toLowerCase() === 'x-default') hasXDefault = true;
    if (siteOrigin && a.href.startsWith(siteOrigin)) {
      try {
        const key = normalizePath(new URL(a.href).pathname);
        if (!pageSet.has(key)) add(label, 'error', 'hreflang', `hreflang "${a.hreflang}" → page that does not exist in the build: ${key}`);
      } catch { /* ignore */ }
    }
  }
  if (alts.length > 0 && !hasXDefault) add(label, 'warn', 'hreflang', 'has hreflang alternates but no x-default');

  // slug cleanliness (each path segment)
  for (const seg of pagePath.split('/').filter(Boolean)) {
    if (!slugRe.test(seg)) { add(label, 'warn', 'slug', `non-clean URL segment "${seg}" (use lowercase, digits, hyphens)`); break; }
  }
}

// ---------- sitemap checks ----------
const sitemapFiles = allFiles.filter((f) => /sitemap.*\.xml$/i.test(f));
if (sitemapFiles.length === 0) {
  add('(sitemap)', 'warn', 'sitemap', 'no sitemap*.xml found in dist - add @astrojs/sitemap');
} else {
  const locs = new Set();
  for (const sm of sitemapFiles) {
    const xml = readFileSync(sm, 'utf8');
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      if (/sitemap.*\.xml$/i.test(m[1])) continue; // index entry pointing at sub-sitemap
      locs.add(m[1]);
    }
  }
  for (const loc of locs) {
    let key;
    try { key = normalizePath(new URL(loc).pathname); } catch { key = normalizePath(loc); }
    if (!pageSet.has(key)) add('(sitemap)', 'error', 'sitemap', `sitemap lists a URL with no built page: ${loc}`);
    if (noindexPages.has(key)) add('(sitemap)', 'error', 'sitemap', `noindex/draft page is in the sitemap: ${loc}`);
  }
}

// ---------- report ----------
const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

const byFile = new Map();
for (const i of issues) {
  if (!byFile.has(i.file)) byFile.set(i.file, []);
  byFile.get(i.file).push(i);
}

const C = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m', reset: '\x1b[0m' };
console.log(`\n${C.bold}Preflight${C.reset} - ${pagesScanned} pages, site: ${siteOrigin || '(not set)'}\n`);

if (issues.length === 0) {
  console.log(`${C.green}✓ No issues found.${C.reset}\n`);
} else {
  for (const [file, list] of [...byFile.entries()].sort()) {
    console.log(`${C.bold}${file}${C.reset}`);
    for (const i of list.sort((a, b) => a.level.localeCompare(b.level))) {
      const tag = i.level === 'error' ? `${C.red}ERROR${C.reset}` : `${C.yellow}warn ${C.reset}`;
      console.log(`  ${tag} ${C.dim}[${i.check}]${C.reset} ${i.msg}`);
    }
    console.log('');
  }
}

console.log(`${C.bold}Summary:${C.reset} ${errors.length ? C.red : C.green}${errors.length} error(s)${C.reset}, ${warns.length ? C.yellow : C.green}${warns.length} warning(s)${C.reset}`);
if (!siteOrigin) console.log(`${C.dim}Tip: pass --site https://clientdomain.com for full canonical/link/hreflang checks.${C.reset}`);
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
