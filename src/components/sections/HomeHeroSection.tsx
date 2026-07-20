import type { SectionHomeHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/**
 * Startseiten-Hero: zweizeilige H1 (Zeilen-Reveal), Glow-CTA (öffnet das
 * Anfrage-Modal), Titelbild rechts mit Scroll-Wipe-Reveal über eine
 * 300vh-Strecke (Sticky-Content). Layout-Mechanik: sections.css (.hhero),
 * Scroll-Animation: src/scripts/motion.ts ([data-hero-scroll]).
 */
export default function HomeHeroSection({
  section,
  edit,
}: {
  section: SectionHomeHero;
  edit?: EditAttr;
}) {
  const { _key, anchor, headingSmall, headingLarge, ctaLabel, image } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="hhero"
      data-hero-scroll=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="hhero__track">
        <header className="hhero__sticky">
          <div className="hhero__content">
            <h1 className="hhero__h1" data-anim="lines" data-delay="1">
              <span className="hhero__h1-small" {...edit?.(`${path}.headingSmall`)}>
                {headingSmall}
              </span>
              <span {...edit?.(`${path}.headingLarge`)}>{headingLarge}</span>
            </h1>
            <div className="hhero__buttons button-group" data-anim="reveal-x" data-delay="1.2">
              <GlowButton label={ctaLabel} action="modal" />
            </div>
            <div className="hhero__scroll" data-anim="fade" data-delay="1.4" aria-hidden="true">
              <span className="hhero__scroll-line" data-hero-scroll-line="" />
            </div>
          </div>
          <div className="hhero__media">
            <div className="hhero__media-frame">
              <Img image={image} loading="eager" sizes="(max-width: 991px) 100vw, 40vw" />
            </div>
            <div className="hhero__wipe" data-hero-wipe="" aria-hidden="true" />
          </div>
        </header>
      </div>
    </section>
  );
}
