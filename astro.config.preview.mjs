// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// Die Werte auch aus der lokalen .env lesen: `vite.define` unten wird zur
// CONFIG-Zeit ausgewertet, da hat Astro die .env noch nicht geladen - ohne
// diesen Schritt liefe `npm run dev:preview` trotz gefüllter .env auf dem
// Seed (ohne Sanity, ohne Live-Island). Echte Umgebungsvariablen (Cloudflare-
// Build-Env) gewinnen weiterhin über die .env-Datei.
const fileEnv = loadEnv('', process.cwd(), '');
const publicEnv = (/** @type {string} */ key) => process.env[key] || fileEnv[key] || '';

// Die Vorschau-Secrets für den LOKALEN Node-Pfad nach process.env heben:
// Middleware + Draft-Mode-Endpunkte lesen zur Laufzeit process.env
// (getRuntimeEnv), aber Astro/Vite lädt .env nur nach import.meta.env - ohne
// diesen Schritt antwortet /api/draft-mode/enable lokal mit 500 („Token
// fehlt"). Nur Config-Zeit-Umgebung des Dev-/Build-Prozesses; im deployten
// Worker kommen die Secrets weiterhin ausschließlich aus `wrangler secret put`
// (cloudflare:workers env), nichts wird ins Bundle gebacken.
for (const key of ['SANITY_API_READ_TOKEN', 'SANITY_STUDIO_URL']) {
  if (!process.env[key] && fileEnv[key]) process.env[key] = fileEnv[key];
}

/**
 * VORSCHAU-KONFIGURATION (Live-Vorschau) – komplett getrennt von der Produktion.
 *
 * Produktion (astro.config.mjs) bleibt unangetastet: `output: 'static'`, kein
 * Adapter, Auslieferung als statische Dateien.
 *
 * Diese Config baut die Live-Vorschau als SSR. Zwei Modi:
 *  - `npm run dev:preview`   → Node-SSR ohne Adapter (lokal anschauen; läuft
 *                              auf jeder Node-22-Version, keine Workers-Runtime)
 *  - `npm run build:preview` → setzt PREVIEW_DEPLOY=1, lädt den Cloudflare-
 *                              Worker-Adapter (braucht Node ≥ 22.15 / 24)
 *
 * Vier Dinge unterscheiden sie von Produktion:
 *  1. SANITY_PREVIEW=true   → aktiviert Middleware + Draft-Mode (sonst toter Code)
 *  2. Alias #sections-host  → der Live-Island-Host statt des statischen Hosts:
 *     im Draft-Mode hydrieren die Sections als React-Island mit Studio-Live-
 *     Updates (src/preview/SectionsIsland.tsx)
 *  3. Alias #preview-extras → die seitenweite Visual-Editing-Brücke (Overlay,
 *     History-Meldung, Refresh) statt des leeren Platzhalters
 *  4. injectRoute           → die Draft-Mode-Endpunkte (existieren nur hier)
 */
// imageService 'passthrough': Der Cloudflare-Adapter nutzt sonst per Default die
// Cloudflare-Images-Binding (`IMAGES`) für `/_image`-Transforms – die haben wir
// im Worker nicht gebunden, also antwortete `/_image` mit 500 (Bilder + Logo
// luden nicht). Mit 'passthrough' werden die Bilder direkt ausgeliefert: die
// Sanity-CDN-URLs tragen ihre Transformationen (?w=&q=80&auto=format) bereits,
// das lokale Logo kommt aus /_astro. Keine Sharp-/Binding-Abhängigkeit zur
// Laufzeit. (Nur Vorschau; Produktion optimiert weiter zur Build-Zeit.)
const adapter = process.env.PREVIEW_DEPLOY
  ? (await import('@astrojs/cloudflare')).default({ imageService: 'passthrough' })
  : undefined;

export default defineConfig({
  site: 'https://tristanweithaler.com',
  // 'ignore' (statt 'always' wie in Produktion): die Vorschau wird nicht
  // indexiert, und so funktionieren sowohl die Studio-Aufrufe der Draft-Mode-
  // Endpunkte (ohne Slash) als auch die iframe-Navigation (mit/ohne Slash).
  trailingSlash: 'ignore',
  output: 'server',
  adapter,
  // Astro-Dev-Toolbar im Presentation-iframe abschalten: ihr Audit wirft
  // Fetch-Fehler in die Console und ihre Overlays kollidieren mit den
  // Sanity-Click-to-edit-Overlays. (Betrifft nur `npm run dev:preview`.)
  devToolbar: { enabled: false },
  // Einsprachige Website (Deutsch) - kein Astro-i18n-Routing. Kein Sitemap hier.
  image: {
    domains: ['cdn.sanity.io'],
  },
  integrations: [
    react(),
    {
      name: 'preview-routes',
      hooks: {
        'astro:config:setup': ({ injectRoute, logger }) => {
          logger.info('Draft-Mode-Routen werden injiziert');
          injectRoute({
            pattern: '/api/draft-mode/enable',
            entrypoint: new URL('./src/preview/draft-enable.ts', import.meta.url),
            prerender: false,
          });
          injectRoute({
            pattern: '/api/draft-mode/disable',
            entrypoint: new URL('./src/preview/draft-disable.ts', import.meta.url),
            prerender: false,
          });
        },
      },
    },
  ],
  vite: {
    define: {
      'import.meta.env.SANITY_PREVIEW': JSON.stringify(true),
      // Sanity-Anbindung für den Vorschau-Build (öffentliche Werte, kein
      // Geheimnis). PUBLIC_SANITY_PROJECT_ID muss per Build-Env-Var gesetzt
      // werden (Cloudflare-Dashboard oder process.env); ohne sie läuft auch die
      // Vorschau auf dem lokalen Seed.
      'import.meta.env.PUBLIC_SANITY_PROJECT_ID': JSON.stringify(
        publicEnv('PUBLIC_SANITY_PROJECT_ID'),
      ),
      'import.meta.env.PUBLIC_SANITY_DATASET': JSON.stringify(
        publicEnv('PUBLIC_SANITY_DATASET') || 'production',
      ),
      'import.meta.env.PUBLIC_SANITY_API_VERSION': JSON.stringify(
        publicEnv('PUBLIC_SANITY_API_VERSION') || '2024-10-01',
      ),
    },
    resolve: {
      alias: {
        '#sections-host': fileURLToPath(
          new URL('./src/preview/SectionsHost.astro', import.meta.url),
        ),
        '#preview-extras': fileURLToPath(
          new URL('./src/preview/PreviewExtras.astro', import.meta.url),
        ),
      },
    },
  },
});
