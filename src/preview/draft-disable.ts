import type { APIRoute } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { PREVIEW_SESSION_COOKIE } from '../lib/preview-session';

/**
 * Draft-Mode AUS. Löscht Perspektive- UND Session-Cookie, danach rendert die
 * Vorschau wieder veröffentlichte Inhalte. Nur im Vorschau-Build vorhanden.
 */
export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect }) => {
  // Attribute muessen dem Set aus draft-enable.ts entsprechen (v. a.
  // `partitioned`): Chrome loescht ein CHIPS-Cookie nur, wenn der Loesch-
  // Set-Cookie dieselben Partitionierungs-Attribute traegt.
  const opts = { path: '/', sameSite: 'none', secure: true, partitioned: true } as const;
  cookies.delete(perspectiveCookieName, opts);
  cookies.delete(PREVIEW_SESSION_COOKIE, opts);
  return redirect('/', 307);
};
