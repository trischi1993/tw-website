import type { ImageMetadata } from 'astro';
import type { SiteImage } from './types';

/* ---------------------------------------------------------------------------
   Lokale Bild-Registry für den Seed.

   Alle Dateien unter src/assets/images/** werden per import.meta.glob
   registriert; `img('services/xyz.avif', alt)` löst sie zu astro:assets-
   Metadaten auf (Optimierung im Build). Der Pfad ist derselbe, den
   shared/site-content.mjs an den img()-Callback übergibt - eine Quelle,
   zwei Konsumenten (hier lokal, in make-seed.mjs als Sanity-Upload).
   --------------------------------------------------------------------------- */

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../../assets/images/**/*.{avif,webp,png,jpg,jpeg,svg}',
  { eager: true },
);

const REGISTRY: Record<string, ImageMetadata> = {};
for (const [key, mod] of Object.entries(modules)) {
  REGISTRY[key.replace('../../assets/images/', '')] = mod.default;
}

/** Lokales SiteImage aus der Registry; unbekannter Pfad bricht den Build ab. */
export function img(path: string, alt: string, caption?: string): SiteImage {
  const asset = REGISTRY[path];
  if (!asset) throw new Error(`[images] Unbekanntes Bild im Seed: src/assets/images/${path}`);
  return { kind: 'local', asset, alt, caption };
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
