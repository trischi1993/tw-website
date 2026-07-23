import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { getPreviewContext } from './preview-context';
import { SECTIONS_PROJECTION, baseIdOf, mapSections } from './content/sections';
import { imgFromOriginalFilename } from './content/images';
import type { SiteSettings, HomeContent, SitePage, SiteImage, ServiceItem } from './content/types';

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
  // Static deploys must see the just-published revision that triggered them.
  // The CDN can still serve the previous document briefly, so query the API
  // directly during builds. Public visitors never execute these GROQ queries.
  useCdn: false,
  perspective: 'published',
});

const builder = createImageUrlBuilder(sanity);
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
 * veröffentlichten Build-Client oben. Nur in der Live-Vorschau
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
  asset?: {
    url?: string;
    originalFilename?: string;
    metadata?: { dimensions?: { width: number; height: number }; lqip?: string };
  };
}

const MAX_W = 2400;

/* Responsive-Breiten-Leiter fuer Sanity-CDN-Bilder: deckt Handy (1x-3x DPR)
   bis Desktop-Retina ab. Auf die tatsaechliche (gekappte) Bildbreite geklemmt -
   nie ueber die Quelle hochskalieren. Ohne srcset zieht der Browser sonst immer
   die oberste w-Stufe (auf Mobile der LCP-Killer). */
const WIDTH_LADDER = [320, 480, 640, 828, 1080, 1280, 1600, 2000, 2400];

function buildSrcSet(url: string, maxWidth: number): string {
  const widths = WIDTH_LADDER.filter((w) => w < maxWidth);
  widths.push(maxWidth); // tatsaechliche Obergrenze immer als oberste Stufe
  return widths.map((w) => `${url}?w=${w}&q=80&auto=format&fit=max ${w}w`).join(', ');
}

export function resolveImage(source?: RawImage, fallbackAlt = ''): SiteImage | undefined {
  const alt = source?.alt ?? fallbackAlt;
  const local = imgFromOriginalFilename(source?.asset?.originalFilename, alt, source?.caption);
  if (local) return local;
  const dim = source?.asset?.metadata?.dimensions;
  const url = source?.asset?.url;
  if (!url || !dim) return undefined;
  const scale = dim.width > MAX_W ? MAX_W / dim.width : 1;
  const width = Math.round(dim.width * scale);
  const height = Math.round(dim.height * scale);
  return {
    kind: 'remote',
    src: `${url}?w=${width}&q=80&auto=format&fit=max`,
    srcSet: buildSrcSet(url, width),
    width,
    height,
    alt,
    caption: source?.caption,
    lqip: source?.asset?.metadata?.lqip,
  };
}

/* --- Queries -------------------------------------------------------------- */
const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  siteName, tagline,
  contact, nav[]{label, href}, headerCta{label, href},
  legalLinks[]{label, href}, social[]{label, href},
  footerNote
}`;

/* SEO-Projektion: das optionale Teilen-Bild wird dereferenziert (asset->),
   damit resolveImage url + Dimensionen bekommt (sonst bliebe seo.image ein
   nackter Reference und das Per-Seite-OG-Bild käme nie an). */
const SEO_PROJECTION = `seo{ title, description, noindex, image{ alt, caption, asset->{ url, originalFilename, metadata{ dimensions, lqip } } } }`;

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
    headerCta: d.headerCta ?? undefined,
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

/* Standalone-Liste fürs Anfrage-Modal (die Sections betten ihre Services über
   die Subquery in SECTIONS_PROJECTION selbst ein). */
const SERVICES_QUERY = `*[_type == "service"] | order(coalesce(order, 9999) asc, _id asc){
  "id": _id, name, formName, category, description,
  image{ alt, caption, asset->{ url, originalFilename, metadata{ dimensions, lqip } } }
}`;

export async function fetchServices(): Promise<ServiceItem[]> {
  const docs = await activeClient().fetch(SERVICES_QUERY);
  return (docs ?? []).map((d: any): ServiceItem => ({
    id: String(d.id),
    name: d.name ?? '',
    formName: d.formName ?? d.name ?? '',
    category: d.category === 'business' ? 'business' : 'personal',
    description: d.description ?? '',
    image: resolveImage(d.image, d.name ?? ''),
  }));
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
