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

/** IX2 SCROLL_INTO_VIEW: Offset % vom unteren Viewportrand, spielt einmalig. */
export function onEnterOnce(el: Element, offsetPct: number, onEnter: () => void): void {
  ScrollTrigger.create({ trigger: el, start: `top ${100 - offsetPct}%`, once: true, onEnter });
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
