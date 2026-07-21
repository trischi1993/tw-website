import { BP, gsap } from './util';

/* ---------------------------------------------------------------------------
   Zahlen & Fakten - IX2 a-139 (main+medium) / a-140 (small+tiny),
   SCROLLING_IN_VIEW auf .results_ix-trigger (unteres 100vh-Fenster der
   200vh-Strecke): Die vier Karten fliegen NACHEINANDER nach oben aus dem
   Stapel (Rotation + x/y), Keyframes in % der Trigger-Reise. Die Titel-Ebenen
   sind statisch. CSS-Basis: card-2/3/4 mit rotate 3/6/9deg.
   --------------------------------------------------------------------------- */

type Key = [at: number, dur: number, rot: [number, number], x: [string, string], y: [string, string]];

const DESKTOP: Key[] = [
  [0, 15, [0, -30], ['0vw', '-10vw'], ['0vh', '-100vh']],
  [15, 20, [3, 40], ['0vw', '15vw'], ['0vh', '-100vh']],
  [35, 15, [6, -30], ['0vw', '-10vw'], ['0vh', '-100vh']],
  [50, 20, [9, 40], ['0vw', '15vw'], ['0vh', '-100vh']],
];

const MOBILE: Key[] = [
  [0, 15, [0, -10], ['0vw', '0vw'], ['0vh', '-120vh']],
  [15, 15, [3, 20], ['0vw', '0vw'], ['0vh', '-120vh']],
  [30, 15, [6, -10], ['0vw', '0vw'], ['0vh', '-120vh']],
  [45, 15, [9, 20], ['0vw', '0vw'], ['0vh', '-120vh']],
];

export function init(mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('[data-results]').forEach((root) => {
    const trigger = root.querySelector<HTMLElement>('[data-results-trigger]');
    const cards = [1, 2, 3, 4].map((n) =>
      root.querySelector<HTMLElement>(`[data-results-card="${n}"]`),
    );
    if (!trigger || cards.some((c) => !c)) return;
    const stack = cards as HTMLElement[];

    const build = (keys: Key[]) => () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
      });
      keys.forEach(([at, dur, rot, x, y], i) => {
        tl.fromTo(
          stack[i],
          { rotation: rot[0], x: x[0], y: y[0] },
          { rotation: rot[1], x: x[1], y: y[1], duration: dur },
          at,
        );
      });
      // Keyframes sind % der Trigger-Reise → Timeline auf 100 Einheiten strecken.
      tl.set({}, {}, 100);
    };

    mm.add(BP.mainMedium, build(DESKTOP));
    mm.add(BP.smallTiny, build(MOBILE));
  });
}
