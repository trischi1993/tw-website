import { gsap, EASE } from './util';

/* ---------------------------------------------------------------------------
   AIO-Seite, Load-Choreo - IX2 a-142 (PAGE_START, alle Breakpoints):
   H1/Intro/Buttons kommen nacheinander von rechts (x 2rem), das Video-Mockup
   faded zuletzt ein; parallel wächst die Logo-Linie und der rechte
   Navbar-Block fährt ein. KEINE Logo-Text-Slides (die hat nur die Home).
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-aio-hero]');
  if (!hero) return;

  const h1 = hero.querySelector('[data-aio-h1]');
  const intro = hero.querySelector('[data-aio-intro]');
  const buttons = hero.querySelector('[data-aio-buttons]');
  const video = hero.querySelector('[data-aio-video]');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector('[data-nav-right]');

  // Initialzustände (IX2 GROUP 0)
  if (h1) gsap.set(h1, { opacity: 0, x: '2rem' });
  if (intro) gsap.set(intro, { opacity: 0, x: '2rem' });
  if (buttons) gsap.set(buttons, { opacity: 0, x: '2rem' });
  if (video) gsap.set(video, { opacity: 0 });
  if (navRight) gsap.set(navRight, { opacity: 0, x: '2.5rem' });

  // Logo-Linie: height 0 → natürliche Höhe (IX2 "AUTO"; vorher messen).
  logoLines.forEach((line) => {
    const h = line.offsetHeight;
    if (!h) return;
    gsap.fromTo(line, { height: 0 }, { height: h, duration: 0.5, delay: 0.1, ease: EASE.outQuart, clearProps: 'height' });
  });

  if (navRight) {
    gsap.to(navRight, { opacity: 1, duration: 1.2, delay: 0.3, ease: EASE.ease });
    gsap.to(navRight, { x: 0, duration: 1, delay: 0.3, ease: EASE.outQuart });
  }
  if (h1) {
    gsap.to(h1, { opacity: 1, duration: 0.75, delay: 0.4, ease: EASE.ease });
    gsap.to(h1, { x: 0, duration: 0.75, delay: 0.4, ease: EASE.outQuart });
  }
  if (intro) {
    gsap.to(intro, { x: 0, duration: 0.75, delay: 0.6, ease: EASE.outQuart });
    gsap.to(intro, { opacity: 1, duration: 0.75, delay: 0.6, ease: EASE.ease });
  }
  if (buttons) {
    gsap.to(buttons, { x: 0, duration: 0.75, delay: 1, ease: EASE.outQuart });
    gsap.to(buttons, { opacity: 1, duration: 0.5, delay: 1, ease: EASE.ease });
  }
  if (video) gsap.to(video, { opacity: 1, duration: 0.5, delay: 1.3, ease: EASE.ease });
}
