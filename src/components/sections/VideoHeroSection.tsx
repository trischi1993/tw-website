import type { SectionVideoHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import RichText from './RichText';

/**
 * AIO-Hero: H1 + Intro + Bewerbungs-CTA links, rechts Hochkant-Video im
 * iPhone-Mockup mit Gold-Blur. Das Vimeo-Embed ist consent-gated: bis zur
 * Zustimmung Poster + Hinweis; danach lädt consent.ts den Player (autoplay,
 * muted, loop, ohne Controls) + Mute/Replay-Buttons (widgets.ts).
 */
export default function VideoHeroSection({
  section,
  edit,
}: {
  section: SectionVideoHero;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, intro, ctaLabel, vimeoId, mockupImage, posterImage } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="vhero"
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="vhero__inner">
          <div className="vhero__grid">
            <header className="vhero__content">
              <h1 data-anim="lines" data-delay="0.4" {...edit?.(`${path}.heading`)}>
                {heading}
              </h1>
              <div className="vhero__intro" data-anim="reveal-up" data-delay="0.6" {...edit?.(`${path}.intro`)}>
                <RichText value={intro} paragraphs />
              </div>
              <div className="vhero__buttons button-group" data-anim="reveal-x" data-delay="0.8">
                <GlowButton label={ctaLabel} action="modal-aio" />
              </div>
            </header>
            <div className="vhero__phone">
              <Img image={mockupImage} className="vhero__mockup" loading="eager" />
              <div className="vhero__video" data-vimeo={vimeoId}>
                <Img image={posterImage} className="vhero__poster" loading="eager" />
                <div className="vhero__consent" data-vimeo-consent="">
                  <p>
                    Dieses Video wird von Vimeo geladen. Mit dem Abspielen akzeptierst du die
                    Übertragung von Daten an Vimeo.
                  </p>
                  <button type="button" data-vimeo-accept="">
                    Video laden
                  </button>
                </div>
              </div>
              <div className="vhero__controls" data-vimeo-controls="" hidden>
                <button type="button" data-action="toggle-mute" aria-label="Ton an/aus">
                  <svg data-icon="muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                    <line x1="22" y1="9" x2="16" y2="15" />
                  </svg>
                  <svg data-icon="unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" hidden>
                    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                </button>
                <button type="button" data-action="replay" aria-label="Video neu starten">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <polyline points="3 4 3 9 8 9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
