import { BP, EASE, gsap, ScrollTrigger } from './util';

const DEFAULT_INTENSITY = 55;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Alternative Startseiten-Variante:
 * - Der Bildrahmen bleibt an seiner rechten Position und verändert weder
 *   Breite noch horizontale Position.
 * - Nur der größere Bildinhalt bewegt sich dezent entgegen der Scrollrichtung
 *   durch den Rahmen. Die Strecke ist in Pixeln begrenzt, damit der Effekt auf
 *   sehr breiten Bildschirmen nicht proportional zur Bildhöhe eskaliert.
 * - Ein Proxy-Tween liefert GSAPs geglätteten Scroll-Fortschritt; die
 *   Intensität wird bei jedem Frame aus dem sichtbaren Tweak-Regler gelesen.
 * - Mobile nutzt denselben Effekt auf der normal scrollenden Bildfläche.
 */
export function init(mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  const trigger = hero.querySelector<HTMLElement>('[data-hero-trigger]');
  const media = hero.querySelector<HTMLElement>('[data-hero-media]');
  const layer = hero.querySelector<HTMLElement>('[data-hero-parallax-layer]');
  const content = hero.querySelector<HTMLElement>('.hhero__content');
  const tweak = hero.querySelector<HTMLElement>('[data-parallax-tweak]');
  const input = hero.querySelector<HTMLInputElement>('[data-parallax-input]');
  const output = hero.querySelector<HTMLOutputElement>('[data-parallax-output]');
  if (!media || !layer) return;

  const getIntensity = () =>
    clamp(Number(input?.value || DEFAULT_INTENSITY), 0, 100) / 100;
  const updateOutput = () => {
    if (output) output.textContent = `${Math.round(getIntensity() * 100)} %`;
  };
  updateOutput();

  const buildParallax = ({
    scrollTrigger,
    travelPx,
    moveContent,
  }: {
    scrollTrigger: HTMLElement;
    travelPx: number;
    moveContent: boolean;
  }) => {
    const state = { progress: 0 };

    const apply = () => {
      const intensity = getIntensity();
      const imageY = (0.5 - state.progress) * travelPx * intensity;
      gsap.set(layer, {
        y: imageY,
        scale: 1 + intensity * 0.012,
        force3D: true,
      });

      if (moveContent && content) {
        gsap.set(content, {
          yPercent: state.progress * -7 * intensity,
          opacity: 1 - Math.max(0, state.progress - 0.62) * 1.55,
          force3D: true,
        });
      }
      if (moveContent && tweak) {
        gsap.set(tweak, {
          opacity: 1 - Math.max(0, state.progress - 0.72) * 2.4,
        });
      }
    };

    const animation = gsap.to(state, {
      progress: 1,
      paused: true,
      ease: 'none',
      onUpdate: apply,
    });
    const scrub = ScrollTrigger.create({
      trigger: scrollTrigger,
      start: moveContent ? 'top top' : 'top bottom',
      end: moveContent ? 'bottom bottom' : 'bottom top',
      animation,
      scrub: 0.55,
    });

    const onInput = () => {
      updateOutput();
      apply();
    };
    input?.addEventListener('input', onInput);
    apply();

    return () => {
      input?.removeEventListener('input', onInput);
      scrub.kill();
      animation.kill();
      layer.style.removeProperty('transform');
      content?.style.removeProperty('transform');
      content?.style.removeProperty('opacity');
      tweak?.style.removeProperty('opacity');
    };
  };

  mm.add(BP.main, () => {
    if (!trigger) return;
    return buildParallax({ scrollTrigger: trigger, travelPx: 96, moveContent: true });
  });

  mm.add(BP.belowMain, () =>
    buildParallax({ scrollTrigger: media, travelPx: 64, moveContent: false }),
  );

  // Scroll-Indikator-Loop aus der Live-Startseite.
  const scrollWrap = hero.querySelector<HTMLElement>('[data-hero-scroll]');
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
