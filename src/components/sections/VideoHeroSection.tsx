import type { SectionVideoHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import RichText from './RichText';

/**
 * AIO-Hero: H1 + Intro + Bewerbungs-CTA links, rechts Hochkant-Video im
 * iPhone-Mockup mit Gold-Blur. Das Vimeo-Embed ist consent-gated: bis zur
 * Zustimmung Poster + kompakter Play-Button; danach lädt consent.ts den Player
 * (autoplay, muted, loop, ohne Vimeo-Controls) + Mute/Replay-Buttons (widgets.ts).
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
      data-aio-hero=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="vhero__inner">
          <div className="vhero__grid">
            <header className="vhero__content">
              <h1 data-aio-h1="" {...edit?.(`${path}.heading`)}>
                {heading}
              </h1>
              <div className="vhero__intro" data-aio-intro="" {...edit?.(`${path}.intro`)}>
                <RichText value={intro} paragraphs />
              </div>
              <div className="vhero__buttons button-group" data-aio-buttons="">
                <GlowButton label={ctaLabel} action="modal-aio" />
              </div>
            </header>
            <div className="vhero__phone" data-aio-video="">
              <Img image={mockupImage} className="vhero__mockup" loading="eager" />
              <div className="vhero__video" data-vimeo={vimeoId}>
                <Img image={posterImage} className="vhero__poster" loading="eager" />
                <div className="vhero__consent" data-vimeo-consent="">
                  <button type="button" data-vimeo-accept="" aria-label="Vimeo-Video abspielen">
                    <span className="vhero__play-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                      </svg>
                    </span>
                    <span>Video abspielen</span>
                  </button>
                  <p className="vhero__consent-note">
                    Vimeo · <a href="/datenschutz/">Datenschutz</a>
                  </p>
                </div>
              </div>
              <div className="vhero__controls" data-vimeo-controls="" hidden>
                {/* Icon-Belegung wie Original (aio-13-Script): stumm → Wellen-Icon
                    („Ton holen"), mit Ton → X-Icon. Strichstärke/Formen 1:1. */}
                <button type="button" data-action="toggle-mute" aria-label="Ton an/aus">
                  <svg data-icon="muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                    <path d="M19.07 4.92993C20.9447 6.80521 21.9979 9.34829 21.9979 11.9999C21.9979 14.6516 20.9447 17.1947 19.07 19.0699M15.54 8.45993C16.4774 9.39757 17.004 10.6691 17.004 11.9949C17.004 13.3208 16.4774 14.5923 15.54 15.5299" />
                  </svg>
                  <svg data-icon="unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }}>
                    <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                    <path d="M23 9L17 15" />
                    <path d="M17 9L23 15" />
                  </svg>
                </button>
                <button type="button" data-action="replay" aria-label="Video neu starten">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1L21 5L17 9" />
                    <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" />
                    <path d="M7 23L3 19L7 15" />
                    <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" />
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
