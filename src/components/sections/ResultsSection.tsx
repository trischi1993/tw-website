import type { SectionResults } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import mindfulStaysResult from '../../assets/images/results-5.avif';
import reelViewsResult from '../../assets/images/results-6.avif';

const HOME_RESULT_ADDITIONS = [
  {
    kind: 'local' as const,
    asset: mindfulStaysResult,
    alt: 'Instagram-Profil Mindful Stays mit 115.000 Followern und millionenfach angesehenen Reels',
  },
  {
    kind: 'local' as const,
    asset: reelViewsResult,
    alt: 'Instagram-Statistik mit über 1,6 Millionen Aufrufen und stark gestiegenen Profilaktivitäten',
  },
];

/**
 * „Zahlen & Fakten": geprägter Doppel-Titel (gefüllt + Outline, statisch) und
 * sechs gestapelte Karten, die beim Scrollen nacheinander nach oben
 * herausfliegen (erweiterter IX2-Nachbau; Sticky-Content, Scrub über
 * [data-results-trigger] in motion/results.ts).
 */
export default function ResultsSection({
  section,
  edit,
}: {
  section: SectionResults;
  edit?: EditAttr;
}) {
  const { _key, anchor, subtitle, title = '', images = [] } = section;
  const path = `sections[_key=="${_key}"]`;
  const contextSubtitle =
    subtitle || (_key === 'results' ? 'meiner Accounts' : undefined);
  const visualTitleRows = contextSubtitle ? [title, contextSubtitle] : [title];
  /* Die Produktionsseite bezieht ihre vier bisherigen Karten aus Sanity. Die
     zwei neuen, lokal optimierten Mockups werden bis zu einem spaeteren
     CMS-Upload nur an die kanonische Startseiten-Section angehaengt. Gleiche
     Alt-Texte verhindern Duplikate, sobald sie auch im CMS vorhanden sind. */
  const displayImages =
    _key === 'results'
      ? [
          ...images,
          ...HOME_RESULT_ADDITIONS.filter(
            (addition) => !images.some((image) => image.alt === addition.alt),
          ),
        ]
      : images;

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
              <div className="results__title-reel" data-results-title-reel="">
                {visualTitleRows.map((row, index) => (
                  <div
                    className="results__title-row"
                    data-results-title-row={index}
                    key={row}
                  >
                    <span className="results__title">{row}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="results__title-wrapper is-outline" aria-hidden="true">
              <div className="results__title-reel" data-results-title-reel="">
                {visualTitleRows.map((row, index) => (
                  <div
                    className="results__title-row"
                    data-results-title-row={index}
                    key={row}
                  >
                    <span className="results__title is-outline">{row}</span>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="visually-hidden" {...edit?.(`${path}.title`)}>
              {title}
            </h2>
            {contextSubtitle && (
              <p className="visually-hidden" {...edit?.(`${path}.subtitle`)}>
                {contextSubtitle}
              </p>
            )}
            <div className="results__list">
              {displayImages.map((image, i) => (
                <div className="results__card" data-results-card={i + 1} key={i}>
                  {/* Karte ist hoehen-getrieben (aspect-ratio 2/3, height 60vh /
                      @991 24rem / @767 22rem); das Portrait rendert real nur
                      ~174px (mobil) bis ~280px (Desktop) breit. sizes bildet das
                      ab, sonst laedt der Browser eine viel zu grosse Stufe. */}
                  <Img image={image} sizes="(max-width: 991px) 13rem, 30rem" />
                </div>
              ))}
            </div>
          </div>
          <div className="results__trigger" data-results-trigger="" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}
