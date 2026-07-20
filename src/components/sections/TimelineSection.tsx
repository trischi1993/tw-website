import { Fragment } from 'react';
import type { SectionTimeline } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import RichText from './RichText';

/**
 * Werdegang-Timeline: gepinnter horizontaler Scroll über 9 Stationen
 * (Jahr + Titel + Beschreibung über abgedunkeltem Bild). Die Pin-/Scrub-
 * Mechanik lebt in motion.ts ([data-timeline]); unter 480px (und ohne JS)
 * rendert dieselbe Struktur als vertikale Liste (sections.css).
 */
export default function TimelineSection({
  section,
  edit,
}: {
  section: SectionTimeline;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, items } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="tl"
      data-timeline=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="tl__head">
          <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
            {heading}
          </h2>
        </div>
      </div>
      <div className="tl__track" data-timeline-track="">
        <div className="tl__sticky">
          <div className="tl__window">
            <div className="tl__list" data-timeline-list="">
              {items.map((item) => (
                <div className="tl__item" key={item._key}>
                  <div className="tl__content">
                    <div className="tl__left">
                      <p className="tl__year">{item.year}</p>
                      <p className={`tl__title${item.titleSmall ? ' is-small' : ''}`}>
                        {item.title.split('\n').map((line, i) => (
                          <Fragment key={i}>
                            {i > 0 && <br />}
                            {line}
                          </Fragment>
                        ))}
                      </p>
                    </div>
                    <div className="tl__right">
                      <div className="tl__desc">
                        <RichText value={item.description} paragraphs />
                      </div>
                    </div>
                  </div>
                  <div className="tl__media">
                    <Img image={item.image} sizes="(max-width: 479px) 100vw, 45vw" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
