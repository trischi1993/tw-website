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

  return (
    <section
      id={anchor || undefined}
      className={`module${number ? '' : ' is-compact'}`}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="module__pad">
        <div className="container">
          <div className="module__title-row">
            <h2 className="module__title-text" {...edit?.(`${path}.titleRowText`)}>
              {titleRowText}
            </h2>
            <div className="module__line-wrapper">
              <div className="module__line" data-line-draw="" />
            </div>
            {number && (
              <div className="module__number" {...edit?.(`${path}.number`)}>
                {number}
              </div>
            )}
          </div>
        </div>
        <div className="module__banner" aria-hidden="true">
          <div className="module__banner-track">
            {words.map((i) => (
              <span
                className={`module__banner-word${bannerGold && i === words.length - 1 ? ' is-gold' : ''}`}
                key={i}
              >
                {bannerWord}
              </span>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="module__content">
            <div className="module__left">
              <h3 {...edit?.(`${path}.heading`)}>{heading}</h3>
              <ul className={`module__list${bulletsNowrap ? ' is-nowrap' : ''}`} data-anim="reveal-up">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="module__right" data-anim="reveal-up" data-delay="0.15">
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
