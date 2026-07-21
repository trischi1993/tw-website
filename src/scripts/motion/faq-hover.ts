import { BP, EASE, FINE_POINTER, gsap } from './util';

/* ---------------------------------------------------------------------------
   FAQ-Hover (IX2 a-52/a-53, nur Desktop ≥992 + feiner Pointer):
   - Whipe-Fläche ([data-faq-whipe], 6.8em hoch, hinter der Fragezeile) fährt
     von yPercent 101 → 0 (0.6 s outQuart), beim Verlassen zurück; display
     wird erst nach dem Ausfahren wieder entfernt (Original: delay 600 ms).
   - Plus-Icon ([data-faq-icon]) x 0 → -4em, Frage ([data-faq-question])
     x 0 → +4em, je 0.8 s outQuart, zurück beim Verlassen.
   Der Klick-/Accordion-Teil (a-54/55/101/102) lebt funktional in widgets.ts.
   --------------------------------------------------------------------------- */

export function init(mm: gsap.MatchMedia): void {
  const items = document.querySelectorAll<HTMLElement>('[data-anim="faq-item"]');
  if (!items.length) return;

  mm.add(`${BP.main} and ${FINE_POINTER}`, () => {
    const cleanups: Array<() => void> = [];

    items.forEach((item) => {
      const whipe = item.querySelector<HTMLElement>('[data-faq-whipe]');
      const icon = item.querySelector<HTMLElement>('[data-faq-icon]');
      const question = item.querySelector<HTMLElement>('[data-faq-question]');

      const enter = () => {
        if (whipe) {
          whipe.hidden = false;
          gsap.set(whipe, { yPercent: 101, overwrite: 'auto' });
          gsap.to(whipe, { yPercent: 0, duration: 0.6, ease: EASE.outQuart });
        }
        if (icon) gsap.to(icon, { x: '-4em', duration: 0.8, ease: EASE.outQuart });
        if (question) gsap.to(question, { x: '4em', duration: 0.8, ease: EASE.outQuart });
      };
      const leave = () => {
        if (whipe) {
          gsap.to(whipe, {
            yPercent: 101,
            duration: 0.6,
            ease: EASE.outQuart,
            onComplete: () => {
              whipe.hidden = true;
            },
          });
        }
        if (icon) gsap.to(icon, { x: 0, duration: 0.8, ease: EASE.outQuart });
        if (question) gsap.to(question, { x: 0, duration: 0.8, ease: EASE.outQuart });
      };

      item.addEventListener('mouseenter', enter);
      item.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        item.removeEventListener('mouseenter', enter);
        item.removeEventListener('mouseleave', leave);
        if (whipe) {
          whipe.hidden = true;
          gsap.set(whipe, { clearProps: 'transform' });
        }
        if (icon) gsap.set(icon, { clearProps: 'transform' });
        if (question) gsap.set(question, { clearProps: 'transform' });
      });
    });

    return () => cleanups.forEach((fn) => fn());
  });
}
