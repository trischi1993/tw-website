// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * CSP-Hausregel „script-src bleibt strikt", selbst-wartend erzwungen:
 *
 * Astro inlinet kleine hoisted `<script>`-Chunks direkt ins HTML
 * (plugin-scripts.js: keine Imports + < assetsInlineLimit). Eine strikte
 * `script-src 'self'` OHNE Hash/Nonce blockiert diese Inline-Scripts im Browser
 * → das Mobile-Menü liefe in Produktion nicht. `'unsafe-inline'` ist keine
 * Option (die `style="..."`-Token-Attribute brauchen es bei style-src, aber bei
 * script-src wäre es ein XSS-Loch).
 *
 * Dieser Hook berechnet nach dem Build die sha256-Hashes ALLER ausführbaren
 * Inline-Scripts in dist/ und trägt sie in die `script-src`-Direktive von
 * dist/_headers ein. Selbst-wartend: ändert sich ein Script (oder kommt eines
 * hinzu), passt sich der Hash beim nächsten Build an. `application/ld+json` ist
 * Datenblock, kein Script → ausgenommen.
 */
const injectCspScriptHashes = () => ({
  name: 'inject-csp-script-hashes',
  hooks: {
    /** @param {{ dir: URL, logger: any }} args */
    'astro:build:done': async ({ dir, logger }) => {
      const dist = fileURLToPath(dir);
      const headersFile = path.join(dist, '_headers');

      let headers;
      try {
        headers = await readFile(headersFile, 'utf8');
      } catch {
        logger.warn('dist/_headers fehlt - CSP-Script-Hashes nicht eingetragen.');
        return;
      }
      // NUR die echte Direktivzeile, nicht die Kommentare oben (die den String
      // ebenfalls enthalten).
      const cspLine = /^(\s*Content-Security-Policy:.*?)script-src 'self'/m;
      if (!cspLine.test(headers)) {
        logger.warn("_headers: keine \"script-src 'self'\"-Direktive gefunden - CSP-Hashes uebersprungen.");
        return;
      }

      /** @type {string[]} */
      const htmlFiles = [];
      const walk = async (/** @type {string} */ p) => {
        for (const e of await readdir(p, { withFileTypes: true })) {
          const full = path.join(e.parentPath ?? p, e.name);
          if (e.isDirectory()) await walk(full);
          else if (e.name.endsWith('.html')) htmlFiles.push(full);
        }
      };
      await walk(dist);

      // Ausfuehrbare Inline-Scripts: <script> ohne src, ohne type=module-fremdes
      // (ld+json ausgenommen). Hash ueber den exakten Textinhalt (das, was der
      // Browser fuer die CSP hasht).
      const inlineScript =
        /<script(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
      const hashes = new Set();
      for (const f of htmlFiles) {
        const html = await readFile(f, 'utf8');
        for (const m of html.matchAll(inlineScript)) {
          const code = m[1];
          if (code.trim() === '') continue;
          hashes.add(`'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`);
        }
      }

      if (hashes.size === 0) {
        logger.info('Keine Inline-Scripts gefunden - CSP unveraendert.');
        return;
      }

      const sorted = [...hashes].sort().join(' ');
      const patched = headers.replace(cspLine, `$1script-src 'self' ${sorted}`);
      await writeFile(headersFile, patched);
      logger.info(`CSP: ${hashes.size} Inline-Script-Hash(es) in dist/_headers eingetragen.`);
    },
  },
});

/**
 * Hausregel „kein React im Prod-Output", als Build-Schritt erzwungen:
 *
 * 1. PRUNE: Sobald @astrojs/react registriert ist, emittiert Astro den
 *    Hydrations-Entrypoint (_astro/client.<hash>.js, ~190 kB) auch dann, wenn
 *    keine einzige Seite ein client:-Directive nutzt (withastro/astro#13378).
 *    Der Hook löscht ihn - aber NUR, wenn kein anderes dist-File ihn
 *    referenziert (selbst-verifizierend).
 * 2. ASSERT (fail-closed): Danach wird jedes verbleibende JS in dist/ auf die
 *    React-Runtime-Signatur geprüft (`Symbol.for("react.…")`). Ein Treffer
 *    BRICHT den Build - egal ob durch einen umbenannten Entrypoint, einen
 *    referenzierten Chunk oder ein versehentliches client:-Directive. Wer
 *    bewusst eine Insel in Produktion hydrieren will, entfernt diese
 *    Integration und übernimmt die Hausregel-Ausnahme explizit.
 */
const assertNoReactInProdOutput = () => ({
  name: 'assert-no-react-in-prod-output',
  hooks: {
    /** @param {{ dir: URL, logger: any }} args */
    'astro:build:done': async ({ dir, logger }) => {
      const dist = fileURLToPath(dir);

      /** @type {string[]} */
      const files = [];
      const walk = async (/** @type {string} */ p) => {
        for (const e of await readdir(p, { withFileTypes: true })) {
          const full = path.join(e.parentPath ?? p, e.name);
          if (e.isDirectory()) await walk(full);
          else if (/\.(html|js|mjs|css)$/.test(e.name)) files.push(full);
        }
      };
      await walk(dist);

      // 1. Prune: unreferenzierte React-Client-Entrypoints entfernen.
      const clients = files.filter((f) => /^client\..+\.js$/.test(path.basename(f)));
      for (const client of clients) {
        const name = path.basename(client);
        let referenced = false;
        for (const other of files) {
          if (other === client) continue;
          if ((await readFile(other, 'utf8')).includes(name)) {
            referenced = true;
            break;
          }
        }
        if (!referenced) {
          await rm(client);
          await rm(`${client}.map`, { force: true });
          files.splice(files.indexOf(client), 1);
          logger.info(`Unreferenzierten React-Client-Chunk entfernt: ${name}`);
        }
      }

      // 2. Assert: keine React-Runtime im verbleibenden Output.
      for (const f of files) {
        if (!/\.(js|mjs)$/.test(f)) continue;
        if (/Symbol\.for\(["']react\./.test(await readFile(f, 'utf8'))) {
          throw new Error(
            `React-Runtime im Prod-Output gefunden: ${path.relative(dist, f)} - ` +
              'verletzt die Hausregel "kein React im Prod-Output" (README, docs/umbau-plan.md). ' +
              'Absichtliche Prod-Hydration? Dann diese Integration in astro.config.mjs entfernen.',
          );
        }
      }
      logger.info('Prod-Output verifiziert: kein React-Runtime-JS in dist/.');
    },
  },
});

/**
 * Sitemap ↔ noindex synchron halten: @astrojs/sitemap sieht im `filter` nur die
 * URL, nicht das `seo.noindex`-Flag einer Seite. Eine auf noindex gestellte Seite
 * bekäme sonst `<meta robots noindex>` UND bliebe in der Sitemap (widersprüchliche
 * Signale an Google). Dieser Hook (registriert NACH sitemap()) liest die gebauten
 * HTML-Seiten, sammelt die mit noindex-Meta und entfernt deren `<loc>` aus den
 * Sitemap-Dateien. Selbst-tragend: gilt für Seed- wie für Sanity-Seiten.
 */
const stripNoindexFromSitemap = () => ({
  name: 'strip-noindex-from-sitemap',
  hooks: {
    /** @param {{ dir: URL, logger: any }} args */
    'astro:build:done': async ({ dir, logger }) => {
      const dist = fileURLToPath(dir);

      /** @type {string[]} */
      const files = [];
      const walk = async (/** @type {string} */ p) => {
        for (const e of await readdir(p, { withFileTypes: true })) {
          const full = path.join(e.parentPath ?? p, e.name);
          if (e.isDirectory()) await walk(full);
          else files.push(full);
        }
      };
      await walk(dist);

      // noindex-Seiten über ihre canonical-URL einsammeln.
      const noindex = new Set();
      for (const f of files.filter((f) => f.endsWith('.html'))) {
        const html = await readFile(f, 'utf8');
        if (!/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
        const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
        if (canonical) noindex.add(canonical);
      }
      if (noindex.size === 0) return;

      let removed = 0;
      for (const f of files.filter((f) => /sitemap-\d+\.xml$/.test(f))) {
        const xml = await readFile(f, 'utf8');
        const cleaned = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
          const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
          if (loc && noindex.has(loc)) {
            removed++;
            return '';
          }
          return block;
        });
        if (cleaned !== xml) await writeFile(f, cleaned);
      }
      if (removed) logger.info(`Sitemap: ${removed} noindex-Seite(n) entfernt.`);
    },
  },
});

// https://astro.build/config
export default defineConfig({
  // REQUIRED: set to the real production domain. Placeholder for now.
  // Canonicals, sitemap and absolute OG URLs all derive from this.
  site: 'https://tristanweithaler.com',
  trailingSlash: 'always',
  output: 'static',
  // Interne Links bei Hover/Touch-Start vorab laden – schnellere Navigation
  // ohne Viewport-Over-Prefetch (lädt nur bei erkennbarer Absicht).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  // Zweisprachig ab Werk: Deutsch ist Default und ohne Prefix (/), Englisch
  // unter /en/. Sprachen zentral hier + in src/lib/i18n.ts (LOCALES) pflegen;
  // eine dritte Sprache ist nur ein weiterer Eintrag. Einsprachige Projekte:
  // siehe README „Auf eine Sprache reduzieren“.
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false, // /  (de)  ·  /en/  (en)
    },
  },
  integrations: [
    // Rendert die Section-Komponenten (.tsx) STATISCH zur Buildzeit. Solange
    // keine Seite ein client:-Directive nutzt, landet null React-JS im Output
    // (Hausregel: „kein React im Prod-Output"). Nur der Vorschau-Build
    // hydriert die Sections als Live-Island (astro.config.preview.mjs).
    react(),
    assertNoReactInProdOutput(),
    injectCspScriptHashes(),
    sitemap({
      // Korrekte xhtml:link hreflang-Annotationen – nur für Seiten, die
      // @astrojs/sitemap paaren kann (beide Sprachversionen müssen existieren).
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de', en: 'en' },
      },
      // Keep noindex / utility pages out of the sitemap. Add project-specific
      // noindex pages here so they stay in sync.
      filter: (page) => !page.includes('/404'),
    }),
    // Entfernt Seiten mit <meta robots noindex> aus der Sitemap (muss NACH
    // sitemap() laufen). Fängt CMS-getriebenes noindex, das der statische
    // filter oben nicht kennt.
    stripNoindexFromSitemap(),
  ],
  image: {
    // Allow Sanity-hosted images once the CMS is connected.
    domains: ['cdn.sanity.io'],
  },
});
