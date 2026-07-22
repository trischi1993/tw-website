import type { SectionHomeHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/**
 * Startseiten-Hero, 1:1 nach Webflow-Export (.section_home-hero):
 * - H1 mit Zeilen-Reveal (Line-Script: data-anim="lines", speed 1, delay 1).
 * - Buttons (.button-group) + Scroll-Indikator + Wipe-Fläche werden von der
 *   Load-Choreografie animiert (motion/home-load.ts, IX2 a-105).
 * - Desktop: 300vh-Strecke, Sticky-Content; die Bildspalte (40 % Breite)
 *   wächst über den unsichtbaren Trigger auf 100 % (motion/home-hero.ts,
 *   IX2 a-108); Scroll-Indikator-Loop (a-109).
 * Layout-Mechanik: sections.css (.hhero), ohne JS statisch voll sichtbar.
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
      data-home-hero=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="hhero__track">
        <header className="hhero__sticky">
          <div className="hhero__content">
            <h1 className="hhero__h1" data-anim="lines" data-speed="1" data-delay="1">
              <span className="hhero__h1-small" {...edit?.(`${path}.headingSmall`)}>
                {headingSmall}
              </span>
              <span {...edit?.(`${path}.headingLarge`)}>{headingLarge}</span>
            </h1>
            <div className="hhero__buttons button-group">
              <GlowButton label={ctaLabel} action="modal" />
            </div>
            <div className="hhero__scroll" data-hero-scroll="" aria-hidden="true">
              <span className="hhero__scroll-line" data-hero-scroll-line="" />
            </div>
          </div>
          <div className="hhero__media" data-hero-media="">
            <div className="hhero__media-frame">
              <Img
                image={image}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 991px) 100vw, 60vw"
              />
              <div className="hhero__wipe" data-hero-wipe="" aria-hidden="true" />
            </div>
          </div>
        </header>
        <div className="hhero__trigger" data-hero-trigger="" aria-hidden="true" />
      </div>
    </section>
  );
}
