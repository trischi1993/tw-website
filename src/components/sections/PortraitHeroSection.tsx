import type { SectionPortraitHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { safeHref } from '../../lib/safe-href';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.4 8.1h4.2V23H.4V8.1zM8.2 8.1h4v2h.06c.56-1.05 1.93-2.16 3.97-2.16 4.25 0 5.03 2.8 5.03 6.44V23h-4.2v-7.4c0-1.77-.03-4.05-2.47-4.05-2.47 0-2.85 1.93-2.85 3.92V23H8.2V8.1z" />
  </svg>
);

/**
 * Über-mich-Hero: H1 + Vorstellung + Social-Icons links, Portrait (2:3) rechts.
 * Die Load-Choreografie (IX2 a-125: H1/Intro/Navbar einfahren, Whipe-Fläche
 * kollabiert per Höhe) lebt in motion/about-load.ts und greift über
 * [data-about-hero]/.ahero__intro/[data-ahero-wipe]. Die Social-Icons
 * animieren im Original nicht (statisch).
 */
export default function PortraitHeroSection({
  section,
  edit,
}: {
  section: SectionPortraitHero;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, intro, image, socials } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="ahero"
      data-about-hero=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="ahero__inner">
          <div className="ahero__grid">
            <header className="ahero__content">
              <h1 {...edit?.(`${path}.heading`)}>{heading}</h1>
              <p className="ahero__intro" {...edit?.(`${path}.intro`)}>
                {intro}
              </p>
              {socials.length > 0 && (
                <div className="ahero__socials">
                  {socials.map((s) => (
                    <a
                      key={s._key}
                      href={safeHref(s.href)}
                      className={s.platform === 'linkedin' ? 'is-linkedin' : 'is-instagram'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                    >
                      {s.platform === 'linkedin' ? <LinkedinIcon /> : <InstagramIcon />}
                    </a>
                  ))}
                </div>
              )}
            </header>
            <div className="ahero__media">
              <Img image={image} loading="eager" sizes="(max-width: 991px) 100vw, 40vw" />
              <div className="ahero__wipe" data-ahero-wipe="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
