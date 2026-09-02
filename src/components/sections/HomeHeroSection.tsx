import type { SectionHomeHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

const MOBILE_HERO_WIDTHS = [320, 480, 640, 828, 1080, 1280, 1600];

/**
 * Auf Mobile ist die Bildebene 2:3 hochkant, während das Masterbild quer liegt.
 * object-fit würde deshalb mehr als die Hälfte der geladenen Pixel seitlich
 * abschneiden. Sanity liefert stattdessen denselben mittigen Ausschnitt bereits
 * zugeschnitten: sichtbar deutlich schärfer, ohne die volle 2440-px-Datei zu
 * übertragen.
 */
function mobileHeroSrcSet(image: SectionHomeHero['image']): string | undefined {
  if (!image || image.kind !== 'remote' || !image.width || !image.height) return undefined;

  const targetRatio = 2 / 3;
  const sourceRatio = image.width / image.height;
  let cropWidth = image.width;
  let cropHeight = image.height;
  let cropLeft = 0;
  let cropTop = 0;

  if (sourceRatio > targetRatio) {
    cropWidth = Math.round(image.height * targetRatio);
    cropLeft = Math.round((image.width - cropWidth) / 2);
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.round(image.width / targetRatio);
    cropTop = Math.round((image.height - cropHeight) / 2);
  }

  const widths = MOBILE_HERO_WIDTHS.filter((width) => width < cropWidth);
  widths.push(cropWidth);
  const baseUrl = image.src.split('?')[0];
  const rect = `${cropLeft},${cropTop},${cropWidth},${cropHeight}`;

  return widths
    .map(
      (width) =>
        `${baseUrl}?rect=${rect}&w=${width}&q=90&auto=format&fit=max ${width}w`,
    )
    .join(', ');
}

/** Alternative Startseiten-Variante: Der Bildrahmen bleibt als ruhiger Anker
 * stabil, während Bild, Titel und CTA mit getrennten Geschwindigkeiten aus dem
 * Viewport laufen. */
export default function HomeHeroSection({
  section,
  edit,
}: {
  section: SectionHomeHero;
  edit?: EditAttr;
}) {
  const { _key, anchor, headingSmall, headingLarge, ctaLabel, image } = section;
  const path = `sections[_key=="${_key}"]`;
  const mobileSrcSet = mobileHeroSrcSet(image);

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
                {mobileSrcSet ? (
                  <picture>
                    <source media="(max-width: 991px)" srcSet={mobileSrcSet} sizes="100vw" />
                    <Img
                      image={image}
                      loading="eager"
                      fetchPriority="high"
                      quality={90}
                      sizes="110vw"
                    />
                  </picture>
                ) : (
                  <Img
                    image={image}
                    loading="eager"
                    fetchPriority="high"
                    quality={90}
                    sizes="110vw"
                  />
                )}
              </div>
              <div className="hhero__wipe" data-hero-wipe="" aria-hidden="true" />
            </div>
          </div>
        </header>
        <div className="hhero__trigger" data-hero-trigger="" aria-hidden="true" />
      </div>
    </section>
  );
}
