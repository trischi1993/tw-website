import type { SiteImage } from '../../lib/content/types';

/**
 * Bild-Renderer für SiteImage — quellen-agnostisch (lokales Build-Asset oder
 * Sanity-CDN) und browser-sicher (läuft auch in der Live-Island). Lokale
 * Assets sind bereits als AVIF/WebP optimiert; Sanity-URLs tragen ihre
 * Transformations-Parameter (?w=&q=&auto=format) aus dem Mapper.
 */
export default function Img({
  image,
  className,
  sizes,
  loading = 'lazy',
  fetchPriority,
  style,
}: {
  image?: SiteImage;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  style?: React.CSSProperties;
}) {
  if (!image) return null;
  const src = image.kind === 'local' ? image.asset.src : image.src;
  // srcset nur fuer Sanity-CDN-Bilder (lokale Assets sind einzelne Build-Dateien).
  const srcSet = image.kind === 'remote' ? image.srcSet : undefined;
  const width = image.kind === 'local' ? image.asset.width : image.width;
  const height = image.kind === 'local' ? image.asset.height : image.height;
  return (
    <img
      src={src}
      srcSet={srcSet}
      width={width || undefined}
      height={height || undefined}
      alt={image.alt}
      className={className}
      // sizes ist ohne srcset wirkungslos - nur dann setzen.
      sizes={srcSet ? sizes : undefined}
      loading={loading}
      decoding={loading === 'eager' ? 'sync' : 'async'}
      // Kleinschreibung erzwingt das HTML-Attribut unabhaengig von der React-Version.
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      style={style}
    />
  );
}
