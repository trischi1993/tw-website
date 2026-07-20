import { defineMiddleware } from 'astro:middleware';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { runWithPreview } from './lib/preview-context';
import { getRuntimeEnv } from './lib/runtime-env';
import { PREVIEW_SESSION_COOKIE, verifyPreviewSession } from './lib/preview-session';

/**
 * Setzt pro Anfrage den Vorschau-Kontext, falls eine GÜLTIGE Vorschau-Session
 * vorliegt. `SANITY_PREVIEW` wird AUSSCHLIESSLICH im Vorschau-Build gesetzt
 * (astro.config.preview.mjs → vite.define). In Produktion ist dieser Wert
 * `undefined`, der Branch unten also tot → reiner Durchlauf, keine Wirkung.
 */
const IS_PREVIEW = import.meta.env.SANITY_PREVIEW === true;

export const onRequest = defineMiddleware(async (context, next) => {
  if (!IS_PREVIEW) return next();

  const perspective = context.cookies.get(perspectiveCookieName)?.value;

  let response: Response;
  if (perspective) {
    // Secrets nur bei aktivem Draft-Mode holen (Worker: cloudflare:workers,
    // lokal: process.env).
    const env = await getRuntimeEnv();
    const token = env.SANITY_API_READ_TOKEN;
    // GATE: nur mit gültigem, HMAC-signiertem Session-Cookie. Der Perspektive-
    // Cookie allein (öffentlicher Name, ungesignt) reicht NICHT — sonst könnte
    // jeder durch bloßes Setzen des Cookies Entwürfe abrufen. Signierschlüssel
    // ist der Viewer-Token (reines Worker-Secret). Fehlt der Token oder ist die
    // Session ungültig/abgelaufen → veröffentlichter Stand (fail-closed).
    const session = context.cookies.get(PREVIEW_SESSION_COOKIE)?.value;
    const valid = token ? await verifyPreviewSession(token, session) : false;
    response = valid
      ? await runWithPreview(
          {
            perspective,
            token,
            studioUrl: env.SANITY_STUDIO_URL,
            // Click-to-Edit läuft über explizite data-sanity-Attribute in der
            // Live-Island (createDataAttribute), nicht über stega-Zeichen in den
            // Strings. stega bleibt aus; anschalten wäre nur der Fallback, falls
            // die Attribute in einem Projekt mal nicht reichen.
            stega: false,
          },
          () => next(),
        )
      : await next();
  } else {
    response = await next();
  }

  // Die Vorschau nie indexieren (der Worker liefert dasselbe robots.txt wie
  // Prod aus; ohne diesen Header wäre die Preview-URL crawl-/indexierbar).
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  // Die Vorschau darf ausschließlich vom Sanity-Studio (deployed oder lokal)
  // eingebettet werden – Clickjacking-Schutz für die Editor-Session.
  response.headers.set(
    'Content-Security-Policy',
    // Studio kann unter mehreren Hosts laufen: deployt (*.sanity.studio),
    // im Sanity-Dashboard (sanity.io / *.sanity.io) und lokal (localhost).
    "frame-ancestors 'self' https://*.sanity.studio https://sanity.io https://*.sanity.io http://localhost:3333",
  );
  return response;
});
