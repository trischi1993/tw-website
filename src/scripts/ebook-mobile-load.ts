/* Mobile E-Book-Load-Choreografie mit denselben Timings wie AIO/Über mich.
   Sie läuft über die browsernative Web Animations API, damit für den ersten
   sichtbaren Seitenabschnitt weder GSAP noch das große Motion-Bundle geparst
   und initialisiert werden müssen. */

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

function initEbookMobileLoad(): void {
  const hero = document.querySelector<HTMLElement>('[data-ebook-hero]');
  if (!hero || !document.documentElement.classList.contains('ebook-mobile-motion')) return;

  runningAnimations.forEach((animation) => animation.cancel());
  runningAnimations = [];
  navAnimations = [];

  const heading = hero.querySelector<HTMLElement>('[data-ebook-heading]');
  const intro = hero.querySelector<HTMLElement>('[data-ebook-intro]');
  const facts = hero.querySelector<HTMLElement>('[data-ebook-facts]');
  const buttons = hero.querySelector<HTMLElement>('[data-ebook-buttons]');
  const visual = hero.querySelector<HTMLElement>('[data-ebook-visual]');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');
  const menuAlreadyOpen =
    document.querySelector<HTMLElement>('[data-nav-toggle]')?.getAttribute('aria-expanded') ===
    'true';

  [heading, intro, facts, buttons, visual, navRight].forEach((element) => {
    element?.setAttribute('data-revealed', '');
  });
  logoLines.forEach((line) => line.setAttribute('data-revealed', ''));

  logoLines.forEach((line) => {
    const height = line.offsetHeight;
    if (!height) return;
    play(line, [{ height: '0px' }, { height: `${height}px` }], {
      duration: 500,
      delay: 100,
      easing: OUT_QUART,
    });
  });

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
  slideIn(facts, 800);
  slideIn(buttons, 1000, 500);
  play(visual, [{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    delay: 1300,
    easing: EASE,
  });

  document.documentElement.classList.add('motion-ready');
}

initEbookMobileLoad();
document.addEventListener('astro:page-load', initEbookMobileLoad);
window.addEventListener('tw:mobile-menu-open', stopNavLoadAnimations);

export {};
