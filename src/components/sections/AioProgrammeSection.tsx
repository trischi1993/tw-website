import type { SectionModule } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { DEFAULT_AIO_PROGRAMME } from '../../lib/content/aio-programme';

/**
 * AIO-Sonderlayout: Die fuenf aufeinanderfolgenden Modul-Sections werden als
 * kompakter, nativ bedienbarer Programm-Ablauf dargestellt. Modultexte kommen
 * aus den einzelnen Sections; die uebergeordneten Fahrplan- und Coaching-Texte
 * liegen im programme-Objekt des ersten Moduls.
 */
export default function AioProgrammeSection({
  modules,
  edit,
}: {
  modules: SectionModule[];
  edit?: EditAttr;
}) {
  const theoryModules = modules.filter((module) => module.number !== '05');
  const practiceModules = modules.filter((module) => module.number === '05');
  const coachingVideo = theoryModules[0];
  const programme = modules[0]?.programme ?? DEFAULT_AIO_PROGRAMME;
  const programmePath = `sections[_key=="${modules[0]?._key}"].programme`;
  const posterUrl = (module: SectionModule) =>
    module.videoPosterImage
      ? module.videoPosterImage.kind === 'local'
        ? module.videoPosterImage.asset.src
        : module.videoPosterImage.src
      : module.videoPoster;

  const renderModule = (module: SectionModule) => {
    const path = `sections[_key=="${module._key}"]`;
    const isPractice = module.number === '05';

    return (
      <details
        className="aio-programme__module"
        key={module._key}
        data-section-key={edit ? module._key : undefined}
        {...edit?.(path)}
      >
        <summary>
          <span className="aio-programme__number" {...edit?.(`${path}.number`)}>
            {module.number}
          </span>
          <span className="aio-programme__module-title" {...edit?.(`${path}.heading`)}>
            {module.heading}
          </span>
          <span className="aio-programme__toggle" aria-hidden="true" />
        </summary>

        <div className={`aio-programme__detail${isPractice ? ' is-practice' : ''}`}>
          <div className="aio-programme__detail-copy">
            {isPractice && module.coachingText && (
              <p className="aio-programme__practice-note" {...edit?.(`${path}.coachingText`)}>
                {module.coachingText}
              </p>
            )}
            <ul {...edit?.(`${path}.bullets`)}>
              {module.bullets.map((bullet, index) => (
                <li
                  key={`${bullet}-${index}`}
                  {...edit?.(`${path}.bullets[${index}]`)}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {isPractice && module.videoSrc ? (
            <div className="aio-programme__practice-video">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={posterUrl(module)}
                aria-hidden="true"
              >
                <source src={module.videoSrc} type="video/mp4" />
              </video>
              <div className="aio-programme__practice-overlay">
                <strong {...edit?.(`${programmePath}.practiceOverlay`)}>
                  {programme.practiceOverlay}
                </strong>
              </div>
            </div>
          ) : (
            <div className="aio-programme__visual">
              <div className="aio-programme__visual-frame">
                <span aria-hidden="true" />
                <Img image={module.image} sizes="(max-width: 767px) 78vw, 25rem" />
              </div>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <section className="aio-programme section" id="programm">
      <div className="container">
        <header className="aio-programme__head" data-anim="reveal">
          <p
            className="aio-programme__eyebrow aio-section-eyebrow"
            {...edit?.(`${programmePath}.eyebrow`)}
          >
            {programme.eyebrow}
          </p>
          <h2 {...edit?.(`${programmePath}.heading`)}>{programme.heading}</h2>
          <p {...edit?.(`${programmePath}.intro`)}>{programme.intro}</p>
        </header>

        <div className="aio-programme__modules" data-anim="aio-programme-modules">
          {theoryModules.length > 0 && (
            <section className="aio-programme__group" aria-labelledby="aio-programme-theory">
              <header className="aio-programme__group-head">
                <h3 id="aio-programme-theory" {...edit?.(`${programmePath}.theoryLabel`)}>
                  {programme.theoryLabel}
                </h3>
                <p {...edit?.(`${programmePath}.theoryText`)}>{programme.theoryText}</p>
              </header>
              <div className="aio-programme__group-modules">
                {theoryModules.map(renderModule)}
                <details
                  className="aio-programme__module aio-programme__module--coaching"
                  id="aio-programme-coaching"
                >
                  <summary>
                    <span
                      className="aio-programme__number aio-programme__coaching-plus"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span className="aio-programme__module-title">
                      <span {...edit?.(`${programmePath}.coachingLabel`)}>
                        {programme.coachingLabel}
                      </span>
                    </span>
                    <span className="aio-programme__toggle" aria-hidden="true" />
                  </summary>

                  <div className="aio-programme__detail is-practice is-coaching">
                    <div className="aio-programme__detail-copy aio-programme__coaching-copy">
                      <p
                        className="aio-programme__practice-note aio-programme__coaching-intro"
                        {...edit?.(`${programmePath}.coachingText`)}
                      >
                        {programme.coachingText}
                      </p>
                      <ul
                        className="aio-programme__coaching-benefits"
                        {...edit?.(`${programmePath}.coachingBenefits`)}
                      >
                        {programme.coachingBenefits.map((benefit, index) => (
                          <li
                            key={`${benefit}-${index}`}
                            {...edit?.(`${programmePath}.coachingBenefits[${index}]`)}
                          >
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="aio-programme__practice-video aio-programme__coaching-media">
                      {coachingVideo?.videoSrc && (
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={posterUrl(coachingVideo)}
                          aria-hidden="true"
                        >
                          <source src={coachingVideo.videoSrc} type="video/mp4" />
                        </video>
                      )}
                      <div className="aio-programme__practice-overlay">
                        <strong {...edit?.(`${programmePath}.coachingEyebrow`)}>
                          {programme.coachingEyebrow}
                        </strong>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </section>
          )}

          {practiceModules.length > 0 && (
            <section
              className="aio-programme__group is-practice"
              aria-labelledby="aio-programme-practice"
            >
              <header className="aio-programme__group-head">
                <h3 id="aio-programme-practice" {...edit?.(`${programmePath}.practiceLabel`)}>
                  {programme.practiceLabel}
                </h3>
                <p {...edit?.(`${programmePath}.practiceText`)}>{programme.practiceText}</p>
              </header>
              <div className="aio-programme__group-modules">
                {practiceModules.map(renderModule)}
              </div>
            </section>
          )}
        </div>

      </div>
    </section>
  );
}
