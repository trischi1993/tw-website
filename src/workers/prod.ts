const SYSTEME_API_BASE = 'https://api.systeme.io/api';
const DEFAULT_TAG_NAME = 'Freebies - Download';
const MAX_BODY_BYTES = 4_096;

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
  SYSTEME_API_KEY?: string;
  SYSTEME_TAG_NAME?: string;
}

interface SystemeTag {
  id: number;
  name: string;
}

interface SystemeContactField {
  slug: string;
  value?: string | null;
}

interface SystemeContact {
  id: number;
  email: string;
  fields?: SystemeContactField[];
  tags?: SystemeTag[];
}

interface SystemeCollection<T> {
  items?: T[];
}

interface LeadPayload {
  name?: unknown;
  email?: unknown;
  consent?: unknown;
  website?: unknown;
}

class LeadServiceError extends Error {
  readonly code: string;
  readonly upstreamStatus?: number;

  constructor(code: string, upstreamStatus?: number) {
    super(code);
    this.code = code;
    this.upstreamStatus = upstreamStatus;
  }
}

let cachedTag: SystemeTag | undefined;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function normaliseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function contactFirstNameField(name: string) {
  return [{ slug: 'first_name', value: normaliseWhitespace(name) }];
}

async function systemeRequest(env: Env, path: string, init: RequestInit = {}) {
  const apiKey = env.SYSTEME_API_KEY?.trim();
  if (!apiKey) throw new LeadServiceError('missing_api_key');

  const response = await fetch(`${SYSTEME_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'X-API-Key': apiKey,
      ...init.headers,
    },
  });

  if (response.status === 429) {
    throw new LeadServiceError('systeme_rate_limited', response.status);
  }
  return response;
}

async function readCollection<T>(response: Response, code: string) {
  if (!response.ok) throw new LeadServiceError(code, response.status);
  const data = (await response.json()) as SystemeCollection<T>;
  return Array.isArray(data.items) ? data.items : [];
}

async function findContact(env: Env, email: string) {
  const response = await systemeRequest(
    env,
    `/contacts?email=${encodeURIComponent(email)}&limit=10`,
  );
  const contacts = await readCollection<SystemeContact>(response, 'contact_lookup_failed');
  return contacts.find((contact) => contact.email.toLowerCase() === email.toLowerCase());
}

async function createContact(env: Env, name: string, email: string) {
  const response = await systemeRequest(env, '/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      locale: 'de',
      fields: contactFirstNameField(name),
    }),
  });

  if (response.ok) return (await response.json()) as SystemeContact;

  // Zwei fast gleichzeitige Anmeldungen können beide beim vorherigen Lookup
  // noch leer sein. Wenn Systeme.io den zweiten POST ablehnt, den inzwischen
  // angelegten Kontakt erneut holen, statt einen sichtbaren Fehler auszugeben.
  if (response.status === 422) {
    const existing = await findContact(env, email);
    if (existing) return existing;
  }

  throw new LeadServiceError('contact_create_failed', response.status);
}

async function fillMissingContactFirstName(env: Env, contact: SystemeContact, name: string) {
  const missingFields = contactFirstNameField(name).filter((newField) => {
    const existingField = contact.fields?.find((field) => field.slug === newField.slug);
    return !existingField?.value?.trim();
  });
  if (missingFields.length === 0) return;

  const response = await systemeRequest(env, `/contacts/${contact.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({ fields: missingFields }),
  });
  if (!response.ok) throw new LeadServiceError('contact_update_failed', response.status);
}

async function resolveTag(env: Env) {
  const tagName = env.SYSTEME_TAG_NAME?.trim() || DEFAULT_TAG_NAME;
  if (cachedTag?.name === tagName) return cachedTag;

  const response = await systemeRequest(
    env,
    `/tags?query=${encodeURIComponent(tagName)}&limit=100`,
  );
  const tags = await readCollection<SystemeTag>(response, 'tag_lookup_failed');
  const exactMatches = tags.filter((tag) => tag.name === tagName);
  if (exactMatches.length !== 1) throw new LeadServiceError('tag_not_unique');

  cachedTag = exactMatches[0];
  return cachedTag;
}

async function assignTag(env: Env, contact: SystemeContact, tag: SystemeTag) {
  if (contact.tags?.some((assignedTag) => assignedTag.id === tag.id)) return;

  const response = await systemeRequest(env, `/contacts/${contact.id}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId: tag.id }),
  });
  if (response.ok) return;

  // Auch die Tag-Zuweisung ist idempotent: Bei parallelen Requests prüfen,
  // ob der andere Request den Tag inzwischen bereits gesetzt hat.
  const refreshed = await findContact(env, contact.email);
  if (refreshed?.tags?.some((assignedTag) => assignedTag.id === tag.id)) return;
  throw new LeadServiceError('tag_assign_failed', response.status);
}

async function parseLeadRequest(request: Request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    throw new LeadServiceError('invalid_content_type');
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    throw new LeadServiceError('body_too_large');
  }

  let payload: LeadPayload;
  try {
    payload = JSON.parse(rawBody) as LeadPayload;
  } catch {
    throw new LeadServiceError('invalid_json');
  }

  // Unsichtbares Bot-Feld: Bots erhalten absichtlich eine neutrale
  // Erfolgsantwort, erzeugen aber keinen Kontakt und verbrauchen keine API-Calls.
  if (typeof payload.website === 'string' && payload.website.trim()) return null;

  const name = typeof payload.name === 'string' ? normaliseWhitespace(payload.name) : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || name.length > 100 || !validEmail || email.length > 254) {
    throw new LeadServiceError('invalid_lead');
  }
  if (payload.consent !== true) throw new LeadServiceError('consent_required');

  return { name, email };
}

async function handleLeadRequest(request: Request, env: Env) {
  const requestUrl = new URL(request.url);
  if (request.headers.get('Origin') !== requestUrl.origin) {
    return json({ ok: false }, 403);
  }

  try {
    const lead = await parseLeadRequest(request);
    if (!lead) return json({ ok: true });

    const existingContact = await findContact(env, lead.email);
    const contact = existingContact ?? (await createContact(env, lead.name, lead.email));
    if (existingContact) await fillMissingContactFirstName(env, contact, lead.name);

    const tag = await resolveTag(env);
    await assignTag(env, contact, tag);
    return json({ ok: true });
  } catch (error) {
    const knownError = error instanceof LeadServiceError ? error : undefined;
    const clientError = new Set([
      'invalid_content_type',
      'invalid_json',
      'invalid_lead',
      'consent_required',
      'body_too_large',
    ]).has(knownError?.code ?? '');
    if (!clientError) {
      console.error('Erfolgs-Check lead transfer failed', {
        code: knownError?.code ?? 'unexpected_error',
        upstreamStatus: knownError?.upstreamStatus,
      });
    }
    return json({ ok: false }, clientError ? 400 : 503);
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/erfolgs-check-lead') {
      if (request.method !== 'POST') {
        return new Response(null, { status: 405, headers: { Allow: 'POST' } });
      }
      return handleLeadRequest(request, env);
    }

    if (url.pathname.startsWith('/api/')) return json({ ok: false }, 404);
    return env.ASSETS.fetch(request);
  },
};
