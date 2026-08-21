import type { SiteSettings, HomeContent, SitePage, ServiceItem, EbookContent } from './types';
import * as seed from './seed';
import { ebook as ebookSeed } from './ebook-seed';

/* ---------------------------------------------------------------------------
   Data access: the single seam between the site and its content source.

   Today the getters return the local seed, so the whole site builds and runs
   offline. When a Sanity project is ready, set the env vars; the GROQ queries in
   src/lib/sanity.ts return these exact same shapes, so nothing in the pages or
   components changes.

   Getters are async on purpose: the Sanity versions await a fetch, and keeping
   the signatures identical now means the switch is a one-line change here.
   --------------------------------------------------------------------------- */

const CONTENT_SOURCE: 'seed' | 'sanity' =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'seed';

export async function getSiteSettings(): Promise<SiteSettings> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchSiteSettings } = await import('../sanity');
    return fetchSiteSettings();
  }
  return seed.siteSettings;
}

export async function getHome(): Promise<HomeContent> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchHome } = await import('../sanity');
    return fetchHome();
  }
  return seed.home;
}

export async function getAllPages(): Promise<SitePage[]> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchAllPages } = await import('../sanity');
    return fetchAllPages();
  }
  return seed.pages;
}

/** Alle Coachings (fürs Anfrage-Modal; Sections betten sie selbst ein). */
export async function getServices(): Promise<ServiceItem[]> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchServices } = await import('../sanity');
    return fetchServices();
  }
  return seed.services;
}

export async function getPageBySlug(slug: string): Promise<SitePage | undefined> {
  const all = await getAllPages();
  return all.find((p) => p.slug === slug);
}

/** Feste E-Book-Landingpage: Sanity-Singleton mit lokalem Voll-Fallback. */
export async function getEbook(): Promise<EbookContent> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchEbook } = await import('../sanity');
    return fetchEbook();
  }
  return ebookSeed;
}

export { CONTENT_SOURCE };
