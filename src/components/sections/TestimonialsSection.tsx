import type { SectionTestimonials } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { contentShell } from './shell';

const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      opacity=".3"
      fill="currentColor"
      d="M12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
    />
    <path
      fill="currentColor"
      d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
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
  const shell = contentShell(section, { top: 'large', bottom: 'large' });

  return (
    <section
      id={anchor || undefined}
      className={`reviews ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      data-banner=""
      {...edit?.(path)}
    >
      <div className="reviews__banner" aria-hidden="true">
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
            <button type="button" className="link-underline" data-load-more="" data-underline="">
              <span className="link-underline__label">{loadMoreLabel}</span>
              <span className="link-underline__line" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
