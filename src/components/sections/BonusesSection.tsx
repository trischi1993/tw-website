import type { SectionBonuses } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import { contentShell } from './shell';

/**
 * Bonus-Karten (3er-Reihe, Gold-Tag) + Bewerbungs-CTA. Bewusst OHNE
 * Animationen: Die Live-Karten (.layout395_card) haben im Webflow-Export
 * weder data-w-id noch Events; der IX2-Hover a-130/131 zielt auf die dort
 * nicht existierende Klasse .grid_item-link (Altlast) und ist damit tot.
 */
export default function BonusesSection({
  section,
  edit,
}: {
  section: SectionBonuses;
  edit?: EditAttr;
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
        <div className="bonus__head">
          <div className="max-w-lg align-center">
            <h2 {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {intro && <p {...edit?.(`${path}.intro`)}>{intro}</p>}
          </div>
        </div>
        <div className="bonus__grid">
          {cards.map((card) => (
            <div className="bonus__card" key={card._key}>
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
