import type { APIRoute } from 'astro';

/**
 * robots.txt als Endpoint (statt statischer Datei), damit die `Sitemap:`-Zeile
 * aus `Astro.site` (astro.config.mjs) abgeleitet wird — EINE Quelle für die
 * Produktionsdomain, kein zweiter, von Hand synchron zu haltender Ort. Beim
 * Launch nur `site` in astro.config.mjs setzen; diese Datei zieht automatisch nach.
 *
 * Wird statisch zur Build-Zeit erzeugt (prerender). Der Vorschau-Worker (SSR)
 * liefert sie ebenfalls aus; dort verhindert `X-Robots-Tag: noindex`
 * (src/middleware.ts) trotzdem die Indexierung.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : '/sitemap-index.xml';
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
