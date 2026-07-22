import { gsap, BP, FINE_POINTER, onMouseProgress } from './util';

/* ---------------------------------------------------------------------------
   Glow-Follow — IX2 a-141 (.button-glow) und a-160 (AIO-Säulen-Karten):
   Der geblurte Glow-Kreis ([data-glow-circle]) folgt der Maus innerhalb des
   [data-glow]-Containers: MOUSE_X/Y 0..1 → xPercent/yPercent -50…+50,
   Glättung 500 ms (quickTo, power2.out — der Smoothing-Ease der Webflow-
   Runtime). Nur Desktop (mq main) + feiner Pointer. Beim Verlassen kehrt
   der Glow in die MITTE zurück (headless am Original nachgemessen: die
   Runtime tweent Continuous-Parameter beim Mouse-Out auf den Startwert).
   --------------------------------------------------------------------------- */

export function init(mm: gsap.MatchMedia): void {
  if (!document.querySelector('[data-glow]')) return;

  mm.add(`${BP.main} and ${FINE_POINTER}`, () => {
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
      const circle = el.querySelector<HTMLElement>('[data-glow-circle]');
      if (!circle) return;
      const xTo = gsap.quickTo(circle, 'xPercent', { duration: 0.5, ease: 'power2.out' });
      const yTo = gsap.quickTo(circle, 'yPercent', { duration: 0.5, ease: 'power2.out' });
      cleanups.push(
        onMouseProgress(
          el,
          (x, y) => {
            xTo(-50 + 100 * x);
            yTo(-50 + 100 * y);
          },
          () => {
            xTo(0);
            yTo(0);
          },
        ),
      );
      cleanups.push(() => gsap.set(circle, { clearProps: 'xPercent,yPercent' }));
    });
    return () => cleanups.forEach((fn) => fn());
  });
}
