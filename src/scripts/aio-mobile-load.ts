/* Mobile AIO-Load-Choreografie mit exakt denselben sichtbaren Timings wie
   motion/aio-load.ts. Sie läuft browsernativ, damit die Kopfzeile und der Hero
   sofort aufgebaut werden, ohne gleichzeitig das große seitenweite GSAP-
   Bundle initialisieren zu müssen. Dadurch bleibt der Menübutton während der
   wichtigen Anfangsphase reaktionsfähig. */

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
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');
  const menuAlreadyOpen =
    document.querySelector<HTMLElement>('[data-nav-toggle]')?.getAttribute('aria-expanded') ===
    'true';

  logoLines.forEach((line) => {
    /* Originale Webflow-Geometrie: height-Reveal statt des zwischenzeitlich
       verwendeten scaleY. Die kanonische 2-rem-Zielhoehe vermeidet dabei den
       frueheren offsetHeight-Read samt synchronem Ganzseiten-Layout. */
    play(line, [{ height: '0rem' }, { height: '2rem' }], {
      duration: 500,
      delay: 100,
      easing: OUT_QUART,
    });
    line.setAttribute('data-revealed', '');
  });

  /* Ein extrem frueher Menue-Tap kann noch vor diesem Body-End-Modul kommen.
     Dann darf die Seiten-Load-Choreografie den bereits bedienten Header nicht
     nachtraeglich erneut verschieben oder ausblenden. */
  if (!menuAlreadyOpen) {
    play(navRight, [{ opacity: 0 }, { opacity: 1 }], {
      duration: 1200,
      delay: 300,
      easing: EASE,
    });
    play(
      navRight,
      [
        { transform: 'translate3d(2.5rem, 0, 0)' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 1000, delay: 300, easing: OUT_QUART },
    );
  }
  navRight?.setAttribute('data-revealed', '');

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
