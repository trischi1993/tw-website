import { safeHref } from './safe-href';

const LEGACY_EBOOK_LANDING = /^https:\/\/ebook\.tristanweithaler\.com\/?$/i;

/**
 * Leitet nur den bisherigen externen E-Book-Einstieg auf die neue interne
 * Landingpage um. Tiefere Systeme.io-Pfade wie das Bestellformular bleiben
 * unverändert extern erreichbar.
 */
export function siteNavigationHref(href?: string | null): string {
  const safe = safeHref(href);
  return LEGACY_EBOOK_LANDING.test(safe) ? '/e-book/' : safe;
}
