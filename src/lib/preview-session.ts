/**
 * Signiertes Vorschau-Session-Cookie — schließt die Draft-Disclosure.
 *
 * Problem: Der Perspektive-Cookie (`sanity-preview-perspective`) trägt einen
 * öffentlich bekannten Namen und einen ungesignten Wert. Würde die Middleware
 * allein auf seine ANWESENHEIT gaten, könnte jeder mit
 *   curl -H 'Cookie: sanity-preview-perspective=drafts' <preview-worker>
 * serverseitig gerenderte Entwürfe (mit dem Server-Token) abrufen.
 *
 * Lösung: `draft-enable.ts` stellt NACH erfolgreicher Secret-Prüfung zusätzlich
 * dieses HMAC-signierte Session-Cookie aus. Die Middleware betritt den Draft-
 * Modus nur, wenn die Signatur gültig UND nicht abgelaufen ist. Fälschen setzt
 * den Signierschlüssel voraus (= der Viewer-Token, ein reines Worker-Secret,
 * das nie im Client oder im Prod-Build landet).
 *
 * Signiert wird nur die Ablaufzeit (nicht die Perspektive), damit ein
 * Perspektive-Wechsel im Studio die Session nicht invalidiert; welche
 * Perspektive gerendert wird, steuert weiterhin der Perspektive-Cookie —
 * OHNE gültige Session gibt es aber gar keinen Draft-Zugriff.
 *
 * Web Crypto (`crypto.subtle`) ist global in Cloudflare Workers und Node ≥ 22.
 */
export const PREVIEW_SESSION_COOKIE = 'sanity-preview-session';

// Gleiche Lebensdauer wie der preview-url-secret-Handshake.
const TTL_MS = 60 * 60 * 1000;

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return base64url(new Uint8Array(sig));
}

/** Ablaufzeit signieren → Cookie-Wert `"<exp>.<sig>"`. */
export async function signPreviewSession(key: string): Promise<string> {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${await hmac(key, String(exp))}`;
}

/** Cookie-Wert prüfen: Signatur gültig UND nicht abgelaufen. */
export async function verifyPreviewSession(key: string, cookie?: string): Promise<boolean> {
  if (!key || !cookie) return false;
  const dot = cookie.lastIndexOf('.');
  if (dot < 1) return false;
  const exp = Number(cookie.slice(0, dot));
  const sig = cookie.slice(dot + 1);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return timingSafeEqual(sig, await hmac(key, String(exp)));
}

/** Längen-unabhängiger Vergleich (kein früher Abbruch → kein Timing-Leak). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
