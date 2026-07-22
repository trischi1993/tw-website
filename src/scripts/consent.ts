/* ---------------------------------------------------------------------------
   Cookie-Consent-Zustand (opt-in, DSGVO): EINE Quelle für Banner/Prefs-Modal
   (CookieConsent.astro) und consent-gated Einbettungen (Vimeo, widgets.ts).

   Der aktuelle optionale Dienst ist Vimeo (interne Kategorie `marketing`);
   notwendige Speicherung umfasst nur die Einwilligungsauswahl selbst.
   Persistenz in localStorage; jede Änderung feuert das Event `tw:consent`
   mit `detail = { categories }`, damit Gates sofort reagieren können.
   --------------------------------------------------------------------------- */

export type ConsentCategory = 'necessary' | 'marketing' | 'personalization' | 'analytics';

/** Kategorie, hinter der externe Medien-Embeds (Vimeo) liegen. */
export const VIMEO_CATEGORY: ConsentCategory = 'marketing';

export type ConsentState = Record<ConsentCategory, boolean>;

const STORAGE_KEY = 'tw-consent-v1';
const EVENT_NAME = 'tw:consent';

const DEFAULTS: ConsentState = {
  necessary: true,
  marketing: false,
  personalization: false,
  analytics: false,
};

/** Gespeicherte Entscheidung oder null (noch keine getroffen → Banner zeigen). */
export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return { ...DEFAULTS, ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return getConsent()?.[category] === true;
}

/** Entscheidung speichern + Event feuern (Banner/Toggles rufen das auf). */
export function setConsent(state: Partial<ConsentState>): void {
  const next: ConsentState = { ...DEFAULTS, ...(getConsent() ?? {}), ...state, necessary: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Storage voll/blockiert: Zustand gilt trotzdem für diese Seite. */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { categories: next } }));
}

export function acceptAll(): void {
  // Aktuell ist Vimeo das einzige optionale Element. Nicht verwendete
  // Kategorien bleiben aus, statt eine unnoetig breite Einwilligung abzulegen.
  setConsent({ marketing: true, personalization: false, analytics: false });
}

export function rejectAll(): void {
  setConsent({ marketing: false, personalization: false, analytics: false });
}

/** Einzelne Kategorie erlauben (z. B. „Video abspielen" im Vimeo-Poster). */
export function grantCategory(category: ConsentCategory): void {
  setConsent({ [category]: true } as Partial<ConsentState>);
}

/** Auf Änderungen reagieren; gibt eine Unsubscribe-Funktion zurück. */
export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<{ categories: ConsentState }>).detail.categories);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
