import type { SectionPortraitHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { safeHref } from '../../lib/safe-href';

/**
 * Social-Icons wie im Footer: dieselben Lottie-Dateien + Größen (global-chrome
 * §6). Der Loader (Footer.astro-Script, lazy lottie-web) greift jede
 * [data-lottie-root]-Gruppe und spielt [data-lottie] beim Sichtbarwerden 1×,
 * Hover spielt neu. Instagram 2rem, LinkedIn 1.75rem - identisch zum Footer,
 * damit beide Auftritte gleich aussehen (vorher wich das LinkedIn-SVG ab).
 */
const LOTTIE: Record<'linkedin' | 'instagram', { path: string; size: string }> = {
  linkedin: { path: '/lottie/linkedin.json', size: '1.75rem' },
  instagram: { path: '/lottie/instagram.json', size: '2rem' },
};

/**
 * Über-mich-Hero: H1 + Vorstellung + Social-Icons links, Portrait (2:3) rechts.
 * Die Load-Choreografie (IX2 a-125: H1/Intro/Navbar einfahren, Whipe-Fläche
 * kollabiert per Höhe) lebt in motion/about-load.ts und greift über
 * [data-about-hero]/.ahero__intro/[data-ahero-wipe]. Die Social-Icons
 * (.ahero__socials) zieht about-load bewusst mit ein (im Original statisch).
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
                <div className="ahero__socials" data-lottie-root>
                  {socials.map((s) => {
                    const isLinkedin = s.platform === 'linkedin';
                    const lottie = isLinkedin ? LOTTIE.linkedin : LOTTIE.instagram;
                    return (
                      <a
                        key={s._key}
                        href={safeHref(s.href)}
                        className={isLinkedin ? 'is-linkedin' : 'is-instagram'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={isLinkedin ? 'LinkedIn' : 'Instagram'}
                      >
                        <span
                          className="ahero__social-icon"
                          data-lottie={lottie.path}
                          style={{ width: lottie.size, height: lottie.size }}
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })}
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
