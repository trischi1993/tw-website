import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

/* ---------------------------------------------------------------------------
   Gemeinsame Grundlagen aller Motion-Module. Quelle: IX2-/IX3-Datensatz des
   Webflow-Exports (Decode siehe Scratchpad wf-scripts/ix2-relevant.txt).
   --------------------------------------------------------------------------- */

/* Webflow-IX2-Easings → GSAP. "ease"/"easeInOut" sind die CSS-Bezierkurven,
   die Penner-Namen (outQuart …) sind mathematisch identisch mit GSAPs
   power-Skala (Quart = power3, Quint = power4). Leerstring = linear. */
CustomEase.create('wfEase', '0.25,0.1,0.25,1');
CustomEase.create('wfEaseInOut', '0.42,0,0.58,1');

export const EASE = {
  linear: 'none',
  ease: 'wfEase',
  easeInOut: 'wfEaseInOut',
  outSine: 'sine.out',
  outQuart: 'power3.out',
  inOutQuart: 'power3.inOut',
  outQuint: 'power4.out',
} as const;

/* Webflow-Breakpoints: main ≥992, medium 768–991, small 480–767, tiny ≤479. */
export const BP = {
  main: '(min-width: 992px)',
  medium: '(min-width: 768px) and (max-width: 991px)',
  small: '(min-width: 480px) and (max-width: 767px)',
  tiny: '(max-width: 479px)',
  mainMedium: '(min-width: 768px)',
  belowMain: '(max-width: 991px)',
  smallTiny: '(max-width: 767px)',
  notTiny: '(min-width: 480px)',
} as const;

export const FINE_POINTER = '(hover: hover) and (pointer: fine)';

const ENTER_ONCE_CHECK_EVENT = 'lp:enter-once-check';

/** Prüft noch nicht ausgelöste IX2-Entrances erneut, sobald ein mobiler
 * Viewport nach einer Drehung seine endgültigen Maße erreicht hat. */
export function refreshEnterOnce(): void {
  window.dispatchEvent(new Event(ENTER_ONCE_CHECK_EVENT));
}

/**
 * IX2 SCROLL_INTO_VIEW: Der um den Offset verkleinerte Viewport wird aus
 * BEIDEN Scrollrichtungen betreten. Die Action spielt pro Initialisierung nur
 * einmal. Die automatische Erstprüfung wartet bis readyState `complete`, damit
 * ein Reload mitten auf der Seite zuerst seine Scrollposition restaurieren
 * kann. Scroll-/Viewport-Ereignisse werden aber sofort beobachtet und ein
 * bereits vorhandener Scrollstand wird direkt geprüft: Scrollt der Nutzer
 * schon während große Bilder, Videos oder das Motion-Bundle laden, bleiben
 * sichtbare Inhalte nicht bis zum vollständigen `window.load` versteckt.
 */
export interface EnterOnceTrigger {
  kill(): void;
}

export function onEnterOnce(
  el: Element,
  offsetPct: number,
  onEnter: () => void,
): EnterOnceTrigger {
  let stopped = false;
  let cleanup = () => {};

  const enter = () => {
    if (stopped) return;
    stopped = true;
    cleanup();
    onEnter();
  };
  const controller: EnterOnceTrigger = {
    kill: () => {
      if (stopped) return;
      stopped = true;
      cleanup();
    },
  };

  const start = () => {
    if (stopped) return;

    let frame: number | undefined;
    const check = () => {
      frame = undefined;
      const bounds = el.getBoundingClientRect();
      // Webflow verwendet documentElement.clientHeight/clientWidth, nicht den
      // auf iOS während einer Drehung zeitweise abweichenden innerHeight-Wert.
      const viewport = document.documentElement;
      const inset = viewport.clientHeight * (offsetPct / 100);
      if (
        bounds.left <= viewport.clientWidth &&
        bounds.right >= 0 &&
        bounds.top <= viewport.clientHeight - inset &&
        bounds.bottom >= inset
      ) {
        enter();
      }
    };
    const queueCheck = () => {
      if (frame !== undefined || stopped) return;
      frame = requestAnimationFrame(check);
    };
    const onReadyStateChange = () => {
      if (document.readyState !== 'complete') return;
      document.removeEventListener('readystatechange', onReadyStateChange);
      queueCheck();
    };
    cleanup = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      document.removeEventListener('readystatechange', onReadyStateChange);
      window.removeEventListener('scroll', queueCheck);
      window.removeEventListener('resize', queueCheck);
      window.removeEventListener('orientationchange', queueCheck);
      window.removeEventListener(ENTER_ONCE_CHECK_EVENT, queueCheck);
    };
    window.addEventListener('scroll', queueCheck, { passive: true });
    window.addEventListener('resize', queueCheck, { passive: true });
    window.addEventListener('orientationchange', queueCheck, { passive: true });
    window.addEventListener(ENTER_ONCE_CHECK_EVENT, queueCheck);
    if (document.readyState === 'complete' || window.scrollY > 0) queueCheck();
    else document.addEventListener('readystatechange', onReadyStateChange);
  };

  start();

  return controller;
}

/**
 * IX2-Continuous-Keyframes (SCROLL_PROGRESS/MOUSE_X/MOUSE_Y): stückweise
 * lineare Interpolation über [0..1]; außerhalb der Stützstellen geklemmt.
 * stops: [[position 0..1, wert], …] aufsteigend.
 */
export function piecewise(stops: Array<[number, number]>): (p: number) => number {
  return (p) => {
    if (p <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [p1, v1] = stops[i];
      const [p0, v0] = stops[i - 1];
      if (p <= p1) return v0 + ((p - p0) / (p1 - p0)) * (v1 - v0);
    }
    return stops[stops.length - 1][1];
  };
}

/**
 * IX2 MOUSE_MOVE: Fortschritt 0..1 der Mausposition relativ zum Element
 * (X und Y), an quickTo-Setter weitergereicht (500 ms Glättung wie IX2).
 * Rückgabe: Cleanup.
 */
export function onMouseProgress(
  el: HTMLElement,
  apply: (x: number, y: number) => void,
  reset?: () => void,
): () => void {
  const move = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    apply(x, y);
  };
  const leave = () => reset?.();
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
  return () => {
    el.removeEventListener('mousemove', move);
    el.removeEventListener('mouseleave', leave);
  };
}

export { gsap, ScrollTrigger };
