import type { SectionModule } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';

/**
 * Lokale Konzeptvariante fuer die AIO-Seite: Die fuenf aufeinanderfolgenden
 * Modul-Sections bleiben inhaltlich unveraendert, werden aber als kompakter,
 * nativ bedienbarer Programm-Ablauf dargestellt. Dadurch muss fuer den Test
 * weder das Sanity-Schema noch der Inhalt im CMS veraendert werden.
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
          <p className="aio-programme__eyebrow aio-section-eyebrow">Dein klarer Fahrplan</p>
          <h2>Dein Weg in 5 Modulen</h2>
          <p>
            Vom strategischen Fundament bis zur professionellen Content-Produktion:
            Öffne ein Modul, um Inhalte und Schwerpunkte anzusehen.
          </p>
        </header>

        <div
          className="aio-programme__overview"
          data-anim="aio-programme-overview"
          aria-label="Programmaufbau"
        >
          <div>
            <strong>01–04</strong>
            <div>
              <small>Theorie online</small>
              <span>Videolektionen und persönliche 1:1 Begleitung</span>
            </div>
          </div>
          <div>
            <strong>05</strong>
            <div>
              <small>Praxis vor Ort</small>
              <span>Praxis-Coaching und Content-Produktion vor Ort</span>
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
                    {isPractice ? 'Praxis vor Ort' : 'Videolektionen'}
                  </span>
                  <span className="aio-programme__toggle" aria-hidden="true" />
                </summary>

                <div className={`aio-programme__detail${isPractice ? ' is-practice' : ''}`}>
                  <div className="aio-programme__detail-copy">
                    <ul {...edit?.(`${path}.bullets`)}>
                      {module.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
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
                        <strong>Von der Theorie in die Content-Praxis.</strong>
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
              <strong>{theoryModules.length} × 2 h</strong>
              <span>1:1 Coachings</span>
            </div>
            <div className="aio-programme__coaching-copy">
              <p className="aio-programme__eyebrow">Individuelle &amp; persönliche Begleitung</p>
              <h3>Nach jedem Theorie-Modul besprechen wir deine Umsetzung.</h3>
              <p>
                Bei jedem der vier Theorie-Module schaust du dir zuerst die Videolektionen an.
                Danach folgt der dazugehörige zweistündige 1:1-Videocall mit mir. Dort klären wir
                deine offenen Fragen und du bekommst individuelles Feedback sowie konkrete Tipps
                für deine Umsetzung.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
