import type { SectionGalleryMarquee } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { contentShell } from './shell';
import { safeHref } from '../../lib/safe-href';

/**
 * Horizontale Bild-Galerie („Bekannt aus" / ALL-IN-ONE-Säulen): 180% breite
 * Reihe, auf Desktop maus-gesteuertes Parallax (IX2 a-43/a-161,
 * motion/gallery.ts), ab ≤991px nativer Horizontal-Scroll.
 *
 * titlesVisible steuert die Overlay-Titel („Bekannt aus"): nur diese Variante
 * hat den Karten-Hover (a-45/a-46). Die Säulen-Variante (AIO) hat wie im
 * Original KEINEN Hover, und ihr erstes Item bleibt vom Parallax-Heben
 * ausgenommen (Original: erstes .intro-aio_item ohne is-1-Klasse).
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
  /* Die AIO-Variante hat im Original einen eigenen, asymmetrischen
     Section-Abstand (6rem/1rem statt padding-section-large). Explizite
     Editor-Tokens bleiben inline und haben weiterhin Vorrang. */
  const shell = contentShell(
    section,
    titlesVisible ? { top: 'large', bottom: 'large' } : {},
  );

  /* IX2-Hebe-Muster: ungerade Items +40px, gerade -40px (@5 % der Maus-X). */
  const shiftFor = (i: number) => {
    if (!titlesVisible && i === 0) return 0;
    return i % 2 ? 40 : -40;
  };

  return (
    <section
      id={anchor || undefined}
      className={`gallery${titlesVisible ? '' : ' is-aio'} ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container container--md gallery__head">
        <div className="gallery__head-mask">
          <h2 data-anim="reveal" {...edit?.(`${path}.heading`)}>
            {heading}
          </h2>
        </div>
      </div>
      <div
        className="gallery__row-wrapper"
        data-marquee-parallax=""
      >
        <div className="gallery__row" data-marquee-track="">
          {items.map((item, i) => (
            <div
              className="gallery__item"
              data-marquee-item=""
              data-shift={shiftFor(i)}
              key={item._key}
            >
              <Img image={item.image} sizes="(max-width: 767px) 70vw, 30vw" />
              {item.title &&
                (titlesVisible ? (
                  <div className="gallery__item-text">
                    <div className="gallery__item-mask">
                      <h3 className="gallery__item-title" data-marquee-title="">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <h3 className="visually-hidden">{item.title}</h3>
                ))}
            </div>
          ))}
        </div>
      </div>
      {ctaLabel && ctaHref && (
        <div className="gallery__footer">
          <a className="link-underline" href={safeHref(ctaHref)} data-underline="main">
            <span className="link-underline__label gallery__footer-label">
              {ctaLabel}
              {titlesVisible && (
                <span className="gallery__footer-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </span>
            <span className="link-underline__line" aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
