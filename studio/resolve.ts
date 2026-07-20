import { defineDocuments, defineLocations } from 'sanity/presentation';

/**
 * Auflösung für das Presentation-Tool (Live-Vorschau), einsprachig.
 *
 *  - mainDocuments: Welche Vorschau-URL öffnet welches Dokument?
 *  - locations: Umgekehrt, wo auf der Webseite erscheint dieses Dokument?
 *
 * Routen mit und ohne abschließenden Slash sind aufgeführt, weil die Vorschau
 * mit `trailingSlash: 'ignore'` läuft.
 */
export const resolve = {
  mainDocuments: defineDocuments([
    { route: '/', filter: `_type == "homePage"` },
    { route: '/:slug', filter: `_type == "page" && slug.current == $slug` },
    { route: '/:slug/', filter: `_type == "page" && slug.current == $slug` },
  ]),

  locations: {
    homePage: defineLocations({
      message: 'Diese Inhalte erscheinen auf der Startseite.',
      tone: 'positive',
      resolve: () => ({
        locations: [{ title: 'Startseite', href: '/' }],
      }),
    }),
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'Seite', href: `/${doc?.slug}/` }],
      }),
    }),
    siteSettings: defineLocations({
      message: 'Diese Einstellungen erscheinen auf allen Seiten.',
      tone: 'caution',
      resolve: () => ({
        locations: [{ title: 'Startseite', href: '/' }],
      }),
    }),
  },
};
