import { BP, EASE, gsap, ScrollTrigger } from './util';

const DEFAULTS = {
  image: 120,
  title: 280,
  secondary: 220,
  scrub: 0.7,
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
    image: 70 / DEFAULTS.image,
    title: 170 / DEFAULTS.title,
    secondary: 130 / DEFAULTS.secondary,
    scrub: 0.5 / DEFAULTS.scrub,
  },
  mobile: {
    image: 40 / DEFAULTS.image,
    title: 80 / DEFAULTS.title,
    secondary: 60 / DEFAULTS.secondary,
    scrub: 0.3 / DEFAULTS.scrub,
  },
} satisfies Record<string, MotionProfile>;

const readNumber = (input: HTMLInputElement | null, fallback: number) => {
  const value = input?.valueAsNumber;
  return Number.isFinite(value) ? value! : fallback;
};

/**
 * Parallax-Prinzip nach nomira.ch (Referenzstand 2026-08-24):
 * - kein Pinning; der Hero scrollt normal aus dem Viewport;
 * - Trigger von `top top` bis `bottom top`, lineare Bewegung;
 * - Desktop: Bild -120 px, Titel -280 px, Begleitebene -220 px, Scrub 0,7 s;
 * - Tablet: -70 / -170 / -130 px, Scrub 0,5 s;
 * - Mobile: -40 / -80 / -60 px, Scrub 0,3 s.
 *
 * Die Desktopwerte sind im Tweak-Panel editierbar. Die kleineren Breakpoints
 * skalieren diese Werte im gleichen Verhältnis wie die Referenzseite.
 */
export function init(mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  const imageLayer = hero.querySelector<HTMLElement>('[data-hero-parallax-layer]');
  const title = hero.querySelector<HTMLElement>('.hhero__h1');
  const secondary = hero.querySelector<HTMLElement>('.hhero__buttons');
  const scrollWrap = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  if (!imageLayer || !title) return;

  const imageInput = hero.querySelector<HTMLInputElement>('[data-parallax-image]');
  const titleInput = hero.querySelector<HTMLInputElement>('[data-parallax-title]');
  const secondaryInput = hero.querySelector<HTMLInputElement>('[data-parallax-secondary]');
  const scrubInput = hero.querySelector<HTMLInputElement>('[data-parallax-scrub]');
  const imageOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-image-output]');
  const titleOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-title-output]');
  const secondaryOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-secondary-output]');
  const scrubOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-scrub-output]');
  const inputs = [imageInput, titleInput, secondaryInput, scrubInput].filter(
    (input): input is HTMLInputElement => Boolean(input),
  );

  const buildParallax = (profile: MotionProfile) => {
    const state = { progress: 0 };
    const getValues = () => ({
      image: readNumber(imageInput, DEFAULTS.image) * profile.image,
      title: readNumber(titleInput, DEFAULTS.title) * profile.title,
      secondary: readNumber(secondaryInput, DEFAULTS.secondary) * profile.secondary,
      scrub: readNumber(scrubInput, DEFAULTS.scrub) * profile.scrub,
    });
    const updateOutputs = () => {
      const values = getValues();
      if (imageOutput) imageOutput.textContent = `−${Math.round(values.image)} px`;
      if (titleOutput) titleOutput.textContent = `−${Math.round(values.title)} px`;
      if (secondaryOutput) secondaryOutput.textContent = `−${Math.round(values.secondary)} px`;
      if (scrubOutput) scrubOutput.textContent = `${values.scrub.toFixed(1).replace('.', ',')} s`;
    };
    const apply = () => {
      const values = getValues();
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
      duration: getValues().scrub,
      ease: 'none',
      onUpdate: apply,
    });
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        progressTo.tween.duration(Math.max(0.1, getValues().scrub));
        progressTo(self.progress);
      },
    });

    const onInput = () => {
      updateOutputs();
      apply();
    };
    inputs.forEach((input) => input.addEventListener('input', onInput));
    state.progress = trigger.progress;
    updateOutputs();
    apply();

    return () => {
      inputs.forEach((input) => input.removeEventListener('input', onInput));
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
