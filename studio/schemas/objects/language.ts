import { defineField } from 'sanity';

/**
 * Zweisprachigkeit auf DOKUMENT-EBENE: pro Sprache ein eigenes Dokument.
 * Die Sprachen sind die zentrale Wahrheit – sie müssen mit src/lib/i18n.ts
 * (LOCALES) auf der Astro-Seite übereinstimmen.
 */
export const LANGUAGES = [
  { id: 'de', title: 'Deutsch' },
  { id: 'en', title: 'English' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

/** Kurzlabel einer Sprache für Vorschau-Untertitel (z. B. „DE", „EN"). */
export function languageLabel(id?: string): string {
  return (id || '').toUpperCase();
}

/**
 * Sprach-Feld für übersetzte Dokumente. Frisch je Aufruf (kein geteiltes
 * Objekt zwischen Schemas).
 *
 * `hidden: true` → verstecktes, schreibgeschütztes Feld. So erwartet es das
 * Plugin @sanity/document-internationalization (das schreibt den Wert selbst),
 * und so bleiben die Singletons sauber: Der Kunde sieht kein verwirrendes
 * Sprach-Radio, der Wert kommt aus dem Seed bzw. vom Plugin.
 */
export const languageField = (opts: { hidden?: boolean } = {}) =>
  defineField(
    opts.hidden
      ? {
          name: 'language',
          title: 'Sprache',
          type: 'string',
          readOnly: true,
          hidden: true,
        }
      : {
          name: 'language',
          title: 'Sprache',
          description:
            'Die Sprache dieses Dokuments. Pro Sprache gibt es ein eigenes Dokument.',
          type: 'string',
          options: {
            list: LANGUAGES.map((l) => ({ title: l.title, value: l.id })),
            layout: 'radio',
          },
          validation: (R) => R.required(),
        },
  );
