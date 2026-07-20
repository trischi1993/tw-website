/**
 * Liest Laufzeit-Variablen (Token etc.) über alle Umgebungen hinweg:
 *  - Cloudflare Worker: `env` aus dem Modul "cloudflare:workers"
 *  - lokaler Node-Dev / Build: `process.env`
 *
 * Hintergrund: Astro 7 (seit v6) hat `Astro.locals.runtime.env` entfernt; der
 * Zugriff darauf wirft. Auf Cloudflare ist `cloudflare:workers` der offizielle
 * Weg an Vars + Secrets. Der dynamische Import mit variabler Spezifizierung +
 * `@vite-ignore` verhindert, dass Vite das Modul im Node-Build aufzulösen
 * versucht (dort existiert es nicht → Fallback auf process.env).
 *
 * Nur im Vorschau-Pfad aufgerufen; Produktion fasst das nie an.
 */
export async function getRuntimeEnv(): Promise<Record<string, string | undefined>> {
  try {
    const specifier = 'cloudflare:workers';
    const mod: any = await import(/* @vite-ignore */ specifier);
    if (mod?.env) return mod.env as Record<string, string | undefined>;
  } catch {
    // Nicht auf Cloudflare → Node/Build-Umgebung.
  }
  return process.env as Record<string, string | undefined>;
}
