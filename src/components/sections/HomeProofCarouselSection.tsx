import type {
  ResultClosingCard,
  SectionResults,
  SiteImage,
} from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import GlowButton from './GlowButton';

const DEFAULT_CLOSING_CARD: ResultClosingCard = {
  kicker: 'Und viele weitere meiner Kunden ...',
  heading: '... haben mit klarer Strategie ihren nächsten Wachstumsschritt erreicht.',
  hint: 'Hier könnte dein Erfolg stehen.',
  source: 'Dein nächster Schritt',
  text: 'Lass uns das Potenzial in deinem Account sichtbar machen.',
  ctaLabel: 'Ich will auch wachsen!',
  ctaAction: 'modal',
};

function imageProps(image: SiteImage) {
  if (image.kind === 'local') {
    return {
      src: image.asset.src,
      width: image.asset.width,
      height: image.asset.height,
      alt: image.alt,
    };
  }
  return {
    src: image.src,
    srcSet: image.srcSet,
    width: image.width,
    height: image.height,
    alt: image.alt,
  };
}

export default function HomeProofCarouselSection({
  section,
  edit,
}: {
  section: SectionResults;
  edit?: EditAttr;
}) {
  const {
    _key,
    anchor,
    heading = 'Lass Ergebnisse aus der Praxis sprechen.',
    ownLabel = 'Meine Erfolge',
    customerLabel = 'Kundenerfolge',
    cards = [],
    closingCard = DEFAULT_CLOSING_CARD,
  } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="home-proof"
      data-home-proof=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <header className="home-proof__head" data-anim="reveal">
          <h2 {...edit?.(`${path}.heading`)}>{heading}</h2>
          <div className="home-proof__legend" aria-label="Ergebnisgruppe auswählen">
            <button
              type="button"
              className="is-own is-active"
              data-proof-jump="own"
              aria-pressed="true"
            >
              <i aria-hidden="true" /> <span {...edit?.(`${path}.ownLabel`)}>{ownLabel}</span>
            </button>
            <button
              type="button"
              className="is-customer"
              data-proof-jump="customer"
              aria-pressed="false"
            >
              <i aria-hidden="true" /> <span {...edit?.(`${path}.customerLabel`)}>{customerLabel}</span>
            </button>
          </div>
        </header>

        <div
          className="home-proof__carousel"
          data-home-proof-carousel=""
          aria-label="Meine Erfolge und Kundenerfolge"
        >
          {cards.map(({ _key: cardKey, kind, source, value, label, images }) => {
            const cardPath = `${path}.cards[_key=="${cardKey}"]`;
            return (
              <article
                className={`home-proof-card is-${kind}`}
                data-result-kind={kind}
                aria-label={`${kind === 'own' ? 'Mein Erfolg' : 'Kundenerfolg'}: ${source}`}
                key={cardKey}
                {...edit?.(cardPath)}
              >
                <div
                  className={`home-proof-card__media${images.length > 1 ? ' is-comparison' : ''}${images.length === 3 ? ' is-triple' : ''}`}
                >
                  {images.map((proofImage) => {
                    const crop = proofImage.crop;
                    const props = imageProps(proofImage.image);
                    return (
                      <figure
                        className={[
                          crop === 'trim-bottom' ? 'is-bottom-trimmed' : '',
                          crop === 'circle' ? 'is-circle-cropped' : '',
                          crop === 'chat-header' ? 'is-chat-header-cropped' : '',
                          crop === 'profile-tristan' ? 'is-tristan-profile-cropped' : '',
                          crop === 'profile-mindful' ? 'is-mindful-profile-cropped' : '',
                          proofImage.badgePosition ? `is-badge-${proofImage.badgePosition}` : '',
                        ].filter(Boolean).join(' ') || undefined}
                        key={proofImage._key}
                      >
                        <img
                          src={props.src}
                          srcSet={props.srcSet}
                          width={props.width}
                          height={props.height}
                          alt={props.alt}
                          loading="lazy"
                          decoding="async"
                        />
                        {proofImage.badge ? <figcaption>{proofImage.badge}</figcaption> : null}
                      </figure>
                    );
                  })}
                </div>

                <div className="home-proof-card__body">
                  <p className="home-proof-card__source" {...edit?.(`${cardPath}.source`)}>
                    <i aria-hidden="true" />
                    {source}
                  </p>
                  <div className="home-proof-card__metric">
                    <strong {...edit?.(`${cardPath}.value`)}>{value}</strong>
                    <span {...edit?.(`${cardPath}.label`)}>{label}</span>
                  </div>
                </div>
              </article>
            );
          })}

          <article
            className="home-proof-card home-proof-card--more"
            aria-label="Dein möglicher nächster Erfolg"
            {...edit?.(`${path}.closingCard`)}
          >
            <div className="home-proof-card__more-visual">
              <p>{closingCard.kicker}</p>
              <h3>{closingCard.heading}</h3>
              <span>{closingCard.hint}</span>
              <strong aria-hidden="true">+</strong>
            </div>

            <div className="home-proof-card__body home-proof-card__more-body">
              <p className="home-proof-card__source">{closingCard.source}</p>
              <p className="home-proof-card__more-copy">{closingCard.text}</p>
              <div className="home-proof-card__more-cta">
                <GlowButton
                  label={closingCard.ctaLabel}
                  action={closingCard.ctaAction}
                  href={closingCard.ctaHref}
                  newTab={closingCard.ctaNewTab}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
