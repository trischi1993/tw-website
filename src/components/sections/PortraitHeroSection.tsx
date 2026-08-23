import type { SectionPortraitHero } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import { safeHref } from '../../lib/safe-href';
import instagramIcon from '../../assets/images/icon-instagram.svg';
import linkedinIcon from '../../assets/images/icon-linkedin.svg';

/**
 * Social-Icons wie im Footer: dieselben Lottie-Dateien + Größen (global-chrome
 * §6). Der Loader (Footer.astro-Script, Lottie-SVG-Player) greift jede
 * [data-lottie-root]-Gruppe und spielt [data-lottie] beim Laden 1×; Hover
 * spielt neu. Wie im Webflow-Original ist Instagram 2rem und LinkedIn 1,75rem.
 */
const instagramIconSrc = typeof instagramIcon === 'string' ? instagramIcon : instagramIcon.src;
const linkedinIconSrc = typeof linkedinIcon === 'string' ? linkedinIcon : linkedinIcon.src;

const LOTTIE: Record<
  'linkedin' | 'instagram',
  { path: string; size: string; fallback: string; pixels: number }
> = {
  linkedin: {
    path: '/lottie/linkedin.json',
    size: '1.75rem',
    fallback: linkedinIconSrc,
    pixels: 28,
  },
  instagram: {
    path: '/lottie/instagram.json',
    size: '2rem',
    fallback: instagramIconSrc,
    pixels: 32,
  },
};

const EXPERIENCE_STATS = [
  { value: 150, suffix: 'M+', label: 'organische Views' },
  { value: 200, suffix: 'K+', label: 'Follower aufgebaut' },
  { value: 100, suffix: '+', label: 'Menschen unterstützt' },
  { value: 8, suffix: '+', label: 'Jahre Erfahrung' },
  { value: 4, suffix: '', label: 'eigene Marken aufgebaut' },
  { value: 3, suffix: '', label: 'Bücher veröffentlicht' },
] as const;

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
                        >
                          <img
                            className="ahero__social-fallback"
                            src={lottie.fallback}
                            alt=""
                            width={lottie.pixels}
                            height={lottie.pixels}
                            decoding="async"
                          />
                        </span>
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
          <dl className="ahero__stats" data-about-stats="">
            {EXPERIENCE_STATS.map((stat) => (
              <div className="ahero__stat" key={stat.label}>
                <dt
                  data-about-count={stat.value}
                  data-about-count-suffix={stat.suffix}
                  aria-label={`${stat.value}${stat.suffix}`}
                >
                  {stat.value}{stat.suffix}
                </dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
