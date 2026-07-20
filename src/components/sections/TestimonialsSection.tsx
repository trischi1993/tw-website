import type { SectionTestimonials } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';

const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2l2.9 6.26 6.85.63-5.17 4.56 1.53 6.7L12 16.6l-6.11 3.55 1.53-6.7L2.25 8.9l6.85-.63L12 2z"
    />
  </svg>
);

/**
 * Testimonials: zweilagige Banner-Headline (weiß + dunkle Schattenkopie,
 * scroll-versetzt via motion.ts [data-banner]) + 3er-Grid aus der
 * Testimonial-Collection. Initial N Karten, Rest über „Mehr laden"
 * (widgets.ts, [data-load-more]); lange Texte kürzt das Read-More-Script.
 */
export default function TestimonialsSection({
  section,
  edit,
}: {
  section: SectionTestimonials;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, loadMoreLabel, initialCount = 3, testimonials } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="reviews section"
      style={{ paddingBlock: 'var(--section-pad-large)' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="reviews__banner" aria-hidden="true" data-banner="">
        <span className="reviews__banner-line" data-banner-top="">
          {heading}
        </span>
        <span className="reviews__banner-line is-shadow" data-banner-bottom="">
          {heading}
        </span>
      </div>
      <h2 className="visually-hidden" {...edit?.(`${path}.heading`)}>
        {heading}
      </h2>
      <div className="container">
        <div className="reviews__grid" data-reviews="" data-initial-count={initialCount}>
          {testimonials.map((t, i) => (
            <article className="reviews__card" key={t.id} hidden={i >= initialCount || undefined}>
              <div>
                <div className="reviews__stars" aria-label="5 von 5 Sternen">
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </div>
                <p className="reviews__text" data-read-more="" lang="de">
                  {t.text}
                </p>
              </div>
              <div className="reviews__client">
                <Img image={t.image} sizes="3rem" />
                <div>
                  <p className="reviews__client-name">{t.name}</p>
                  {t.role && <p className="reviews__client-role">{t.role}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {testimonials.length > initialCount && (
          <div className="reviews__more">
            <button type="button" className="link-underline" data-load-more="">
              {loadMoreLabel}
              <span className="link-underline__line" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
