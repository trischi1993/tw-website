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
 * Aufbau der linken Navigation im Studio (einsprachig):
 *
 *   Website
 *     ├─ Startseite        (homePage)
 *     ├─ Weitere Seiten    (frei anlegbare Seiten)
 *     ─────────────
 *     └─ Einstellungen     (siteSettings)
 *
 * Feste, deterministische IDs – damit ist der Inhalt deterministisch und der
 * Seed-Import (studio/seed.ndjson) reproduzierbar.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website')
    .items([
      S.listItem()
        .title('Startseite')
        .id('homePage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage').title('Startseite')),

      S.documentTypeListItem('page').title('Weitere Seiten').icon(DocumentsIcon),

      S.divider(),

      S.listItem()
        .title('Einstellungen')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Einstellungen'),
        ),
    ]);
