import type { SectionBonuses } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/** Bonus-Karten (3er-Reihe, Gold-Tag) + Bewerbungs-CTA. */
export default function BonusesSection({
  section,
  edit,
}: {
  section: SectionBonuses;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, intro, cards, ctaLabel } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="bonus section"
      style={{ paddingBlock: 'var(--section-pad-large)' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="bonus__head">
          <div className="max-w-lg align-center">
            <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {intro && <p {...edit?.(`${path}.intro`)}>{intro}</p>}
          </div>
        </div>
        <div className="bonus__grid">
          {cards.map((card) => (
            <div className="bonus__card" key={card._key} data-anim="reveal-up" data-delay="0.2">
              <Img image={card.image} sizes="(max-width: 991px) 90vw, 26rem" />
              <div className="bonus__card-content">
                <span className="bonus__tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </div>
          ))}
        </div>
        {ctaLabel && (
          <div className="bonus__footer button-group is-center">
            <GlowButton label={ctaLabel} action="modal-aio" />
          </div>
        )}
      </div>
    </section>
  );
}
