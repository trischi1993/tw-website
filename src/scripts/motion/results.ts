import { BP, gsap } from './util';

/* ---------------------------------------------------------------------------
   Zahlen & Fakten - IX2 a-139 (main+medium) / a-140 (small+tiny),
   SCROLLING_IN_VIEW auf .results_ix-trigger (unteres 100vh-Fenster der
   erweiterten Scroll-Strecke): Die sechs Karten fliegen mit ueberlappenden,
   gleichmaessig getakteten Bewegungen nach oben aus dem Stapel. So bleibt der
   Uebergang von den bisherigen vier zu den zwei neuen Karten durchgehend
   fliessend. Parallel fliesst eine zusammenhaengende Titelrolle vom Start der
   ersten Karte bis in die letzten beiden Karten gleichmaessig nach links:
   „meiner Accounts“ kommt dabei organisch von rechts ins Bild und bleibt am
   Ende lange genug voll lesbar. Die gemeinsame Rolle bleibt beim Vor- und
   Zurueckscrollen exakt synchron.
   CSS-Basis: ab Karte 2 jeweils weitere 3deg Rotation.
   --------------------------------------------------------------------------- */

type Key = [at: number, dur: number, rot: [number, number], x: [string, string], y: [string, string]];

const DESKTOP: Key[] = [
  [0, 20, [0, -30], ['0vw', '-10vw'], ['0vh', '-100vh']],
  [12, 20, [3, 40], ['0vw', '15vw'], ['0vh', '-100vh']],
  [24, 20, [6, -30], ['0vw', '-10vw'], ['0vh', '-100vh']],
  [36, 20, [9, 40], ['0vw', '15vw'], ['0vh', '-100vh']],
  [48, 20, [12, -30], ['0vw', '-10vw'], ['0vh', '-100vh']],
  [60, 20, [15, 40], ['0vw', '15vw'], ['0vh', '-100vh']],
];

const MOBILE: Key[] = [
  [0, 19, [0, -10], ['0vw', '0vw'], ['0vh', '-120vh']],
  [12, 19, [3, 20], ['0vw', '0vw'], ['0vh', '-120vh']],
  [24, 19, [6, -10], ['0vw', '0vw'], ['0vh', '-120vh']],
  [36, 19, [9, 20], ['0vw', '0vw'], ['0vh', '-120vh']],
  [48, 19, [12, -10], ['0vw', '0vw'], ['0vh', '-120vh']],
  [60, 19, [15, 20], ['0vw', '0vw'], ['0vh', '-120vh']],
];

/* In flachen Handy-Viewports erscheint der Folgeabschnitt schon nach rund
   56-58 % der Results-Strecke. Deshalb endet die letzte Karte hier bewusst
   vor diesem Punkt, statt noch ueber die naechste Ueberschrift zu laufen. */
const LANDSCAPE: Key[] = [
  [0, 13, [0, -30], ['0vw', '-10vw'], ['0vh', '-110vh']],
  [7, 13, [3, 40], ['0vw', '15vw'], ['0vh', '-110vh']],
  [14, 13, [6, -30], ['0vw', '-10vw'], ['0vh', '-110vh']],
  [21, 13, [9, 40], ['0vw', '15vw'], ['0vh', '-110vh']],
  [28, 13, [12, -30], ['0vw', '-10vw'], ['0vh', '-110vh']],
  [35, 13, [15, 40], ['0vw', '15vw'], ['0vh', '-110vh']],
];

export function init(mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('[data-results]').forEach((root) => {
    const trigger = root.querySelector<HTMLElement>('[data-results-trigger]');
    const stack = Array.from(
      root.querySelectorAll<HTMLElement>('[data-results-card]'),
    );
    const titleReels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-results-title-reel]'),
    );
    const hasSecondTitleRow = Boolean(
      root.querySelector<HTMLElement>('[data-results-title-row="1"]'),
    );
    if (!trigger || stack.length === 0) return;

    const build = (keys: Key[], scrub: number | boolean = 0.5) => () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub,
        },
      });
      keys.slice(0, stack.length).forEach(([at, dur, rot, x, y], i) => {
        tl.fromTo(
          stack[i],
          { rotation: rot[0], x: x[0], y: y[0] },
          { rotation: rot[1], x: x[1], y: y[1], duration: dur },
          at,
        );
      });
      if (titleReels.length > 0 && hasSecondTitleRow) {
        tl.fromTo(
          titleReels,
          { xPercent: 0 },
          { xPercent: -50, duration: 52 },
          0,
        );
      }
      // Keyframes sind % der Trigger-Reise → Timeline auf 100 Einheiten strecken.
      tl.set({}, {}, 100);
    };

    mm.add(`${BP.mainMedium} and (min-height: 481px)`, build(DESKTOP));
    mm.add(`${BP.smallTiny} and (min-height: 481px)`, build(MOBILE));
    // Im Querformat muss die Bewegung unmittelbar dem Finger folgen. Ein
    // geglaetteter Scrub wuerde die letzte Karte bei schnellen Wischgesten
    // noch kurz in den bereits sichtbaren Folgeabschnitt nachlaufen lassen.
    mm.add('(max-height: 480px)', build(LANDSCAPE, true));
  });
}
