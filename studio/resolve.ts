import { defineDocuments, defineLocations } from 'sanity/presentation';

/**
 * Auflösung für das Presentation-Tool (Live-Vorschau), zweisprachig.
 *
 *  - mainDocuments: Welche Vorschau-URL öffnet welches Dokument? Pro Sprache
 *    ein eigenes Dokument (language == "de" | "en").
 *  - locations: Umgekehrt, wo auf der Webseite erscheint dieses Dokument?
 *
 * Reihenfolge zählt: Die Startseiten und der /en-Zweig stehen VOR der
 * allgemeinen „/:slug"-Regel, damit „/en" nicht versehentlich als deutsche
 * Seite mit Slug „en" aufgelöst wird. Routen mit und ohne abschließenden Slash
 * sind aufgeführt, weil die Vorschau mit `trailingSlash: 'ignore'` läuft.
 */
export const resolve = {
  mainDocuments: defineDocuments([
    // Startseiten
    { route: '/', filter: `_type == "homePage" && language == "de"` },
    { route: '/en', filter: `_type == "homePage" && language == "en"` },
    { route: '/en/', filter: `_type == "homePage" && language == "en"` },
    // Englische Unterseiten (vor der deutschen Catch-all-Regel)
    { route: '/en/:slug', filter: `_type == "page" && language == "en" && slug.current == $slug` },
    { route: '/en/:slug/', filter: `_type == "page" && language == "en" && slug.current == $slug` },
    // Deutsche Unterseiten
    { route: '/:slug', filter: `_type == "page" && language == "de" && slug.current == $slug` },
    { route: '/:slug/', filter: `_type == "page" && language == "de" && slug.current == $slug` },
  ]),

  locations: {
    homePage: defineLocations({
      message: 'Diese Inhalte erscheinen auf der Startseite (je Sprache).',
      tone: 'positive',
      select: { language: 'language' },
      resolve: (doc) => ({
        locations: [
          doc?.language === 'en'
            ? { title: 'Startseite (EN)', href: '/en/' }
            : { title: 'Startseite (DE)', href: '/' },
        ],
      }),
    }),
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current', language: 'language' },
      resolve: (doc) => {
        const href = doc?.language === 'en' ? `/en/${doc?.slug}/` : `/${doc?.slug}/`;
        return { locations: [{ title: doc?.title || 'Seite', href }] };
      },
    }),
    siteSettings: defineLocations({
      message: 'Diese Einstellungen erscheinen auf allen Seiten der jeweiligen Sprache.',
      tone: 'caution',
      select: { language: 'language' },
      resolve: (doc) => ({
        locations: [
          doc?.language === 'en'
            ? { title: 'Startseite (EN)', href: '/en/' }
            : { title: 'Startseite (DE)', href: '/' },
        ],
      }),
    }),
  },
};
