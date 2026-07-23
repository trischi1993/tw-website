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
const BASENAME_REGISTRY: Record<string, ImageMetadata> = {};
for (const [key, mod] of Object.entries(modules)) {
  const relativePath = key.replace('../../assets/images/', '');
  const basename = relativePath.split('/').pop();
  REGISTRY[relativePath] = mod.default;
  if (!basename) continue;
  if (BASENAME_REGISTRY[basename]) {
    throw new Error(`[images] Doppelter Bild-Dateiname in src/assets/images/**: ${basename}`);
  }
  BASENAME_REGISTRY[basename] = mod.default;
}

/** Lokales SiteImage aus der Registry; unbekannter Pfad bricht den Build ab. */
export function img(path: string, alt: string, caption?: string): SiteImage {
  const asset = REGISTRY[path];
  if (!asset) throw new Error(`[images] Unbekanntes Bild im Seed: src/assets/images/${path}`);
  return { kind: 'local', asset, alt, caption };
}

/**
 * Löst ein aus Sanity stammendes Bild auf die gleichnamige Repo-Datei auf.
 * Alle migrierten Bilddateien haben eindeutige Basenames. Ein später neu in
 * Sanity hochgeladenes Bild ohne lokale Entsprechung fällt im Sanity-Mapper
 * weiterhin auf das Sanity-CDN zurück.
 */
export function imgFromOriginalFilename(
  originalFilename: string | undefined,
  alt: string,
  caption?: string,
): SiteImage | undefined {
  if (!originalFilename) return undefined;
  const basename = originalFilename.split(/[/\\]/).pop();
  if (!basename) return undefined;
  const asset = BASENAME_REGISTRY[basename];
  return asset ? { kind: 'local', asset, alt, caption } : undefined;
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
