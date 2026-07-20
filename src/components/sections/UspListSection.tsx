import type { SectionUspList } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';

/**
 * USP-Liste („Warum mit mir zusammenarbeiten" / „Das Besondere"): 2-spaltige
 * Liste mit Punkt-Icons und Trennlinien, die beim Scrollen einfahren
 * (motion.ts, [data-line-draw]).
 */
export default function UspListSection({
  section,
  edit,
}: {
  section: SectionUspList;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, items } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="usp section"
      style={{ paddingBlock: 'var(--section-pad-large)', overflow: 'hidden' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="usp__head">
          <div className="max-w-lg align-center">
            <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
          </div>
        </div>
        <div className="usp__grid">
          {items.map((item) => (
            <div className="usp__item" key={item._key}>
              <div className="usp__row" data-anim="reveal-split">
                <span className="usp__dot" aria-hidden="true" data-split-a="">
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <circle cx="8" cy="8" r="6" fill="currentColor" />
                  </svg>
                </span>
                <p className="usp__text" data-split-b="">
                  {item.lead && <strong>{item.lead} </strong>}
                  {item.text}
                </p>
              </div>
              <span className="usp__line" data-line-draw="" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
