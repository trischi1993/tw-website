import type { SectionResults } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';

/**
 * „Zahlen & Fakten": geprägter Doppel-Titel (gefüllt + Outline) und vier
 * gestapelte Beweis-Karten, die beim Scrollen auffächern (200vh-Strecke,
 * Sticky-Content; Scrub-Animation in motion.ts über [data-results]).
 */
export default function ResultsSection({
  section,
  edit,
}: {
  section: SectionResults;
  edit?: EditAttr;
}) {
  const { _key, anchor, title, images } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="results"
      data-results=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="results__track">
          <div className="results__sticky">
            <div className="results__title-wrapper" aria-hidden="true">
              <h2 className="results__title" data-results-title-1="">
                {title}
              </h2>
            </div>
            <div className="results__title-wrapper is-outline" aria-hidden="true">
              <h2 className="results__title is-outline" data-results-title-2="">
                {title}
              </h2>
            </div>
            <h2 className="visually-hidden" {...edit?.(`${path}.title`)}>
              {title}
            </h2>
            <div className="results__list">
              {images.map((image, i) => (
                <div className="results__card" data-results-card={i + 1} key={i}>
                  <Img image={image} sizes="(max-width: 767px) 90vw, 30rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
