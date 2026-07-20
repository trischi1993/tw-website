import type { SectionFaq } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import RichText from './RichText';

/**
 * FAQ-Accordion: Frage-Zeile mit weißem Plus-Quadrat, Antwort auf dunkler
 * Fläche. Toggle: delegiertes Script (widgets.ts, [data-faq-toggle]) mit
 * GSAP-Höhenanimation; Items unabhängig aufklappbar (wie das Original).
 */
export default function FaqSection({ section, edit }: { section: SectionFaq; edit?: EditAttr }) {
  const { _key, anchor, heading, items } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="faq section"
      style={{ paddingBlock: 'var(--section-pad-large)' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="faq__head max-w-lg">
          <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
            {heading}
          </h2>
        </div>
        <div className="faq__list">
          {items.map((item, i) => (
            <div className="faq__item" key={item._key} data-anim="reveal-left" data-faq-item="">
              <button
                type="button"
                className="faq__top"
                data-faq-toggle=""
                aria-expanded="false"
                aria-controls={`faq-${_key}-${i}`}
              >
                <span className="faq__question">{item.question}</span>
                <span className="faq__icon" aria-hidden="true" />
              </button>
              <span className="faq__line" aria-hidden="true" />
              <div className="faq__bottom" id={`faq-${_key}-${i}`} data-faq-panel="" hidden>
                <div className="faq__answer">
                  <RichText value={item.answer} paragraphs />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
