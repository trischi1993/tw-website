import { gsap, EASE, onEnterOnce } from './util';

/* ---------------------------------------------------------------------------
   Modul-Sections der AIO-Seite (5× Modul + „Deine Resultate").

   - IX2 a-71 (SCROLLING_IN_VIEW, alle mq): Wort-Banner-Track fährt über die
     Reise des Modul-Teils durch den Viewport von x 0 auf -20rem (Scrub,
     500 ms Glättung). Trigger ist NUR der Modul-Teil (.module__pad,
     entspricht section_process-step - ohne den 1:1-Coaching-Anhang).
   - IX2 a-75 (SCROLL_INTO_VIEW, alle mq; Offset je Modul im Markup):
     Titelzeile - Text aus der Maske hoch (y 101 %→0, 850 ms inOutQuart),
     Linie von links (x -101 %→0, 750 ms outQuart, +250 ms), Nummer von
     rechts (x 101 %→0, 600 ms inOutQuart, +600 ms).
   Die Listen-/Bild-Reveals der Module stampft die Komponente als
   data-anim="reveal" (motion/reveals.ts).
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  // a-75 - Titel-Choreo
  document.querySelectorAll<HTMLElement>('[data-module-title]').forEach((row) => {
    const offset = parseFloat(row.dataset.offset ?? '16');
    const text = row.querySelectorAll('[data-module-title-text]');
    const line = row.querySelectorAll('[data-module-title-line]');
    const num = row.querySelectorAll('[data-module-title-number]');

    if (text.length) gsap.set(text, { yPercent: 101 });
    if (line.length) gsap.set(line, { xPercent: -101 });
    if (num.length) gsap.set(num, { xPercent: 101 });

    onEnterOnce(row, offset, () => {
      if (text.length) gsap.to(text, { yPercent: 0, duration: 0.85, ease: EASE.inOutQuart });
      if (line.length) gsap.to(line, { xPercent: 0, duration: 0.75, delay: 0.25, ease: EASE.outQuart });
      if (num.length) gsap.to(num, { xPercent: 0, duration: 0.6, delay: 0.6, ease: EASE.inOutQuart });
    });
  });

  // a-71 - Banner-Scrub
  document.querySelectorAll<HTMLElement>('[data-module-scrub]').forEach((part) => {
    const track = part.querySelector('[data-module-banner-track]');
    if (!track) return;
    gsap.fromTo(
      track,
      { x: 0 },
      {
        x: '-20rem',
        ease: 'none',
        scrollTrigger: { trigger: part, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
      },
    );
  });
}
