import type { SectionHomeHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/** Alternative Startseiten-Variante: Der Bildrahmen bleibt als ruhiger Anker
 * stabil, während Bild, Titel und CTA mit getrennten Geschwindigkeiten aus dem
 * Viewport laufen. Eine leichte Abdunklung übergibt an den Ergebnistext. */
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
            <h1 className="hhero__h1" data-anim="lines" data-speed="0.9" data-delay="0.1">
              <span className="hhero__h1-small" {...edit?.(`${path}.headingSmall`)}>
                {headingSmall}
              </span>
              <br />
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
              <div className="hhero__parallax-layer" data-hero-parallax-layer="">
                <Img
                  image={image}
                  loading="eager"
                  fetchPriority="high"
                  quality={90}
                  sizes="110vw"
                />
              </div>
              <div className="hhero__wipe" data-hero-wipe="" aria-hidden="true" />
            </div>
          </div>

          <div className="hhero__tweak" data-parallax-tweak="">
            <div className="hhero__tweak-head">
              <span>Hero Motion</span>
              <small>Cinematic Hold</small>
            </div>
            <label className="hhero__tweak-row">
              <span>Bildweg <output data-parallax-image-output="">−40 px</output></span>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                defaultValue="40"
                data-parallax-image=""
              />
            </label>
            <label className="hhero__tweak-row">
              <span>Titelweg <output data-parallax-title-output="">−220 px</output></span>
              <input
                type="range"
                min="0"
                max="320"
                step="10"
                defaultValue="220"
                data-parallax-title=""
              />
            </label>
            <label className="hhero__tweak-row">
              <span>CTA-Weg <output data-parallax-secondary-output="">−160 px</output></span>
              <input
                type="range"
                min="0"
                max="240"
                step="10"
                defaultValue="160"
                data-parallax-secondary=""
              />
            </label>
            <label className="hhero__tweak-row">
              <span>Glättung <output data-parallax-scrub-output="">0,45 s</output></span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                defaultValue="0.45"
                data-parallax-scrub=""
              />
            </label>
            <label className="hhero__tweak-row">
              <span>Abdunklung <output data-parallax-dim-output="">20 %</output></span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                defaultValue="20"
                data-parallax-dim=""
              />
            </label>
          </div>
        </header>
        <div className="hhero__trigger" data-hero-trigger="" aria-hidden="true" />
      </div>
    </section>
  );
}
