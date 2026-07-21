import { BP, EASE, FINE_POINTER, gsap, onMouseProgress, piecewise } from './util';

/* ---------------------------------------------------------------------------
   Galerie-Marquee ("Bekannt aus" Home = IX2 a-43, ALL-IN-ONE-Säulen = a-161):
   Maus-Parallax NUR Desktop (mq main) - der 180%-Track folgt der Maus-X-
   Position (xPercent +22 → -22, Keyframes @5/50/95 %), die Items heben/senken
   sich gegenläufig (y ∓40px). 500 ms Glättung wie IX2 (quickTo). Beim
   Verlassen bleibt der letzte Wert stehen (IX2-Verhalten). ≤991 nativer
   Overflow-Scroll (CSS).

   Hover (a-45/a-46, nur Home-Variante mit sichtbaren Titeln, mq main):
   Titel-Overlay schiebt aus der Maske hoch, Bild blur(6px) + scale 1.05.
   --------------------------------------------------------------------------- */

const TRACK_X = piecewise([
  [0.05, 22],
  [0.5, 0],
  [0.95, -22],
]);
/* Faktor auf data-shift: @5 % voller Shift, @50 % 0, @95 % invertiert. */
const ITEM_F = piecewise([
  [0.05, 1],
  [0.5, 0],
  [0.95, -1],
]);

function initParallax(root: HTMLElement): (() => void) | void {
  const track = root.querySelector<HTMLElement>('[data-marquee-track]');
  if (!track) return;
  const xTo = gsap.quickTo(track, 'xPercent', { duration: 0.5, ease: 'power2.out' });
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-marquee-item]'))
    .map((item) => ({ shift: parseFloat(item.dataset.shift ?? '0'), yTo: gsap.quickTo(item, 'y', { duration: 0.5, ease: 'power2.out' }) }))
    .filter((it) => it.shift !== 0);

  return onMouseProgress(root, (x) => {
    xTo(TRACK_X(x));
    const f = ITEM_F(x);
    items.forEach(({ shift, yTo }) => yTo(shift * f));
  });
}

function initHover(item: HTMLElement): () => void {
  const title = item.querySelector<HTMLElement>('[data-marquee-title]');
  const img = item.querySelector<HTMLElement>('img');
  if (!title || !img) return () => {};

  gsap.set(title, { yPercent: 101, opacity: 0 });

  const enter = () => {
    gsap.to(title, { yPercent: 0, duration: 0.8, ease: EASE.outQuart, overwrite: 'auto' });
    gsap.to(title, { opacity: 1, duration: 0.6, ease: EASE.ease, overwrite: 'auto' });
    gsap.to(img, { filter: 'blur(6px)', duration: 0.75, ease: EASE.ease, overwrite: 'auto' });
    gsap.to(img, { scale: 1.05, duration: 0.75, ease: EASE.outQuart, overwrite: 'auto' });
  };
  const leave = () => {
    gsap.to(img, { filter: 'blur(0px)', duration: 0.65, ease: EASE.ease, overwrite: 'auto' });
    gsap.to(img, { scale: 1, duration: 0.65, ease: EASE.outQuart, overwrite: 'auto' });
    gsap.to(title, { yPercent: 101, duration: 0.67, delay: 0.08, ease: EASE.outQuart, overwrite: 'auto' });
    gsap.to(title, { opacity: 0, duration: 0.67, delay: 0.08, ease: EASE.ease, overwrite: 'auto' });
  };

  item.addEventListener('mouseenter', enter);
  item.addEventListener('mouseleave', leave);
  return () => {
    item.removeEventListener('mouseenter', enter);
    item.removeEventListener('mouseleave', leave);
    gsap.set(title, { clearProps: 'all' });
    gsap.set(img, { clearProps: 'all' });
  };
}

export function init(mm: gsap.MatchMedia): void {
  const roots = document.querySelectorAll<HTMLElement>('[data-marquee-parallax]');
  if (!roots.length) return;

  mm.add(`${BP.main} and ${FINE_POINTER}`, () => {
    const cleanups: Array<() => void> = [];
    roots.forEach((root) => {
      const stop = initParallax(root);
      if (stop) cleanups.push(stop);
      root.querySelectorAll<HTMLElement>('[data-marquee-item]').forEach((item) => {
        if (item.querySelector('[data-marquee-title]')) cleanups.push(initHover(item));
      });
    });
    return () => cleanups.forEach((fn) => fn());
  });
}
