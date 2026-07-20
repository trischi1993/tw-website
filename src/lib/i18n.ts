/* ---------------------------------------------------------------------------
   Einsprachige Website (Deutsch). Reduziert aus dem zweisprachigen Starter
   (README „Auf eine Sprache reduzieren"): keine Locales, keine hreflang-
   Alternates, kein Sprachumschalter. Hier leben nur die Sprach-Konstanten und
   die statischen Oberflächentexte, die nicht aus dem Inhalt (Seed/Sanity)
   kommen.
   --------------------------------------------------------------------------- */

export const HTML_LANG = 'de';
export const OG_LOCALE = 'de_DE';

/** Pfad einer Unterseite aus ihrem Slug. */
export function pagePath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/` : '/';
}

export interface UIStrings {
  skipToContent: string;
  mainNav: string;
  menu: string;
  toStart: string;
  footerDiscover: string;
  footerLegal: string;
  footerContact: string;
  rightsReserved: string;
  notFoundMetaTitle: string;
  notFoundMetaDescription: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundCta: string;
}

export const UI: UIStrings = {
  skipToContent: 'Zum Inhalt springen',
  mainNav: 'Hauptnavigation',
  menu: 'Menü',
  toStart: 'zur Startseite',
  footerDiscover: 'Entdecken',
  footerLegal: 'Rechtliches',
  footerContact: 'Kontakt',
  rightsReserved: 'Alle Rechte vorbehalten.',
  notFoundMetaTitle: 'Seite nicht gefunden',
  notFoundMetaDescription: 'Diese Seite gibt es leider nicht.',
  notFoundTitle: 'Diese Seite gibt es nicht.',
  notFoundBody: 'Vielleicht wurde sie verschoben. Dieser Weg führt zurück zur Startseite.',
  notFoundCta: 'Zur Startseite',
};
