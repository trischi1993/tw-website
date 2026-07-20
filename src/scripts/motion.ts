import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll } from './smooth-scroll';

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------------
   Site-wide scroll motion: section reveals + image parallax.
   Progressive enhancement - if JS or motion is off, everything is already
   visible (initial states are only set here, in JS).
   --------------------------------------------------------------------------- */

const REVEAL_FROM = { opacity: 0, y: 30 };
const REVEAL_TO = { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' };

function initReveals() {
  // Staggered groups first, so their children aren't double-bound.
  const groups = gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]');
  const claimed = new Set<HTMLElement>();

  groups.forEach((group) => {
    const items = gsap.utils.toArray<HTMLElement>(
      group.querySelectorAll(':scope > [data-reveal], :scope [data-reveal-item]'),
    );
    if (!items.length) return;
    items.forEach((i) => claimed.add(i));
    gsap.set(items, REVEAL_FROM);
    ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () => gsap.to(items, { ...REVEAL_TO, stagger: 0.1 }),
    });
  });

  const singles = gsap.utils
    .toArray<HTMLElement>('[data-reveal]')
    .filter((el) => !claimed.has(el));

  singles.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay ?? '0');
    gsap.set(el, REVEAL_FROM);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => gsap.to(el, { ...REVEAL_TO, delay }),
    });
  });
}

function initParallax() {
  const items = gsap.utils.toArray<HTMLElement>('[data-parallax]');
  items.forEach((el) => {
    // Clamp to the overscan budget in Figure (.is-parallax media = 120% / -10%).
    const intensity = Math.min(parseFloat(el.dataset.parallax ?? '8'), 8);
    const container = el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -intensity },
      {
        yPercent: intensity,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
}

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  initReveals();
  initParallax();
  initSmoothScroll(); // desktop-only Lenis, wired into the ScrollTrigger ticker

  // Re-measure once webfonts have swapped (they shift layout heights).
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

if (document.readyState !== 'loading') init();
else window.addEventListener('DOMContentLoaded', init);
