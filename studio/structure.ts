import type { StructureResolver } from 'sanity/structure';
// @sanity/icons v5: pro Icon ein Subpath-Export (kein Barrel mehr).
import { HomeIcon } from '@sanity/icons/Home';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { CogIcon } from '@sanity/icons/Cog';

/**
 * Die IDs der Singleton-Dokumente. Diese Dokumente existieren genau einmal und
 * werden über eine feste ID adressiert, damit sie nicht dupliziert oder neu
 * angelegt werden können.
 */
export const SINGLETONS = ['siteSettings', 'homePage'] as const;

/**
 * Aufbau der linken Navigation im Studio (zweisprachig, Dokument-Ebene):
 *
 *   Website
 *     ├─ Startseite        ├─ Deutsch   (homePage-de)
 *     │                    └─ English   (homePage-en)
 *     ├─ Weitere Seiten    (frei anlegbare Seiten, je Sprache ein Dokument)
 *     ─────────────
 *     └─ Einstellungen     ├─ Deutsch   (siteSettings-de)
 *                          └─ English   (siteSettings-en)
 *
 * Pro Sprache ein eigenes, fest adressiertes Dokument (feste IDs) – damit ist
 * der Inhalt deterministisch und der Seed-Import (studio/seed.ndjson)
 * reproduzierbar.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website')
    .items([
      S.listItem()
        .title('Startseite')
        .id('homePage')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Startseite')
            .items([
              S.listItem()
                .title('Deutsch')
                .id('homePage-de')
                .child(
                  S.document()
                    .schemaType('homePage')
                    .documentId('homePage-de')
                    .title('Startseite (DE)'),
                ),
              S.listItem()
                .title('English')
                .id('homePage-en')
                .child(
                  S.document()
                    .schemaType('homePage')
                    .documentId('homePage-en')
                    .title('Startseite (EN)'),
                ),
            ]),
        ),

      S.documentTypeListItem('page').title('Weitere Seiten').icon(DocumentsIcon),

      S.divider(),

      S.listItem()
        .title('Einstellungen')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Einstellungen')
            .items([
              S.listItem()
                .title('Deutsch')
                .id('siteSettings-de')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings-de')
                    .title('Einstellungen (DE)'),
                ),
              S.listItem()
                .title('English')
                .id('siteSettings-en')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings-en')
                    .title('Einstellungen (EN)'),
                ),
            ]),
        ),
    ]);
