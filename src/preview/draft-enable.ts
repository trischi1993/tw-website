import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { sanity } from '../lib/sanity';
import { getRuntimeEnv } from '../lib/runtime-env';
import { PREVIEW_SESSION_COOKIE, signPreviewSession } from '../lib/preview-session';

/**
 * Draft-Mode AN. Wird vom Studio-Presentation-Tool aufgerufen.
 *
 * Der Aufruf trägt ein Einmal-Secret in der URL; `validatePreviewUrl` prüft
 * gegen das im Dataset hinterlegte Secret, dass der Aufruf wirklich aus einer
 * echten Studio-Session stammt. Erst dann wird der Perspektive-Cookie gesetzt,
 * sodass alle folgenden Anfragen Entwürfe (Drafts) statt veröffentlichter
 * Inhalte rendern.
 *
 * Diese Route existiert NUR im Vorschau-Build (per injectRoute), niemals in
 * Produktion.
 */
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  // Token holen (Worker: cloudflare:workers, lokal: process.env).
  const env = await getRuntimeEnv();
  const token = env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response('SANITY_API_READ_TOKEN fehlt in der Vorschau-Umgebung.', {
      status: 500,
    });
  }

  const { isValid, redirectTo = '/', studioPreviewPerspective } = await validatePreviewUrl(
    sanity.withConfig({ token }),
    request.url,
  );

  if (!isValid) {
    return new Response('Ungültiges Vorschau-Secret.', { status: 401 });
  }

  const cookieOpts = {
    sameSite: 'none',
    secure: true,
    path: '/',
    // CHIPS: partitionierter Cookie, damit Chromes Drittanbieter-Cookie-Sperre
    // den Studio-iframe-Handshake auf der Deploy-Umgebung nicht blockiert.
    partitioned: true,
    maxAge: 60 * 60,
  } as const;

  cookies.set(perspectiveCookieName, studioPreviewPerspective || 'drafts', {
    ...cookieOpts,
    httpOnly: false,
  });
  // Signierte Session: das eigentliche Gate der Middleware. Nur ausstellbar,
  // NACHDEM das preview-url-secret geprüft wurde. httpOnly (trägt den Sicher-
  // heitswert, kein Client-JS liest ihn). Signiert mit dem Viewer-Token.
  cookies.set(PREVIEW_SESSION_COOKIE, await signPreviewSession(token), {
    ...cookieOpts,
    httpOnly: true,
  });

  return redirect(redirectTo, 307);
};
