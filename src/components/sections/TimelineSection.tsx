import { Fragment } from 'react';
import type { SectionTimeline } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import RichText from './RichText';

/**
 * Werdegang-Timeline, Struktur 1:1 nach Webflow-Export (.section_about-timeline):
 * 1200vh-Höhen-Track → Sticky-Fenster (100vh) → „Karte" (45vw/55vh, overflow
 * clip), die per IX3 auf Fullscreen wächst, darin die 900vw-Liste mit 9
 * Stationen à 100vw, die um -800vw pant (motion/timeline.ts, Scrub 0.8).
 * Jede Station trägt die originalen data-timeline-Anker (N-year, N-text,
 * N-description, N-content-left, Station 5: 4 Letter-Spans) samt der
 * originalen Masken-Wrapper. Ohne JS/Motion (und ≤479px) rendert dieselbe
 * Struktur als vertikale Liste mit Content über abgedunkeltem Bild.
 */

type StationPattern = {
  /** Klassen-Suffix des linken/rechten Content-Blocks (Overflow-Varianten). */
  left: string;
  right: string;
  /** Masken um Jahr/Titel: 'oh' = overflow-hidden, 'dh' = div-hide (Spalte),
      'dh-open' = div-hide no-hide, 'none' = ohne Wrapper, 'combined' = Jahr+
      Titel in EINER div-hide-Maske. */
  year: 'oh' | 'dh' | 'dh-open' | 'none' | 'combined';
  title: 'oh' | 'dh' | 'icaro' | 'none' | 'combined';
  /** Jahr in einzelne Letter-Spans splitten (Station 5). */
  letters?: boolean;
  /** Welche data-timeline-Anker die IX3-Timeline dieser Station erwartet. */
  hooks: {
    contentLeft?: boolean;
    year?: boolean;
    text?: boolean;
    description?: boolean;
  };
};

/* Muster der 9 Original-Stationen (Export ueber-mich.html, wörtlich). */
const STATIONS: StationPattern[] = [
  { left: 'is-1', right: 'is-1', year: 'oh', title: 'oh', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-3-1', right: 'is-3-1', year: 'oh', title: 'oh', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-2', right: 'is-2', year: 'combined', title: 'combined', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-3', right: 'is-3', year: 'dh', title: 'dh', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-4', right: 'is-4-1', year: 'dh-open', title: 'icaro', letters: true, hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-5', right: 'is-5', year: 'dh', title: 'dh', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-6', right: 'is-6', year: 'none', title: 'none', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-7', right: 'is-7', year: 'none', title: 'none', hooks: { contentLeft: true, year: true, text: true, description: true } },
  { left: 'is-4', right: 'is-4', year: 'dh-open', title: 'icaro', hooks: { contentLeft: true, year: true, text: true, description: true } },
];

const FALLBACK: StationPattern = {
  left: 'is-1',
  right: 'is-1',
  year: 'oh',
  title: 'oh',
  hooks: {},
};

function MultilineText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

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
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="tl__head">
          <h2 {...edit?.(`${path}.heading`)}>{heading}</h2>
        </div>
      </div>
      <div className="tl__height" data-timeline-height="">
        <div className="tl__sticky">
          <div className="tl__track">
            <div className="tl__card" data-timeline-card="">
              <div className="tl__list" data-timeline-list="">
                {items.map((item, i) => {
                  const st = i < STATIONS.length ? STATIONS[i] : FALLBACK;
                  const n = i + 1;
                  const hook = (name: string, wanted?: boolean) =>
                    wanted ? { 'data-timeline': `${n}-${name}` } : {};

                  const yearEl = (
                    <p className="tl__year" {...hook('year', st.hooks.year && !st.letters)}>
                      {st.letters
                        ? item.year.split('').map((ch, li) => (
                            <span
                              key={li}
                              className="tl__letter"
                              {...(li < 4 ? { 'data-timeline': `${n}-letter-${li + 1}` } : {})}
                            >
                              {ch}
                            </span>
                          ))
                        : item.year}
                    </p>
                  );
                  const titleEl = (
                    <p
                      className={`tl__title${item.titleSmall ? ' is-small' : ''}`}
                      {...hook('text', st.hooks.text)}
                    >
                      <MultilineText text={item.title} />
                    </p>
                  );

                  let leftInner;
                  if (st.year === 'combined') {
                    leftInner = (
                      <div className="tl__mask is-col">
                        {yearEl}
                        {titleEl}
                      </div>
                    );
                  } else {
                    const yearWrapped =
                      st.year === 'none' ? (
                        yearEl
                      ) : (
                        <div
                          className={`tl__mask${st.year === 'oh' ? '' : ' is-col'}${st.year === 'dh-open' ? ' is-open' : ''}`}
                        >
                          {yearEl}
                        </div>
                      );
                    const titleWrapped =
                      st.title === 'none' ? (
                        titleEl
                      ) : st.title === 'icaro' ? (
                        <div className="tl__icaro">
                          <div className="tl__mask is-col">{titleEl}</div>
                        </div>
                      ) : (
                        <div className={`tl__mask${st.title === 'oh' ? '' : ' is-col'}`}>{titleEl}</div>
                      );
                    leftInner = (
                      <>
                        {yearWrapped}
                        {titleWrapped}
                      </>
                    );
                  }

                  return (
                    <div className="tl__item" key={item._key}>
                      <div className="tl__content">
                        <div
                          className={`tl__left ${st.left}`}
                          {...hook('content-left', st.hooks.contentLeft)}
                        >
                          {leftInner}
                        </div>
                        <div className={`tl__right ${st.right}`}>
                          <div className="tl__desc" {...hook('description', st.hooks.description)}>
                            <RichText value={item.description} paragraphs />
                          </div>
                        </div>
                      </div>
                      <div className="tl__media" data-timeline-media="">
                        <Img image={item.image} sizes="100vw" />
                        <div className="tl__overlay" aria-hidden="true" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
