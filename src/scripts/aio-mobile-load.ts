/* Mobile AIO-Hero-Choreografie mit exakt denselben sichtbaren Timings wie
   motion/aio-load.ts. Die geteilte Kopfzeile startet bereits parser-frueh im
   Header; dieses Body-End-Modul besitzt deshalb ausschliesslich den Hero. */

let runningAnimations: Animation[] = [];

const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const OUT_QUART = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

function play(
  element: Element | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | undefined {
  if (!element) return undefined;
  const animation = element.animate(keyframes, { fill: 'backwards', ...options });
  runningAnimations.push(animation);
  return animation;
}

function initAioMobileLoad(): void {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-aio-hero]');
  if (
    !hero ||
    !root.classList.contains('aio-mobile-motion') ||
    root.hasAttribute('data-aio-restore-aborted')
  ) return;

  runningAnimations.forEach((animation) => animation.cancel());
  runningAnimations = [];

  const heading = hero.querySelector<HTMLElement>('[data-aio-h1]');
  const intro = hero.querySelector<HTMLElement>('[data-aio-intro]');
  const buttons = hero.querySelector<HTMLElement>('[data-aio-buttons]');
  const video = hero.querySelector<HTMLElement>('[data-aio-video]');

  const slideIn = (element: Element | null, delay: number, opacityDuration = 750): void => {
    if (!element) return;
    play(element, [{ opacity: 0 }, { opacity: 1 }], {
      duration: opacityDuration,
      delay,
      easing: EASE,
    });
    play(
      element,
      [
        { transform: 'translate3d(2rem, 0, 0)' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 750, delay, easing: OUT_QUART },
    );
    element.setAttribute('data-revealed', '');
  };

  slideIn(heading, 400);
  slideIn(intro, 600);
  slideIn(buttons, 1000, 500);
  play(video, [{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    delay: 1300,
    easing: EASE,
  });
  video?.setAttribute('data-revealed', '');

  root.classList.add('motion-ready');
}

function abortAioMobileLoad(): void {
  runningAnimations.forEach((animation) => animation.cancel());
  runningAnimations = [];
  document.documentElement.classList.remove('motion-ready');
}

initAioMobileLoad();
document.addEventListener('astro:page-load', initAioMobileLoad);
window.addEventListener('aio:restore-aborted', abortAioMobileLoad, { once: true });

export {};
