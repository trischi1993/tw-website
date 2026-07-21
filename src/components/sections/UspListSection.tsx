import type { SectionUspList } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import { contentShell } from './shell';

/**
 * USP-Liste („Warum mit mir zusammenarbeiten" / „Das Besondere"): 2-spaltige
 * Liste mit Punkt-Icons und Trennlinien. Animationen 1:1 nach IX2:
 * H2 = reveal (a-110), Zeilen = usp-row (a-50, Icon/Text gegenläufig),
 * Trennlinien = grow-line (a-41, width 0→100 %).
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
  const shell = contentShell(section, { top: 'large', bottom: 'large' });

  return (
    <section
      id={anchor || undefined}
      className={`usp ${shell.className}`}
      style={{ ...shell.style, overflow: 'hidden' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="usp__head">
          <div className="max-w-lg align-center">
            <h2 data-anim="reveal" {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
          </div>
        </div>
        <div className="usp__grid">
          {items.map((item) => (
            <div className="usp__item" key={item._key}>
              <div className="usp__row" data-anim="usp-row">
                <span className="usp__dot" aria-hidden="true" data-usp-icon="">
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <circle cx="8" cy="8" r="6" fill="currentColor" />
                  </svg>
                </span>
                <p className="usp__text" data-usp-text="">
                  {item.lead && <strong>{item.lead} </strong>}
                  {item.text}
                </p>
              </div>
              <span className="usp__line" data-anim="grow-line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
