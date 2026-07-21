import { EASE, gsap } from './util';

/* ---------------------------------------------------------------------------
   Über-mich-Load-Choreografie - IX2 a-125 (PAGE_START, alle Breakpoints).
   Initialzustände + Ablauf exakt aus dem Decode:
   - Logo-Linie: height 0 → auto (delay 100, 500 ms outQuart)
   - Navbar rechts: opacity 0→1 (300/1200 ease), x 2.5rem→0 (300/1000 outQuart)
   - H1: opacity 0→1 (400/750 ease), x 2rem→0 (400/750 outQuart)
   - Intro-P: x 2rem→0 + opacity (600/750)
   - Portrait-Whipe: height 100 %→0 (1200/2000 outQuart), width bleibt 100 %
   Die Social-Icons (.hero_button-group) animieren im Original auf dieser
   Seite NICHT (das Element-Target der ActionList existiert nur auf der
   AIO-Seite) - sie bleiben statisch.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-about-hero]');
  if (!hero) return;

  const h1 = hero.querySelector<HTMLElement>('h1');
  const intro = hero.querySelector<HTMLElement>('.ahero__intro');
  const wipe = hero.querySelector<HTMLElement>('[data-ahero-wipe]');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  if (logoLines.length) {
    gsap.from(logoLines, {
      height: 0,
      duration: 0.5,
      delay: 0.1,
      ease: EASE.outQuart,
      clearProps: 'height',
    });
  }
  if (navRight) {
    gsap.set(navRight, { opacity: 0, x: '2.5rem' });
    gsap.to(navRight, { opacity: 1, duration: 1.2, delay: 0.3, ease: EASE.ease });
    gsap.to(navRight, { x: 0, duration: 1, delay: 0.3, ease: EASE.outQuart });
  }
  if (h1) {
    gsap.set(h1, { opacity: 0, x: '2rem' });
    gsap.to(h1, { opacity: 1, duration: 0.75, delay: 0.4, ease: EASE.ease });
    gsap.to(h1, { x: 0, duration: 0.75, delay: 0.4, ease: EASE.outQuart });
  }
  if (intro) {
    gsap.set(intro, { opacity: 0, x: '2rem' });
    gsap.to(intro, { x: 0, duration: 0.75, delay: 0.6, ease: EASE.outQuart });
    gsap.to(intro, { opacity: 1, duration: 0.75, delay: 0.6, ease: EASE.ease });
  }
  if (wipe) {
    // CSS-Basis ist bereits width/height 100 % (Initialzustand der ActionList).
    gsap.to(wipe, { height: 0, duration: 2, delay: 1.2, ease: EASE.outQuart });
  }
}
