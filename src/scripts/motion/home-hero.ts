import { BP, EASE, gsap, ScrollTrigger } from './util';

const DEFAULTS = {
  image: 40,
  title: 220,
  secondary: 160,
  scrub: 0.45,
  dim: 20,
} as const;

type MotionProfile = {
  image: number;
  title: number;
  secondary: number;
  scrub: number;
  dim: number;
};

const PROFILES = {
  desktop: { image: 1, title: 1, secondary: 1, scrub: 1, dim: 1 },
  tablet: {
    image: 25 / DEFAULTS.image,
    title: 130 / DEFAULTS.title,
    secondary: 100 / DEFAULTS.secondary,
    scrub: 0.35 / DEFAULTS.scrub,
    dim: 0,
  },
  mobile: {
    image: 15 / DEFAULTS.image,
    title: 60 / DEFAULTS.title,
    secondary: 45 / DEFAULTS.secondary,
    scrub: 0.2 / DEFAULTS.scrub,
    dim: 0,
  },
} satisfies Record<string, MotionProfile>;

const readNumber = (input: HTMLInputElement | null, fallback: number) => {
  const value = input?.valueAsNumber;
  return Number.isFinite(value) ? value! : fallback;
};

const formatSeconds = (value: number) =>
  value.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

/**
 * Reduzierter Cinematic-Hold-Parallax:
 * - kein Pinning; der Hero scrollt normal aus dem Viewport;
 * - der Bildrahmen bleibt bei 48 %, ohne horizontale Öffnung und ohne Zoom;
 * - Desktop: Bild -40 px, Titel -220 px, Begleitebene -160 px, Scrub 0,45 s;
 * - die Bildabdunklung setzt erst im letzten Teil der Übergabe ein;
 * - Tablet und Mobile behalten ihre vollbreite Bildlogik ohne Abdunklung.
 *
 * Die Desktopwerte sind im Tweak-Panel editierbar. Die kleineren Breakpoints
 * skalieren die Parallaxwege zurückhaltend und reagieren direkter auf Scroll.
 */
export function init(mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  const imageLayer = hero.querySelector<HTMLElement>('[data-hero-parallax-layer]');
  const dimLayer = hero.querySelector<HTMLElement>('[data-hero-wipe]');
  const title = hero.querySelector<HTMLElement>('.hhero__h1');
  const secondary = hero.querySelector<HTMLElement>('.hhero__buttons');
  const scrollWrap = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  if (!imageLayer || !dimLayer || !title) return;

  const imageInput = hero.querySelector<HTMLInputElement>('[data-parallax-image]');
  const titleInput = hero.querySelector<HTMLInputElement>('[data-parallax-title]');
  const secondaryInput = hero.querySelector<HTMLInputElement>('[data-parallax-secondary]');
  const scrubInput = hero.querySelector<HTMLInputElement>('[data-parallax-scrub]');
  const dimInput = hero.querySelector<HTMLInputElement>('[data-parallax-dim]');
  const imageOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-image-output]');
  const titleOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-title-output]');
  const secondaryOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-secondary-output]');
  const scrubOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-scrub-output]');
  const dimOutput = hero.querySelector<HTMLOutputElement>('[data-parallax-dim-output]');
  const inputs = [imageInput, titleInput, secondaryInput, scrubInput, dimInput].filter(
    (input): input is HTMLInputElement => Boolean(input),
  );

  const buildParallax = (profile: MotionProfile) => {
    const state = { progress: 0 };
    const getValues = () => ({
      image: readNumber(imageInput, DEFAULTS.image) * profile.image,
      title: readNumber(titleInput, DEFAULTS.title) * profile.title,
      secondary: readNumber(secondaryInput, DEFAULTS.secondary) * profile.secondary,
      scrub: readNumber(scrubInput, DEFAULTS.scrub) * profile.scrub,
      dim: readNumber(dimInput, DEFAULTS.dim) * profile.dim,
    });
    const updateOutputs = () => {
      const values = getValues();
      if (imageOutput) imageOutput.textContent = `−${Math.round(values.image)} px`;
      if (titleOutput) titleOutput.textContent = `−${Math.round(values.title)} px`;
      if (secondaryOutput) secondaryOutput.textContent = `−${Math.round(values.secondary)} px`;
      if (scrubOutput) scrubOutput.textContent = `${formatSeconds(values.scrub)} s`;
      if (dimOutput) {
        dimOutput.textContent = profile.dim ? `${Math.round(values.dim)} %` : 'nur Desktop';
      }
    };
    const apply = () => {
      const values = getValues();
      const handoffProgress = gsap.utils.clamp(0, 1, (state.progress - 0.35) / 0.5);
      gsap.set(imageLayer, { y: -state.progress * values.image, force3D: true });
      gsap.set(title, { y: -state.progress * values.title, force3D: true });
      gsap.set(dimLayer, { opacity: handoffProgress * (values.dim / 100) });
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
      dimLayer.style.removeProperty('opacity');
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
