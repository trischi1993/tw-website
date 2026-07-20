import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

/* ---------------------------------------------------------------------------
   Lenis smooth scrolling - DESKTOP ONLY.
   A precise, hovering pointer on a wide viewport is the desktop signal; tablets
   and phones (touch, ≤1024px) keep native scrolling and never even download the
   library (dynamic import below). Lenis starts/stops live on viewport changes,
   and is wired into GSAP's ticker so ScrollTrigger (reveals + parallax) stays in
   sync. Honours prefers-reduced-motion by staying off entirely.
   --------------------------------------------------------------------------- */

const DESKTOP = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

let lenis: Lenis | null = null;
let raf: ((time: number) => void) | null = null;

async function start() {
  if (lenis) return;
  const Lenis = (await import('lenis')).default;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

  // Drive Lenis from GSAP's ticker and keep ScrollTrigger updated on every frame.
  lenis.on('scroll', ScrollTrigger.update);
  raf = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();
}

function stop() {
  if (!lenis) return;
  if (raf) gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
  raf = null;
  gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
  ScrollTrigger.refresh();
}

export function initSmoothScroll() {
  // Reduced-motion users get plain native scrolling.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mq = window.matchMedia(DESKTOP);
  const sync = () => (mq.matches ? start() : stop());
  sync();
  mq.addEventListener('change', sync);
}
