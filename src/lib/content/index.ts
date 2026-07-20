import type { SiteSettings, HomeContent, SitePage } from './types';
import type { Locale } from '../i18n';
import * as seed from './seed';

/* ---------------------------------------------------------------------------
   Data access: the single seam between the site and its content source.

   Every getter takes a locale and returns content for that language. Today they
   return the local seed (per language), so the whole site builds and runs
   offline. When a Sanity project is ready, set the env vars; the GROQ queries in
   src/lib/sanity.ts return these exact same shapes (filtered by language), so
   nothing in the pages or components changes.

   Getters are async on purpose: the Sanity versions await a fetch, and keeping
   the signatures identical now means the switch is a one-line change here.
   --------------------------------------------------------------------------- */

const CONTENT_SOURCE: 'seed' | 'sanity' =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'seed';

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchSiteSettings } = await import('../sanity');
    return fetchSiteSettings(locale);
  }
  return seed.siteSettings[locale];
}

export async function getHome(locale: Locale): Promise<HomeContent> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchHome } = await import('../sanity');
    return fetchHome(locale);
  }
  return seed.home[locale];
}

export async function getAllPages(locale: Locale): Promise<SitePage[]> {
  if (CONTENT_SOURCE === 'sanity') {
    const { fetchAllPages } = await import('../sanity');
    return fetchAllPages(locale);
  }
  return seed.pages.filter((p) => p.language === locale);
}

export async function getPageBySlug(slug: string, locale: Locale): Promise<SitePage | undefined> {
  const all = await getAllPages(locale);
  return all.find((p) => p.slug === slug);
}

export { CONTENT_SOURCE };
