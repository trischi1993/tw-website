import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { getPreviewContext } from './preview-context';
import { SECTIONS_PROJECTION, baseIdOf, mapSections } from './content/sections';
import type { SiteSettings, HomeContent, SitePage, SiteImage } from './content/types';

/* ---------------------------------------------------------------------------
   Sanity adapter - DORMANT until env vars are set.

   The site runs entirely on local seed (src/lib/content/) today. The moment
   PUBLIC_SANITY_PROJECT_ID exists, src/lib/content/index.ts routes the getters
   here instead. Every mapper below returns the SAME component-facing type the
   seed returns, so pages and components never change.

   Field names here are the contract the Studio schema (studio/schemas) must
   match. Keep the two in sync.
   --------------------------------------------------------------------------- */

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2024-10-01';

export const sanity: SanityClient = createClient({
  projectId: projectId ?? 'undefined',
  dataset,
  apiVersion,
  useCdn: true, // published content only; safe for a static build
  perspective: 'published',
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: any) => builder.image(source);

/**
 * API-Version NUR für den Vorschau-Pfad. Das neue Sanity-Studio (Client 7.x)
 * schickt im Presentation-Tool zusammengesetzte Perspektiven (Drafts-Stack bzw.
 * Releases, z. B. "drafts,published" oder "<release>,drafts"). Die ältere
 * Version `2024-10-01` lehnt die mit 400 ab ("Complex perspectives are not
 * supported for this version") → der Worker antwortete mit 500. Ab `2025-02-19`
 * versteht die Content-Lake-API solche Perspektiven. Der veröffentlichte
 * Produktions-Client oben bleibt bewusst auf der konfigurierten Version.
 */
const PREVIEW_API_VERSION = '2025-02-19';

/**
 * Cookie-Perspektive → Client-Wert. Ein einzelner Wert bleibt der einfache
 * String ("drafts"); eine kommagetrennte Stack-Perspektive wird zum Array,
 * wie es der Client für zusammengesetzte Perspektiven erwartet.
 */
function toPerspective(value: string): string | string[] {
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : (parts[0] ?? 'drafts');
}

/**
 * Wählt den Client je Anfrage. In Produktion gibt es nie einen Vorschau-Kontext
 * (die Middleware setzt ihn nur im Vorschau-Build) → es bleibt beim
 * veröffentlichten CDN-Client oben, völlig unverändert. Nur in der Live-Vorschau
 * wird auf Entwürfe umgeschaltet (mit Token, ohne CDN; stega bleibt aus -
 * Click-to-edit läuft über data-sanity-Attribute, siehe SectionsIsland).
 */
function activeClient(): SanityClient {
  const ctx = getPreviewContext();
  if (!ctx) return sanity;
  return sanity.withConfig({
    useCdn: false,
    apiVersion: PREVIEW_API_VERSION,
    perspective: toPerspective(ctx.perspective) as any,
    ...(ctx.token ? { token: ctx.token } : {}),
    ...(ctx.stega ? { stega: { enabled: true, studioUrl: ctx.studioUrl } } : {}),
  });
}

/* --- Image resolution ----------------------------------------------------- */
interface RawImage {
  alt?: string;
  caption?: string;
  asset?: { url?: string; metadata?: { dimensions?: { width: number; height: number }; lqip?: string } };
}

const MAX_W = 2400;

export function resolveImage(source?: RawImage, fallbackAlt = ''): SiteImage | undefined {
  const dim = source?.asset?.metadata?.dimensions;
  const url = source?.asset?.url;
  if (!url || !dim) return undefined;
  const scale = dim.width > MAX_W ? MAX_W / dim.width : 1;
  const width = Math.round(dim.width * scale);
  const height = Math.round(dim.height * scale);
  return {
    kind: 'remote',
    src: `${url}?w=${width}&q=80&auto=format&fit=max`,
    width,
    height,
    alt: source?.alt ?? fallbackAlt,
    caption: source?.caption,
    lqip: source?.asset?.metadata?.lqip,
  };
}

/* --- Queries -------------------------------------------------------------- */
const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  siteName, tagline,
  contact, nav[]{label, href}, legalLinks[]{label, href}, social[]{label, href},
  footerNote
}`;

/* SEO-Projektion: das optionale Teilen-Bild wird dereferenziert (asset->),
   damit resolveImage url + Dimensionen bekommt (sonst bliebe seo.image ein
   nackter Reference und das Per-Seite-OG-Bild käme nie an). */
const SEO_PROJECTION = `seo{ title, description, noindex, image{ alt, caption, asset->{ url, metadata{ dimensions, lqip } } } }`;

/* Die Sections-Projektion + Mapper leben in ./content/sections.ts - browser-
   sicher, weil die Live-Vorschau-Island dieselben Funktionen clientseitig
   nutzt. _id wird für Click-to-edit gebraucht (documentId der Island). */
const HOME_QUERY = `*[_type == "homePage"][0]{ _id, ${SEO_PROJECTION}, ${SECTIONS_PROJECTION} }`;

const PAGES_QUERY = `*[_type == "page" && defined(slug.current)]{
  _id, title, "slug": slug.current, ${SEO_PROJECTION}, ${SECTIONS_PROJECTION}
}`;

/* --- Mappers -------------------------------------------------------------- */
function mapSeo(seo: any, fallbackImg?: SiteImage) {
  return {
    title: seo?.title ?? '',
    description: seo?.description ?? '',
    image: resolveImage(seo?.image) ?? fallbackImg,
    noindex: seo?.noindex ?? false,
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const d = await activeClient().fetch(SETTINGS_QUERY);
  return {
    siteName: d.siteName,
    tagline: d.tagline,
    contact: d.contact,
    nav: d.nav ?? [],
    legalLinks: d.legalLinks ?? [],
    social: d.social ?? [],
    footerNote: d.footerNote,
  };
}

export async function fetchHome(): Promise<HomeContent> {
  const d = await activeClient().fetch(HOME_QUERY);
  return {
    documentId: baseIdOf(d?._id),
    seo: mapSeo(d?.seo),
    sections: mapSections(d?.sections),
  };
}

export async function fetchAllPages(): Promise<SitePage[]> {
  const docs = await activeClient().fetch(PAGES_QUERY);
  return (docs ?? []).map((d: any) => ({
    documentId: baseIdOf(d._id),
    title: d.title,
    slug: d.slug,
    seo: mapSeo(d.seo),
    sections: mapSections(d.sections),
  }));
}
