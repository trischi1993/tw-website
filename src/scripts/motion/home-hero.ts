import { BP, EASE, gsap, ScrollTrigger } from './util';

/* ---------------------------------------------------------------------------
   Home-Hero:
   - a-108 (nur Desktop ≥992): Die Bildspalte wächst von 40 % auf 100 %
     Breite, während der unsichtbare Trigger (100vh-300vh der Strecke) durch
     den Viewport wandert - IX2-Keyframes @0 % → @60 %, danach konstant
     (Timeline-Position 0-0.6 + Füll-Tween bis 1), Scrub-Glättung 0.5 s.
   - a-109 (alle Breakpoints, SCROLL_INTO_VIEW + loop): Scroll-Indikator - die
     Linie läuft in drei Schritten durch ihr 10rem-Fenster (Höhe 0 → 50 % → 0,
     y 0 → 5rem → 10rem, je 1 s outQuart). Der Loop startet wie Webflow erst
     nach PAGE_FINISH im sichtbaren Wrapper und pausiert außerhalb.
   --------------------------------------------------------------------------- */

export function init(mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;

  // a-108 - Breiten-Scrub der Bildspalte
  mm.add(BP.main, () => {
    const trigger = hero.querySelector<HTMLElement>('[data-hero-trigger]');
    const media = hero.querySelector<HTMLElement>('[data-hero-media]');
    if (!trigger || !media) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
    });
    tl.fromTo(media, { width: '40%' }, { width: '100%', duration: 0.6, ease: 'none' }, 0);
    tl.to({}, { duration: 0.4 }, 0.6); // Rest der Strecke: Breite bleibt 100 %

    return () => {
      gsap.set(media, { clearProps: 'width' });
    };
  });

  // a-109 - Scroll-Indikator-Loop (e-459: SCROLL_INTO_VIEW, loop=true)
  const scrollWrap = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  const line = hero.querySelector<HTMLElement>('[data-hero-scroll-line]');
  if (scrollWrap && line) {
    const loop = gsap
      .timeline({ repeat: -1, paused: true })
      // Webflow berechnet GROUP 0 bei jedem Loop neu aus dem vorherigen
      // Endzustand (height: 0, y: 10rem): Der Rueckweg nach oben bleibt damit
      // vollstaendig unsichtbar. Ein GSAP-repeat auf einem normalen `.to()`
      // wuerde hier hingegen den gespeicherten Startwert height: 100%
      // restaurieren und die Linie sichtbar nach oben schrumpfen lassen.
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

    // Webflow initialisiert SCROLL_INTO_VIEW nach readyState "complete".
    // Vorher zu starten verschiebt die Phase hinter dem 2-s-Load-Fade.
    if (document.readyState === 'complete') activate();
    else window.addEventListener('load', activate, { once: true });
  }
}
