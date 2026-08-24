import type { SectionHomeHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/** Alternative Startseiten-Variante: Der Bildrahmen bleibt horizontal stabil.
 * GSAP bewegt ausschließlich den übergroßen Bildinhalt vertikal und erzeugt
 * damit einen echten, über das Tweak-Panel regelbaren Parallax-Effekt. */
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
              <span>Parallax-Intensität</span>
              <output data-parallax-output="">55 %</output>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue="55"
              data-parallax-input=""
              aria-label="Intensität des Parallax-Effekts"
            />
            <div className="hhero__tweak-scale" aria-hidden="true">
              <span>Ruhig</span>
              <span>Stark</span>
            </div>
          </div>
        </header>
        <div className="hhero__trigger" data-hero-trigger="" aria-hidden="true" />
      </div>
    </section>
  );
}
