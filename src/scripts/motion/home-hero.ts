import { BP, EASE, gsap, ScrollTrigger } from './util';

const DEFAULTS = {
  image: 40,
  title: 220,
  secondary: 160,
  scrub: 0.45,
} as const;

type MotionProfile = {
  image: number;
  title: number;
  secondary: number;
  scrub: number;
};

const PROFILES = {
  desktop: { image: 1, title: 1, secondary: 1, scrub: 1 },
  tablet: {
    image: 25 / DEFAULTS.image,
    title: 130 / DEFAULTS.title,
    secondary: 100 / DEFAULTS.secondary,
    scrub: 0.35 / DEFAULTS.scrub,
  },
  mobile: {
    image: 15 / DEFAULTS.image,
    title: 60 / DEFAULTS.title,
    secondary: 45 / DEFAULTS.secondary,
    scrub: 0.2 / DEFAULTS.scrub,
  },
} satisfies Record<string, MotionProfile>;

/**
 * Reduzierter Cinematic-Hold-Parallax:
 * - kein Pinning; der Hero scrollt normal aus dem Viewport;
 * - der Bildrahmen bleibt bei 48 %, ohne horizontale Öffnung und ohne Zoom;
 * - Desktop: Bild -40 px, Titel -220 px, Begleitebene -160 px, Scrub 0,45 s;
 * - Tablet und Mobile behalten ihre vollbreite Bildlogik.
 * Die kleineren Breakpoints skalieren die Parallaxwege zurückhaltend und
 * reagieren direkter auf Scroll.
 */
export function init(mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  const imageLayer = hero.querySelector<HTMLElement>('[data-hero-parallax-layer]');
  const title = hero.querySelector<HTMLElement>('.hhero__h1');
  const secondary = hero.querySelector<HTMLElement>('.hhero__buttons');
  const scrollWrap = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  if (!imageLayer || !title) return;

  const buildParallax = (profile: MotionProfile) => {
    const state = { progress: 0 };
    const values = {
      image: DEFAULTS.image * profile.image,
      title: DEFAULTS.title * profile.title,
      secondary: DEFAULTS.secondary * profile.secondary,
      scrub: DEFAULTS.scrub * profile.scrub,
    };
    const apply = () => {
      gsap.set(imageLayer, { y: -state.progress * values.image, force3D: true });
      gsap.set(title, { y: -state.progress * values.title, force3D: true });
      if (secondary) {
        gsap.set(secondary, { y: -state.progress * values.secondary, force3D: true });
      }
      if (scrollWrap) {
        gsap.set(scrollWrap, { y: -state.progress * values.secondary, force3D: true });
      }
    };

    const progressTo = gsap.quickTo(state, 'progress', {
      duration: values.scrub,
      ease: 'none',
      onUpdate: apply,
    });
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        progressTo(self.progress);
      },
    });

    state.progress = trigger.progress;
    apply();

    return () => {
      trigger.kill();
      progressTo.tween.kill();
      imageLayer.style.removeProperty('transform');
      title.style.removeProperty('transform');
      secondary?.style.removeProperty('transform');
      scrollWrap?.style.removeProperty('transform');
    };
  };

  mm.add(BP.main, () => buildParallax(PROFILES.desktop));
  mm.add(BP.medium, () => buildParallax(PROFILES.tablet));
  mm.add(BP.small, () => buildParallax(PROFILES.mobile));
  mm.add(BP.tiny, () => buildParallax(PROFILES.mobile));

  // Scroll-Indikator-Loop aus der Live-Startseite.
  const line = hero.querySelector<HTMLElement>('[data-hero-scroll-line]');
  if (scrollWrap && line) {
    const loop = gsap
      .timeline({ repeat: -1, paused: true })
      .fromTo(
        line,
        { height: '0%', y: '10rem' },
        { height: '0%', y: 0, duration: 1, ease: EASE.outQuart },
        0,
      )
      .to(line, { height: '50%', y: '5rem', duration: 1, ease: EASE.outQuart }, 1)
      .to(line, { height: '0%', y: '10rem', duration: 1, ease: EASE.outQuart }, 2);

    const activate = () => {
      ScrollTrigger.create({
        trigger: scrollWrap,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => loop.restart(),
        onEnterBack: () => loop.restart(),
        onLeave: () => loop.pause(),
        onLeaveBack: () => loop.pause(),
      });
    };

    if (document.readyState === 'complete') activate();
    else window.addEventListener('load', activate, { once: true });
  }
}
