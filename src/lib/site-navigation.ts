import { safeHref } from './safe-href';

/**
 * Zentrale Absicherung der im CMS gepflegten Navigationslinks. Die offizielle
 * E-Book-Adresse bleibt bewusst auf ebook.tristanweithaler.com; sie darf nicht
 * mehr auf einen doppelten Pfad der Hauptdomain umgebogen werden.
 */
export function siteNavigationHref(href?: string | null): string {
  return safeHref(href);
}
