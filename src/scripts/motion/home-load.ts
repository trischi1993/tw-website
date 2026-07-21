import { EASE, gsap } from './util';

/* ---------------------------------------------------------------------------
   Home-Load-Choreografie - IX2 a-105 (PAGE_FINISH, alle Breakpoints, nur
   Startseite): Navbar baut sich auf (Goldlinie wächst, Wortmarke fährt hinter
   ihr zusammen, rechter Bereich blendet ein), dann Hero-Buttons, dann gibt
   die Wipe-Fläche das Titelbild frei, zuletzt der Scroll-Indikator.
   Initialzustände sofort beim Motion-Init (sonst blitzt der Content),
   Abspielen erst bei window 'load' - exakt wie das Webflow-PAGE_FINISH.
   Ziel-Selektoren: .button-group ist wie im Original ein Seiten-Selektor
   (trifft Hero- UND Split-CTA-Buttons der Startseite).
   --------------------------------------------------------------------------- */

const LOGO_LINE_HEIGHT = '2rem'; // Header.astro: .navbar__logo-line { height: 2rem }

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  const buttonGroups = document.querySelectorAll<HTMLElement>('.button-group');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const logoText1 = document.querySelectorAll<HTMLElement>('[data-nav-logo-text="1"]');
  const logoText2 = document.querySelectorAll<HTMLElement>('[data-nav-logo-text="2"]');
  const navRight = document.querySelectorAll<HTMLElement>('[data-nav-right]');
  const wipe = hero.querySelectorAll<HTMLElement>('[data-hero-wipe]');
  const scrollWrap = hero.querySelectorAll<HTMLElement>('[data-hero-scroll]');

  // GROUP 0 - Initialzustände (im Original als Inline-Styles gebacken)
  gsap.set(buttonGroups, { opacity: 0, x: 40 });
  gsap.set(logoLines, { height: 0 });
  gsap.set(logoText1, { xPercent: 140 });
  gsap.set(logoText2, { xPercent: -140 });
  gsap.set(navRight, { opacity: 0, x: '2.5rem' });
  gsap.set(wipe, { width: '100%', height: '100%' });
  gsap.set(scrollWrap, { opacity: 0 });

  const play = () => {
    // GROUP 1 - Delays/Dauern/Easings exakt aus a-105
    gsap.to(logoLines, {
      height: LOGO_LINE_HEIGHT,
      duration: 0.5,
      ease: EASE.outQuart,
      clearProps: 'height',
    });
    gsap.to(logoText1, { xPercent: 0, delay: 0.2, duration: 1, ease: EASE.outQuart });
    gsap.to(logoText2, { xPercent: 0, delay: 0.2, duration: 1, ease: EASE.outQuart });
    gsap.to(navRight, { opacity: 1, delay: 0.2, duration: 1.2, ease: EASE.ease });
    gsap.to(navRight, { x: 0, delay: 0.2, duration: 1, ease: EASE.outQuart });
    gsap.to(buttonGroups, { opacity: 1, delay: 1, duration: 1.1, ease: EASE.ease });
    gsap.to(buttonGroups, { x: 0, delay: 1, duration: 1, ease: EASE.outQuart });
    gsap.to(wipe, { width: '100%', height: 0, delay: 1.3, duration: 2, ease: EASE.outQuart });
    gsap.to(scrollWrap, { opacity: 1, delay: 2, duration: 0.7, ease: EASE.outQuart });
  };

  if (document.readyState === 'complete') {
    play();
  } else {
    window.addEventListener('load', play, { once: true });
  }
}
