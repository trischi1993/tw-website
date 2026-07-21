import type { SectionGalleryMarquee } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { contentShell } from './shell';
import { safeHref } from '../../lib/safe-href';

/**
 * Horizontale Bild-Galerie („Bekannt aus" / ALL-IN-ONE-Säulen): 180% breite
 * Reihe, auf Desktop scroll-getrieben verschoben (motion.ts, [data-gallery]),
 * ab ≤991px nativer Horizontal-Scroll. titlesVisible steuert die Overlay-Titel.
 */
export default function GalleryMarqueeSection({
  section,
  edit,
}: {
  section: SectionGalleryMarquee;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, items, titlesVisible, ctaLabel, ctaHref } = section;
  const path = `sections[_key=="${_key}"]`;
  const shell = contentShell(section, { top: 'large', bottom: 'large' });

  return (
    <section
      id={anchor || undefined}
      className={`gallery ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container container--md gallery__head">
        <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
          {heading}
        </h2>
      </div>
      <div className="gallery__row-wrapper">
        <div className="gallery__row" data-gallery="">
          {items.map((item) => (
            <div className="gallery__item" key={item._key}>
              <Img image={item.image} sizes="(max-width: 767px) 70vw, 30vw" />
              {item.title &&
                (titlesVisible ? (
                  <h3 className="gallery__item-title">{item.title}</h3>
                ) : (
                  <h3 className="visually-hidden">{item.title}</h3>
                ))}
            </div>
          ))}
        </div>
      </div>
      {ctaLabel && ctaHref && (
        <div className="gallery__footer">
          <a className="link-underline" href={safeHref(ctaHref)}>
            {ctaLabel}
            <span className="link-underline__line" aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
