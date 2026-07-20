import type { SectionServicesTabs } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';

/**
 * „Spezifische Coachings": Tabs je Zielgruppe, Karten aus der Service-
 * Collection (in die Section-Daten eingebettet, siehe SECTIONS_PROJECTION).
 * Tab-Umschaltung: delegiertes Script (src/scripts/widgets.ts, [data-tab]).
 */
export default function ServicesTabsSection({
  section,
  edit,
}: {
  section: SectionServicesTabs;
  edit?: EditAttr;
}) {
  const {
    _key,
    anchor,
    heading,
    subtext,
    tabLabelPersonal,
    tabLabelBusiness,
    limit,
    ctaModalLabel,
    calendlyLabel,
    calendlyUrl,
    services,
  } = section;
  const path = `sections[_key=="${_key}"]`;
  const max = limit && limit > 0 ? limit : Infinity;
  const personal = services.filter((s) => s.category === 'personal').slice(0, max);
  const business = services.filter((s) => s.category === 'business').slice(0, max);

  const cards = (items: typeof services) =>
    items.map((s) => (
      <div className="services__card" key={s.id} data-anim="reveal-up" data-delay="0.3">
        <Img image={s.image} sizes="(max-width: 767px) 45vw, 12rem" />
        <div className="services__card-content">
          <h4>{s.name}</h4>
          <p>{s.description}</p>
        </div>
      </div>
    ));

  return (
    <section
      id={anchor || undefined}
      className="services section"
      style={{ paddingBlock: 'var(--section-pad-large)' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container container--md">
        <div className="services__head">
          <div className="max-w-lg align-center">
            <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {subtext && <p {...edit?.(`${path}.subtext`)}>{subtext}</p>}
          </div>
        </div>

        <div className="services__tabs" data-tabs="">
          <div className="services__tab-menu" role="tablist">
            <button
              type="button"
              role="tab"
              id={`tab-${_key}-1`}
              aria-selected="true"
              aria-controls={`panel-${_key}-1`}
              className="services__tab is-active"
              data-tab="1"
            >
              <h3 {...edit?.(`${path}.tabLabelPersonal`)}>{tabLabelPersonal}</h3>
            </button>
            <button
              type="button"
              role="tab"
              id={`tab-${_key}-2`}
              aria-selected="false"
              aria-controls={`panel-${_key}-2`}
              className="services__tab"
              data-tab="2"
            >
              <h3 {...edit?.(`${path}.tabLabelBusiness`)}>{tabLabelBusiness}</h3>
            </button>
          </div>
          <div
            className="services__panel"
            role="tabpanel"
            id={`panel-${_key}-1`}
            aria-labelledby={`tab-${_key}-1`}
            data-tab-panel="1"
          >
            {cards(personal)}
          </div>
          <div
            className="services__panel"
            role="tabpanel"
            id={`panel-${_key}-2`}
            aria-labelledby={`tab-${_key}-2`}
            data-tab-panel="2"
            hidden
          >
            {cards(business)}
          </div>
        </div>

        <div className="services__footer button-group is-center">
          <GlowButton label={ctaModalLabel} action="modal" />
          {calendlyLabel && calendlyUrl && (
            <a className="link-underline" href={calendlyUrl} target="_blank" rel="noopener noreferrer">
              {calendlyLabel}
              <span className="link-underline__line" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
