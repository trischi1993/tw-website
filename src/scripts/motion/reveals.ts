import { EASE, gsap, onEnterOnce } from './util';

/* ---------------------------------------------------------------------------
   Generische Scroll-Entrance-Reveals (IX2, alle Breakpoints):

   - data-anim="reveal"    a-110/a-117/a-119/a-159: opacity 0→1 (ease),
                           y 1rem→0 (outQuart), blur 5→0 (ease), je 0.8 s.
                           data-delay Sek. (a-117: 0.15, a-119: 0.3),
                           data-offset % vom unteren Viewportrand (Default 16).
   - data-anim="usp-row"   a-50: [data-usp-icon] x -1rem→0, [data-usp-text]
                           x 1.5rem→0, beide opacity 0→1, 1.15 s, Offset 15.
   - data-anim="grow-line" a-41: width 0→100 %, 2 s outQuart, Offset 10.
   - data-anim="faq-item"  a-107: NUR [data-faq-top] opacity 0→1, 1.5 s ease,
                           Offset 15 (der x-Slide des Originals war ein toter
                           Verweis und existiert live nicht).

   Initialzustände ausschließlich hier per gsap.set (ohne JS bleibt alles
   sichtbar). Alle Trigger einmalig (IX2-Verhalten: kein Reset beim Verlassen).
   --------------------------------------------------------------------------- */

function initReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay ?? '') || 0;
    const offsetAttr = parseFloat(el.dataset.offset ?? '');
    const offset = Number.isFinite(offsetAttr) ? offsetAttr : 16;
    gsap.set(el, { opacity: 0, y: '1rem', filter: 'blur(5px)' });
    onEnterOnce(el, offset, () => {
      gsap.to(el, { opacity: 1, duration: 0.8, delay, ease: EASE.ease });
      gsap.to(el, { y: 0, duration: 0.8, delay, ease: EASE.outQuart });
      gsap.to(el, {
        filter: 'blur(0px)',
        duration: 0.8,
        delay,
        ease: EASE.ease,
        clearProps: 'filter',
      });
    });
  });
}

function initUspRows(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="usp-row"]').forEach((row) => {
    const icons = row.querySelectorAll('[data-usp-icon]');
    const texts = row.querySelectorAll('[data-usp-text]');
    if (!icons.length && !texts.length) return;
    gsap.set(icons, { x: '-1rem', opacity: 0 });
    gsap.set(texts, { x: '1.5rem', opacity: 0 });
    onEnterOnce(row, 15, () => {
      gsap.to([icons, texts], { x: 0, duration: 1.15, ease: EASE.outQuart });
      gsap.to([icons, texts], { opacity: 1, duration: 1.15, ease: EASE.ease });
    });
  });
}

function initGrowLines(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="grow-line"]').forEach((line) => {
    gsap.set(line, { width: '0%' });
    onEnterOnce(line, 10, () => {
      gsap.to(line, { width: '100%', duration: 2, ease: EASE.outQuart });
    });
  });
}

function initFaqItems(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="faq-item"]').forEach((item) => {
    const top = item.querySelector('[data-faq-top]');
    if (!top) return;
    gsap.set(top, { opacity: 0 });
    onEnterOnce(item, 15, () => {
      gsap.to(top, { opacity: 1, duration: 1.5, ease: EASE.ease });
    });
  });
}

export function init(_mm: gsap.MatchMedia): void {
  initReveal();
  initUspRows();
  initGrowLines();
  initFaqItems();
}
