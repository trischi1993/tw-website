import { gsap } from './util';

/* ---------------------------------------------------------------------------
   Testimonial-Banner-Scrub (IX2 a-120, index + AIO, alle Breakpoints):
   Während die Reviews-Section durch den Viewport wandert, schieben sich die
   beiden Headline-Ebenen gegenläufig - Keyframes @0 %/@95 % der Strecke,
   ab 95 % konstant. IX2-Glättung 500 ms → scrub 0.5.
     [data-banner-top]    xPercent  10 → -12
     [data-banner-bottom] xPercent  -6 →  11
   Trigger ist die Section selbst ([data-banner] am Section-Root).
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('[data-banner]').forEach((section) => {
    const top = section.querySelector('[data-banner-top]');
    const bottom = section.querySelector('[data-banner-bottom]');
    if (!top && !bottom) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
    });
    if (top) tl.fromTo(top, { xPercent: 10 }, { xPercent: -12, duration: 95, ease: 'none' }, 0);
    if (bottom) tl.fromTo(bottom, { xPercent: -6 }, { xPercent: 11, duration: 95, ease: 'none' }, 0);
    tl.to({}, { duration: 5 }, 95); // Haltephase 95-100 % (IX2 klemmt dort)
  });
}
