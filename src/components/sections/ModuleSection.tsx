import type { SectionModule } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';

/**
 * Programm-Abschnitt (Modul bzw. „Deine Resultate"): Titelzeile mit Linie und
 * Nummer, statisches Wort-Laufband (im Original NICHT animiert), Bullets links,
 * Bild auf rotiertem Gold-Quadrat rechts; optional der 1:1-Coaching-Teil mit
 * selbstgehostetem Hintergrundvideo (autoplay/muted/loop, kein Consent nötig).
 */
export default function ModuleSection({
  section,
  edit,
}: {
  section: SectionModule;
  edit?: EditAttr;
}) {
  const {
    _key,
    anchor,
    titleRowText,
    number,
    bannerWord,
    bannerGold,
    heading,
    bullets,
    bulletsNowrap,
    image,
    imageWide,
    coachingHeading,
    coachingText,
    videoSrc,
    videoPoster,
  } = section;
  const path = `sections[_key=="${_key}"]`;
  const words = Array.from({ length: 17 }, (_, i) => i);
  const hasCoaching = Boolean(coachingHeading && coachingText);

  /* Anim-Belegung je Modul, 1:1 aus den IX2-Events des Webflow-Exports
     (Positionen im Export-HTML; siehe HANDOVER/Decode):
     - Titel-Choreo a-75: alle; Offset 16, nur Modul 04 = 0 (e-904).
     - Banner-Reveal a-117 (e-576): NUR Modul 01.
     - Listen-Reveal a-117 (e-879ff, Offset 0, Delay 0.15): alle AUSSER 04.
     - Bild-Reveal: 01 = a-117 (Delay 0.15, Offset 10, e-592);
       02 = a-110 (Offset 12, e-598); 03 = a-110 (Offset 10, e-617);
       „Deine Resultate" (ohne Nummer) = a-110 (Offset 10, e-867);
       04/05 = KEIN Reveal (statisch). */
  const num = number ?? '';
  const titleOffset = num === '04' ? 0 : 16;
  const bannerReveal = num === '01';
  const listReveal = num !== '04';
  const rightReveal =
    num === '01'
      ? { delay: '0.15', offset: '10' }
      : num === '02'
        ? { delay: '0', offset: '12' }
        : num === '03' || num === ''
          ? { delay: '0', offset: '10' }
          : null;

  return (
    <section
      id={anchor || undefined}
      className={`module${number ? '' : ' is-compact'}`}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="module__pad" data-module-scrub="">
        <div className="container">
          <div className="module__title-row" data-module-title="" data-offset={titleOffset}>
            <h2 className="module__title-text" data-module-title-text="" {...edit?.(`${path}.titleRowText`)}>
              {titleRowText}
            </h2>
            <div className="module__line-wrapper">
              <div className="module__line" data-module-title-line="" />
            </div>
            {number && (
              <div className="module__number" data-module-title-number="" {...edit?.(`${path}.number`)}>
                {number}
              </div>
            )}
          </div>
        </div>
        <div
          className="module__banner"
          aria-hidden="true"
          data-anim={bannerReveal ? 'reveal' : undefined}
          data-delay={bannerReveal ? '0.15' : undefined}
        >
          <div className="module__banner-track" data-module-banner-track="">
            {/* Export: das Resultate-Band ist KOMPLETT gold (17× .text-color-brand-secondary) */}
            {words.map((i) => (
              <span className={`module__banner-word${bannerGold ? ' is-gold' : ''}`} key={i}>
                {bannerWord}
              </span>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="module__content">
            <div className="module__left">
              <h3 {...edit?.(`${path}.heading`)}>{heading}</h3>
              <ul
                className={`module__list${bulletsNowrap ? ' is-nowrap' : ''}`}
                data-anim={listReveal ? 'reveal' : undefined}
                data-delay={listReveal ? '0.15' : undefined}
                data-offset={listReveal ? '0' : undefined}
              >
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <div
              className="module__right"
              data-anim={rightReveal ? 'reveal' : undefined}
              data-delay={rightReveal?.delay}
              data-offset={rightReveal?.offset}
            >
              <div className="module__image-wrapper">
                <span className="module__img-bg" aria-hidden="true" />
                <Img image={image} className={imageWide ? 'is-wide' : undefined} sizes="19rem" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasCoaching && (
        <div className="coachvid">
          <div className="coachvid__bg" aria-hidden="true">
            {videoSrc && (
              <video autoPlay muted loop playsInline preload="metadata" poster={videoPoster || undefined}>
                <source src={videoSrc} type="video/mp4" />
              </video>
            )}
          </div>
          <div className="coachvid__content container">
            <div className="max-w-md">
              <h2 {...edit?.(`${path}.coachingHeading`)}>{coachingHeading}</h2>
              <p {...edit?.(`${path}.coachingText`)}>{coachingText}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
