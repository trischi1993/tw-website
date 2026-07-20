import type { SiteImage } from './types';
import placeholder from '../../assets/images/placeholder.svg';

/* ---------------------------------------------------------------------------
   Local image registry.

   The starter ships a SINGLE neutral placeholder (src/assets/images/placeholder.svg)
   so the site builds and renders with zero real photos. The seed refers to images
   through `img()`, which always returns this placeholder; drop real files into
   src/assets/images and extend this helper (or connect Sanity) to use them.

   When Sanity is connected, images arrive as remote URLs instead (see
   src/lib/sanity.ts). Components consume the unified `SiteImage` type either way.
   --------------------------------------------------------------------------- */

/** Build a local SiteImage for the seed. Returns the shared placeholder. */
export function img(_key: string, alt: string, caption?: string): SiteImage {
  return { kind: 'local', asset: placeholder, alt, caption };
}

/**
 * A page's OG-image URL from its `seo.image`, source-agnostic. Returns a string
 * (site-relative for local build assets, absolute for Sanity CDN); SEO.astro
 * turns it absolute via `Astro.site`. Undefined → the page falls back to the
 * default share image. Wire this from every page's frontmatter into BaseLayout.
 */
export function ogImageUrl(image?: SiteImage): string | undefined {
  if (!image) return undefined;
  return image.kind === 'local' ? image.asset.src : image.src;
}
