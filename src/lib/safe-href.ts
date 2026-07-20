/**
 * Härtet einen aus dem CMS stammenden `href` gegen XSS über gefährliche Schemata
 * (`javascript:`, `data:`, `vbscript:` …). React und Astro entfernen solche URLs
 * beim Server-Render NICHT — ohne diese Prüfung landet ein von einem Redakteur
 * gespeichertes `javascript:…` als klickbarer Link im statischen Prod-HTML.
 *
 * Erlaubt: relative Pfade/Anker/Query (`/…`, `#…`, `?…`), schemalose relative
 * Referenzen und die Schemata http/https/mailto/tel. Alles andere → '#'.
 *
 * Erste Verteidigungslinie ist die Schema-Validierung im Studio (Scheme-
 * Allowlist auf den href-Feldern); dies ist die zweite, im Renderer, damit auch
 * Alt-Daten und Seed-Inhalte sicher bleiben.
 */
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

// Whitespace-/Steuerzeichen, die der Browser beim Auflösen einer URL entfernt —
// vor der Schema-Prüfung strippen, sonst umgeht z. B. `java&#9;script:` die Liste.
const IGNORED_CHARS = /[\t\n\r\f\v]/g;

export function safeHref(href?: string | null): string {
  const value = (href ?? '').trim();
  if (!value) return '#';
  // Relative Referenz (Pfad / Anker / Query) — immer unbedenklich.
  if (/^[/#?]/.test(value)) return value;
  const scheme = value
    .replace(IGNORED_CHARS, '')
    .match(/^([a-z][a-z0-9+.-]*):/i)?.[1]
    ?.toLowerCase();
  if (!scheme) return value; // schemalose relative Referenz (z. B. "kontakt/")
  return SAFE_SCHEMES.has(scheme) ? value : '#';
}
