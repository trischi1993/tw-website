/* ---------------------------------------------------------------------------
   i18n – zentrale Wahrheit für die Zweisprachigkeit (DE + EN).

   Deutsch ist die Default-Sprache und liegt ohne Prefix unter „/", Englisch
   unter „/en/" (siehe astro.config.mjs → i18n).

   Diese Datei definiert die Sprachen, die lokalisierten Pfade, die statischen
   Oberflächentexte (UI) und – am wichtigsten – woher hreflang-Alternates und
   der Sprachumschalter ihre URLs nehmen. Regel: Es wird IMMER nur auf
   Übersetzungen verwiesen, die wirklich existieren. Niemals eine lokalisierte
   URL „erraten".
   --------------------------------------------------------------------------- */

export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Kürzel im Sprachumschalter (DE | EN). */
export const LOCALE_LABELS: Record<Locale, string> = { de: 'DE', en: 'EN' };

/** Ausgeschriebener Name (für aria-label und Vollständigkeit). */
export const LOCALE_NAMES: Record<Locale, string> = { de: 'Deutsch', en: 'English' };

/** Open-Graph-Locale (og:locale). */
export const OG_LOCALE: Record<Locale, string> = { de: 'de_DE', en: 'en_US' };

/** Wert für das <html lang>-Attribut. */
export const HTML_LANG: Record<Locale, string> = { de: 'de', en: 'en' };

/**
 * Lokalisierter Pfad für eine Seite. Ohne Slug → Startseite der Sprache.
 *   localizedPath('de')        → '/'
 *   localizedPath('en')        → '/en/'
 *   localizedPath('de', 'abc') → '/abc/'
 *   localizedPath('en', 'abc') → '/en/abc/'
 */
export function localizedPath(locale: Locale, slug = ''): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  if (!clean) return `${prefix}/`;
  return `${prefix}/${clean}/`;
}

/** Pfad der Startseite je Sprache. */
export const homePath = (locale: Locale): string => localizedPath(locale);

/**
 * Alternates der Startseite: beide Sprachversionen existieren immer, also
 * werden beide ausgegeben.
 */
export function homeAlternates(): { lang: Locale; path: string }[] {
  return LOCALES.map((lang) => ({ lang, path: homePath(lang) }));
}

/**
 * Alternates einer freien Seite: sie selbst + ihre ECHTEN Sprachversionen
 * (aus der translation.metadata des Plugins). Je Sprache ein Eintrag, in
 * LOCALES-Reihenfolge (de zuerst → x-default). Lebt hier statt in
 * [...slug].astro, weil getStaticPaths isoliert gehoisted wird und nur
 * Imports sieht - und die Vorschau-SSR denselben Code braucht.
 */
export function pageAlternates(
  page: { slug: string; translations?: { language: Locale; slug: string }[] },
  locale: Locale,
): { lang: Locale; path: string }[] {
  const byLang = new Map<Locale, string>();
  byLang.set(locale, page.slug);
  for (const t of page.translations ?? []) {
    if ((LOCALES as readonly string[]).includes(t.language)) byLang.set(t.language, t.slug);
  }
  return LOCALES.filter((l) => byLang.has(l)).map((l) => ({
    lang: l,
    path: localizedPath(l, byLang.get(l)!),
  }));
}

/* ---------------------------------------------------------------------------
   Statische Oberflächentexte. Nur das, was nicht aus dem Inhalt (Seed/Sanity)
   kommt: Navigations-Labels, Footer-Titel, 404-Seite usw.
   --------------------------------------------------------------------------- */
export interface UIStrings {
  skipToContent: string;
  mainNav: string;
  menu: string;
  languageNav: string;
  toStart: string;
  footerDiscover: string;
  footerLegal: string;
  footerContact: string;
  rightsReserved: string;
  notFoundMetaTitle: string;
  notFoundMetaDescription: string;
  notFoundEyebrow: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundCta: string;
}

export const UI: Record<Locale, UIStrings> = {
  de: {
    skipToContent: 'Zum Inhalt springen',
    mainNav: 'Hauptnavigation',
    menu: 'Menü',
    languageNav: 'Sprache wählen',
    toStart: 'zur Startseite',
    footerDiscover: 'Entdecken',
    footerLegal: 'Rechtliches',
    footerContact: 'Kontakt',
    rightsReserved: 'Alle Rechte vorbehalten.',
    notFoundMetaTitle: 'Seite nicht gefunden',
    notFoundMetaDescription: 'Diese Seite gibt es leider nicht.',
    notFoundEyebrow: 'Fehler 404',
    notFoundTitle: 'Diese Seite gibt es nicht.',
    notFoundBody: 'Vielleicht wurde sie verschoben. Dieser Weg führt zurück zur Startseite.',
    notFoundCta: 'Zur Startseite',
  },
  en: {
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    menu: 'Menu',
    languageNav: 'Choose language',
    toStart: 'to the home page',
    footerDiscover: 'Explore',
    footerLegal: 'Legal',
    footerContact: 'Contact',
    rightsReserved: 'All rights reserved.',
    notFoundMetaTitle: 'Page not found',
    notFoundMetaDescription: 'Sorry, this page does not exist.',
    notFoundEyebrow: 'Error 404',
    notFoundTitle: 'This page does not exist.',
    notFoundBody: 'It may have moved. This link takes you back to the home page.',
    notFoundCta: 'Back to home',
  },
};

/** Oberflächentexte für eine Sprache (Default-Sprache als Fallback). */
export const ui = (locale: Locale): UIStrings => UI[locale] ?? UI[DEFAULT_LOCALE];
