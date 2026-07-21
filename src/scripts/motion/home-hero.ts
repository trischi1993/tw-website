import { BP, EASE, gsap } from './util';

/* ---------------------------------------------------------------------------
   Home-Hero:
   - a-108 (nur Desktop ≥992): Die Bildspalte wächst von 40 % auf 100 %
     Breite, während der unsichtbare Trigger (100vh-300vh der Strecke) durch
     den Viewport wandert - IX2-Keyframes @0 % → @60 %, danach konstant
     (Timeline-Position 0-0.6 + Füll-Tween bis 1), Scrub-Glättung 0.5 s.
   - a-109 (alle Breakpoints, loop): Scroll-Indikator - die Linie läuft in
     drei Schritten durch ihr 10rem-Fenster (Höhe 0 → 50 % → 0, y 0 → 5rem →
     10rem, je 1 s outQuart) und wiederholt endlos.
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

  // a-109 - Scroll-Indikator-Loop
  const line = hero.querySelector<HTMLElement>('[data-hero-scroll-line]');
  if (line) {
    gsap
      .timeline({ repeat: -1 })
      .to(line, { height: '0%', y: 0, duration: 1, ease: EASE.outQuart }, 0)
      .to(line, { height: '50%', y: '5rem', duration: 1, ease: EASE.outQuart }, 1)
      .to(line, { height: '0%', y: '10rem', duration: 1, ease: EASE.outQuart }, 2);
  }
}
