import { EASE, gsap, onEnterOnce } from './util';

let responsiveNavbarAnimations: Animation[] = [];

/* ---------------------------------------------------------------------------
   Über-mich-Load-Choreografie - IX2 a-125 (PAGE_START, alle Breakpoints).
   Initialzustände + Ablauf exakt aus dem Decode:
   - Logo-Linie: height 0 → auto (delay 100, 500 ms outQuart)
   - Navbar rechts: opacity 0→1 (300/1200 ease), x 2.5rem→0 (300/1000 outQuart)
   - H1: opacity 0→1 (400/750 ease), x 2rem→0 (400/750 outQuart)
   - Intro-P: x 2rem→0 + opacity (600/750)
   - Kennzahlen: Reveal + zeitversetzte Zaehler beim ersten Sichtbarwerden
   - Portrait-Whipe: height 100 %→0 (1200/2000 outQuart), width bleibt 100 %
   Die Social-Icons (.ahero__socials) animiert das Original NICHT - hier ziehen
   wir sie aber bewusst mit ein (delay 0.8), sonst wären sie beim Pageload das
   EINZIGE sichtbare Hero-Element, während H1/Intro/Nav noch versteckt sind.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-about-hero]');
  if (!hero) return;

  const h1 = hero.querySelector<HTMLElement>('h1');
  const intro = hero.querySelector<HTMLElement>('.ahero__intro');
  const wipe = hero.querySelector<HTMLElement>('[data-ahero-wipe]');
  const socials = hero.querySelector<HTMLElement>('.ahero__socials');
  const stats = hero.querySelector<HTMLElement>('[data-about-stats]');
  const counters = Array.from(hero.querySelectorAll<HTMLElement>('[data-about-count]'));
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  // Pre-Paint-Hide (global.css) VOR den gsap-Aufrufen abschalten - synchron,
  // ohne Paint dazwischen. So misst gsap.from die NATÜRLICHE Logo-Linienhöhe
  // (mit aktiver height:0-Regel wäre sie 0 → keine Animation). Siehe home-load.
  [h1, intro, socials, stats, navRight].forEach((el) => el?.setAttribute('data-revealed', ''));
  logoLines.forEach((el) => el.setAttribute('data-revealed', ''));

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
    gsap.set(navRight, { opacity: 0, x: '2.5rem', force3D: true });
    gsap.to(navRight, { opacity: 1, duration: 1.2, delay: 0.3, ease: EASE.ease });
    gsap.to(navRight, { x: 0, duration: 1, delay: 0.3, ease: EASE.outQuart, force3D: true });
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
  if (socials) {
    // Bewusste Abweichung vom Original (dort statisch): sonst sind die Icons das
    // einzige sichtbare Hero-Element, bis der Rest einblendet. Reiht sich nach
    // dem Intro ein (delay 0.8), gleiche x-Slide-Charakteristik.
    gsap.set(socials, { opacity: 0, x: '2rem' });
    gsap.to(socials, { x: 0, duration: 0.75, delay: 0.8, ease: EASE.outQuart });
    gsap.to(socials, { opacity: 1, duration: 0.75, delay: 0.8, ease: EASE.ease });
  }
  if (stats) {
    gsap.set(stats, { opacity: 0, y: '1rem' });
    counters.forEach((counter) => {
      counter.textContent = `0${counter.dataset.aboutCountSuffix ?? ''}`;
    });

    onEnterOnce(stats, 10, () => {
      gsap.to(stats, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: EASE.outQuart,
      });

      counters.forEach((counter, index) => {
        const target = Number(counter.dataset.aboutCount);
        if (!Number.isFinite(target) || target < 0) return;

        const suffix = counter.dataset.aboutCountSuffix ?? '';
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.4,
          delay: index * 0.08,
          ease: EASE.outQuart,
          onUpdate: () => {
            counter.textContent = `${Math.min(target, Math.round(state.value))}${suffix}`;
          },
          onComplete: () => {
            counter.textContent = `${target}${suffix}`;
          },
        });
      });
    });
  }
  if (wipe) {
    // CSS-Basis ist bereits width/height 100 % (Initialzustand der ActionList).
    gsap.to(wipe, { height: 0, duration: 2, delay: 1.2, ease: EASE.outQuart });
  }
}

/** Webflow spielt PAGE_START nach einem Media-Key-Wechsel erneut ab. Die
 * browsernative Animation bildet nur die Navbar-Timings nach und weckt dabei
 * nicht GSAPs ScrollTrigger-Cache; Hero und Portrait bleiben unberührt. */
export function restartNavbar(): void {
  if (!document.querySelector('[data-about-hero]')) return;
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
