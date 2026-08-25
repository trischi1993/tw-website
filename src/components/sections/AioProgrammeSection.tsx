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
  const coachingVideo = theoryModules[0];
  const programme = modules[0]?.programme ?? DEFAULT_AIO_PROGRAMME;
  const programmePath = `sections[_key=="${modules[0]?._key}"].programme`;
  const posterUrl = (module: SectionModule) =>
    module.videoPosterImage
      ? module.videoPosterImage.kind === 'local'
        ? module.videoPosterImage.asset.src
        : module.videoPosterImage.src
      : module.videoPoster;

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

        <div
          className="aio-programme__overview"
          data-anim="aio-programme-overview"
          aria-label={programme.heading}
        >
          <div>
            <strong {...edit?.(`${programmePath}.theoryNumber`)}>
              {programme.theoryNumber}
            </strong>
            <div>
              <small {...edit?.(`${programmePath}.theoryLabel`)}>
                {programme.theoryLabel}
              </small>
              <span {...edit?.(`${programmePath}.theoryText`)}>{programme.theoryText}</span>
            </div>
          </div>
          <div>
            <strong {...edit?.(`${programmePath}.practiceNumber`)}>
              {programme.practiceNumber}
            </strong>
            <div>
              <small {...edit?.(`${programmePath}.practiceLabel`)}>
                {programme.practiceLabel}
              </small>
              <span {...edit?.(`${programmePath}.practiceText`)}>{programme.practiceText}</span>
            </div>
          </div>
        </div>

        <div className="aio-programme__modules" data-anim="aio-programme-modules">
          {modules.map((module) => {
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
                  <span
                    className={`aio-programme__format${isPractice ? ' is-practice' : ''}`}
                    {...edit?.(`${path}.bannerWord`)}
                  >
                    {module.bannerWord}
                  </span>
                  <span className="aio-programme__toggle" aria-hidden="true" />
                </summary>

                <div className={`aio-programme__detail${isPractice ? ' is-practice' : ''}`}>
                  <div className="aio-programme__detail-copy">
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
                    {isPractice && module.coachingText && (
                      <p className="aio-programme__practice-note" {...edit?.(`${path}.coachingText`)}>
                        {module.coachingText}
                      </p>
                    )}
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
          })}
        </div>

        <aside className="aio-programme__coaching" data-anim="reveal" data-offset="10">
          {coachingVideo?.videoSrc && (
            <video
              className="aio-programme__coaching-video"
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
          <span className="aio-programme__coaching-shade" aria-hidden="true" />
          <div className="aio-programme__coaching-inner">
            <div className="aio-programme__coaching-number">
              <strong {...edit?.(`${programmePath}.coachingStat`)}>
                {programme.coachingStat}
              </strong>
              <span {...edit?.(`${programmePath}.coachingLabel`)}>{programme.coachingLabel}</span>
            </div>
            <div className="aio-programme__coaching-copy">
              <p
                className="aio-programme__eyebrow"
                {...edit?.(`${programmePath}.coachingEyebrow`)}
              >
                {programme.coachingEyebrow}
              </p>
              <h3 {...edit?.(`${programmePath}.coachingHeading`)}>
                {programme.coachingHeading}
              </h3>
              <p {...edit?.(`${programmePath}.coachingText`)}>{programme.coachingText}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
