import type { SectionInterests } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import { contentShell } from './shell';

const ReisenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" />
  </svg>
);
const WeiterbildungIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M12 4 2 9l10 5 10-5-10-5z" />
    <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
  </svg>
);

/**
 * Interessen: H2 links, 2 Highlight-Items rechts, darunter zwei endlose
 * CSS-Wort-Marquees (22s linear, Reihe 2 rückwärts — 1:1 wie das Original,
 * dort ebenfalls ein CSS-Embed; die IX2-Marquee-Listen sind tote Verweise).
 * Reveals: Grid a-110 (offset 12), Marquee-Blöcke a-117 (delay 0.15, offset 0).
 */
export default function InterestsSection({
  section,
  edit,
}: {
  section: SectionInterests;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, introLine, highlights, marquee1, marquee2 } = section;
  const path = `sections[_key=="${_key}"]`;

  const row = (words: string[]) => (
    <div className="marquee__row">
      {words.map((w, i) => (
        <span className="marquee__word" key={i}>
          {w}
        </span>
      ))}
    </div>
  );

  const shell = contentShell(section, { top: 'large', bottom: 'large' });

  return (
    <section
      id={anchor || undefined}
      className={`interests ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="interests__grid" data-anim="reveal" data-offset="12">
          <h2 {...edit?.(`${path}.heading`)}>{heading}</h2>
          <div className="interests__right">
            {introLine && (
              <p className="interests__intro" {...edit?.(`${path}.introLine`)}>
                {introLine}
              </p>
            )}
            <div className="interests__items">
              {highlights.map((h) => (
                <div className="interests__item" key={h._key}>
                  <span className="interests__item-icon">
                    {h.icon === 'weiterbildung' ? <WeiterbildungIcon /> : <ReisenIcon />}
                  </span>
                  <div>
                    <h3>{h.title}</h3>
                    <p>{h.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {marquee1.length > 0 && (
        <div className="marquee" data-anim="reveal" data-delay="0.15" data-offset="0" aria-hidden="true">
          {row(marquee1)}
          {row(marquee1)}
        </div>
      )}
      {marquee2.length > 0 && (
        <div
          className="marquee is-reverse"
          data-anim="reveal"
          data-delay="0.15"
          data-offset="0"
          aria-hidden="true"
        >
          {row(marquee2)}
          {row(marquee2)}
        </div>
      )}
    </section>
  );
}
