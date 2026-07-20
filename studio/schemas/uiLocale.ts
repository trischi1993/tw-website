/**
 * Studio-UI-Sprache der Schema-Labels (Feld-Titel, Beschreibungen, Options).
 *
 * Default Englisch. Pro Kundenprojekt auf Deutsch schalten via
 *   SANITY_STUDIO_UI_LOCALE=de
 * in `studio/.env` (bzw. `.env.example` als dokumentierte Option). Sanity
 * injiziert `SANITY_STUDIO_*` zur Buildzeit statisch ins Bundle - also auch in
 * Schema-Dateien nutzbar (genau wie `SANITY_STUDIO_PROJECT_ID` in sanity.config).
 *
 * Bewusst KEIN Sanity-Studio-i18n (defineLocale/i18next): das ist für die
 * Studio-Chrome gedacht und für unsere paar Labels Overkill. Ein winziger
 * t()-Helper genügt und hält die Labels im Schema lesbar.
 */
export type UiLocale = 'en' | 'de';

export const UI_LOCALE: UiLocale =
  (process.env.SANITY_STUDIO_UI_LOCALE as UiLocale) === 'de' ? 'de' : 'en';

/** t({ en, de }) → wählt den String nach UI_LOCALE; Fallback immer Englisch. */
export function t(labels: { en: string; de?: string }): string {
  return UI_LOCALE === 'de' && labels.de ? labels.de : labels.en;
}

/** Wie t(), aber für Options-Listen: mappt [{en,de,value,...}] → [{title,value,...}]. */
export function tOptions<T extends { en: string; de?: string; value: string; description?: { en: string; de?: string } }>(
  opts: T[],
): { title: string; value: string; description?: string }[] {
  return opts.map((o) => ({
    title: t({ en: o.en, de: o.de }),
    value: o.value,
    ...(o.description ? { description: t(o.description) } : {}),
  }));
}
