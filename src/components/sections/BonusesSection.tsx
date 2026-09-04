import type { SectionBonuses } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import { contentShell } from './shell';

/**
 * Bonus-Karten (3er-Reihe, Gold-Tag) + Bewerbungs-CTA. Standardmäßig ohne
 * Animation wie im Webflow-Export. Die lokale AIO-Konzeptseite kann dieselbe
 * gemeinsame Reveal-Logik wie vergleichbare Inhaltsabschnitte zuschalten.
 */
export default function BonusesSection({
  section,
  edit,
  animate = false,
}: {
  section: SectionBonuses;
  edit?: EditAttr;
  animate?: boolean;
}) {
  const { _key, anchor, heading, intro, cards, ctaLabel } = section;
  const path = `sections[_key=="${_key}"]`;
  const shell = contentShell(section, { top: 'large', bottom: 'large' });

  return (
    <section
      id={anchor || undefined}
      className={`bonus ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div
          className="bonus__head"
          data-anim={animate ? 'reveal' : undefined}
          data-offset={animate ? '24' : undefined}
        >
          <div className="max-w-lg align-center">
            <h2 {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {intro && <p {...edit?.(`${path}.intro`)}>{intro}</p>}
          </div>
        </div>
        <div className="bonus__grid">
          {cards.map((card, index) => {
            const normalizedTitle = card.title.trim().toLocaleLowerCase('de-DE');
            const isTristy =
              card._key === 'bonus-2' ||
              normalizedTitle.includes('ki-assistent') ||
              normalizedTitle.includes('tristy');

            return (
              <div
                className="bonus__card"
                key={card._key}
                data-anim={animate ? 'reveal' : undefined}
                data-offset={animate ? '24' : undefined}
                data-delay={animate ? String(index * 0.07) : undefined}
              >
                <div className="bonus__visual">
                  <Img image={card.image} sizes="(max-width: 991px) 90vw, 26rem" />
                  {isTristy && (
                    <span className="bonus__assistant-bubble" data-tristy-chat>
                      <span className="bonus__assistant-greeting" aria-hidden="true">
                        <span data-tristy-prefix>Hey, ich bin </span>
                        <strong data-tristy-name>Tristy</strong>
                        <span data-tristy-dots>...</span>
                        <span
                          className="bonus__assistant-cursor"
                          data-tristy-cursor="greeting"
                        />
                      </span>
                      <span
                        className="bonus__assistant-prompt"
                        aria-hidden="true"
                      >
                        <span data-tristy-prompt>Wie kann ich dir helfen?</span>
                        <span
                          className="bonus__assistant-cursor"
                          data-tristy-cursor="prompt"
                        />
                      </span>
                      <span className="visually-hidden">
                        Hey, ich bin Tristy. Wie kann ich dir helfen?
                      </span>
                    </span>
                  )}
                </div>
                <div className="bonus__card-content">
                  <span
                    className="bonus__tag"
                    {...edit?.(`${path}.cards[_key=="${card._key}"].tag`)}
                  >
                    {card.tag}
                  </span>
                  <h3 {...edit?.(`${path}.cards[_key=="${card._key}"].title`)}>
                    {card.title}
                  </h3>
                  <p {...edit?.(`${path}.cards[_key=="${card._key}"].text`)}>{card.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        {ctaLabel && (
          <div
            className="bonus__footer button-group is-center"
            data-anim={animate ? 'reveal' : undefined}
            data-offset={animate ? '22' : undefined}
            {...edit?.(`${path}.ctaLabel`)}
          >
            <GlowButton label={ctaLabel} action="modal-aio" />
          </div>
        )}
      </div>
    </section>
  );
}
