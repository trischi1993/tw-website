import { gsap, EASE } from './util';

let responsiveNavbarAnimations: Animation[] = [];

/* ---------------------------------------------------------------------------
   E-Book-Load-Choreografie, abgeleitet vom gemeinsamen AIO-/Über-mich-Muster:
   Textblöcke kommen nacheinander von rechts, das Mockup faded zuletzt ein;
   parallel wächst die Logo-Linie und der rechte Navbar-Block fährt ein.
   Die zusätzlichen E-Book-Facts reihen sich zwischen Intro und CTA ein.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-ebook-hero]');
  if (!hero) return;

  const headings = hero.querySelectorAll<HTMLElement>('[data-ebook-heading]');
  const intros = hero.querySelectorAll<HTMLElement>('[data-ebook-intro]');
  const facts = hero.querySelector<HTMLElement>('[data-ebook-facts]');
  const buttons = hero.querySelector<HTMLElement>('[data-ebook-buttons]');
  const visual = hero.querySelector<HTMLElement>('[data-ebook-visual]');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  [...headings, ...intros, facts, buttons, visual, navRight].forEach((element) => {
    element?.setAttribute('data-revealed', '');
  });
  logoLines.forEach((line) => line.setAttribute('data-revealed', ''));

  if (headings.length) gsap.set(headings, { opacity: 0, x: '2rem' });
  if (intros.length) gsap.set(intros, { opacity: 0, x: '2rem' });
  if (facts) gsap.set(facts, { opacity: 0, x: '2rem' });
  if (buttons) gsap.set(buttons, { opacity: 0, x: '2rem' });
  if (visual) gsap.set(visual, { opacity: 0 });
  if (navRight) gsap.set(navRight, { opacity: 0, x: '2.5rem', force3D: true });

  logoLines.forEach((line) => {
    const height = line.offsetHeight;
    if (!height) return;
    gsap.fromTo(
      line,
      { height: 0 },
      { height, duration: 0.5, delay: 0.1, ease: EASE.outQuart, clearProps: 'height' },
    );
  });

  if (navRight) {
    gsap.to(navRight, { opacity: 1, duration: 1.2, delay: 0.3, ease: EASE.ease });
    gsap.to(navRight, { x: 0, duration: 1, delay: 0.3, ease: EASE.outQuart, force3D: true });
  }
  if (headings.length) {
    gsap.to(headings, { opacity: 1, duration: 0.75, delay: 0.4, ease: EASE.ease });
    gsap.to(headings, { x: 0, duration: 0.75, delay: 0.4, ease: EASE.outQuart });
  }
  if (intros.length) {
    gsap.to(intros, { opacity: 1, duration: 0.75, delay: 0.6, ease: EASE.ease });
    gsap.to(intros, { x: 0, duration: 0.75, delay: 0.6, ease: EASE.outQuart });
  }
  if (facts) {
    gsap.to(facts, { opacity: 1, duration: 0.75, delay: 0.8, ease: EASE.ease });
    gsap.to(facts, { x: 0, duration: 0.75, delay: 0.8, ease: EASE.outQuart });
  }
  if (buttons) {
    gsap.to(buttons, { opacity: 1, duration: 0.5, delay: 1, ease: EASE.ease });
    gsap.to(buttons, { x: 0, duration: 0.75, delay: 1, ease: EASE.outQuart });
  }
  if (visual) gsap.to(visual, { opacity: 1, duration: 0.5, delay: 1.3, ease: EASE.ease });
}

/** Bildet beim Wechsel zwischen Desktop-/Tablet-/Mobile-Breakpoints dieselbe
 * Navbar-Wiederholung wie auf der AIO- und Über-mich-Seite ab. */
export function restartNavbar(): void {
  if (!document.querySelector('[data-ebook-hero]')) return;
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  responsiveNavbarAnimations.forEach((animation) => animation.cancel());
  responsiveNavbarAnimations = [];

  logoLines.forEach((line) => {
    responsiveNavbarAnimations.push(line.animate(
      [{ height: '0px' }, { height: '2rem' }],
      {
        duration: 500,
        delay: 100,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: 'backwards',
      },
    ));
  });
  if (navRight) {
    responsiveNavbarAnimations.push(
      navRight.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1200,
        delay: 300,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        fill: 'backwards',
      }),
      navRight.animate(
        [{ transform: 'translate3d(2.5rem, 0, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        {
          duration: 1000,
          delay: 300,
          easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
          fill: 'backwards',
        },
      ),
    );
  }
}
