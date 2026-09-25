/* Mobile AIO-Load-Choreografie mit exakt denselben sichtbaren Timings wie
   motion/aio-load.ts. Sie läuft browsernativ, damit die Kopfzeile und der Hero
   sofort aufgebaut werden, ohne gleichzeitig das große seitenweite GSAP-
   Bundle initialisieren zu müssen. Dadurch bleibt der Menübutton während der
   wichtigen Anfangsphase reaktionsfähig. */

let runningAnimations: Animation[] = [];
let navAnimations: Animation[] = [];

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

function stopNavLoadAnimations(): void {
  navAnimations.forEach((animation) => animation.cancel());
  navAnimations = [];
}

function initAioMobileLoad(): void {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-aio-hero]');
  if (!hero || !root.classList.contains('aio-mobile-motion')) return;

  runningAnimations.forEach((animation) => animation.cancel());
  runningAnimations = [];
  navAnimations = [];

  const heading = hero.querySelector<HTMLElement>('[data-aio-h1]');
  const intro = hero.querySelector<HTMLElement>('[data-aio-intro]');
  const buttons = hero.querySelector<HTMLElement>('[data-aio-buttons]');
  const video = hero.querySelector<HTMLElement>('[data-aio-video]');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');
  const menuAlreadyOpen =
    document.querySelector<HTMLElement>('[data-nav-toggle]')?.getAttribute('aria-expanded') ===
    'true';

  [heading, intro, buttons, video, navRight].forEach((element) => {
    element?.setAttribute('data-revealed', '');
  });
  logoLines.forEach((line) => line.setAttribute('data-revealed', ''));

  logoLines.forEach((line) => {
    /* Kein offsetHeight-Read: Auf der sehr langen AIO-Seite wuerde er hier
       direkt nach dem Parsen einen synchronen Ganzseiten-Layout-Pass erzwingen
       und genau den ersten Menue-Tap blockieren. Die feste Logo-Linie sieht
       mit compositorseitigem scaleY identisch aus. */
    play(line, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
      duration: 500,
      delay: 100,
      easing: OUT_QUART,
    });
  });

  /* Ein extrem frueher Menue-Tap kann noch vor diesem Body-End-Modul kommen.
     Dann darf die Seiten-Load-Choreografie den bereits bedienten Header nicht
     nachtraeglich erneut verschieben oder ausblenden. */
  if (!menuAlreadyOpen) {
    const opacityAnimation = play(navRight, [{ opacity: 0 }, { opacity: 1 }], {
      duration: 1200,
      delay: 300,
      easing: EASE,
    });
    const transformAnimation = play(
      navRight,
      [
        { transform: 'translate3d(2.5rem, 0, 0)' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 1000, delay: 300, easing: OUT_QUART },
    );
    navAnimations = [opacityAnimation, transformAnimation].filter(
      (animation): animation is Animation => animation !== undefined,
    );
  }

  const slideIn = (element: Element | null, delay: number, opacityDuration = 750): void => {
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
  };

  slideIn(heading, 400);
  slideIn(intro, 600);
  slideIn(buttons, 1000, 500);
  play(video, [{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    delay: 1300,
    easing: EASE,
  });

  root.classList.add('motion-ready');
}

initAioMobileLoad();
document.addEventListener('astro:page-load', initAioMobileLoad);
window.addEventListener('tw:mobile-menu-open', stopNavLoadAnimations);

export {};
