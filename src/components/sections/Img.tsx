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
  style,
}: {
  image?: SiteImage;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}) {
  if (!image) return null;
  const src = image.kind === 'local' ? image.asset.src : image.src;
  const width = image.kind === 'local' ? image.asset.width : image.width;
  const height = image.kind === 'local' ? image.asset.height : image.height;
  return (
    <img
      src={src}
      width={width || undefined}
      height={height || undefined}
      alt={image.alt}
      className={className}
      sizes={sizes}
      loading={loading}
      decoding={loading === 'eager' ? 'sync' : 'async'}
      style={style}
    />
  );
}
