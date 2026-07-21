import { SplitText } from 'gsap/SplitText';
import { gsap } from './util';

gsap.registerPlugin(SplitText);

/* ---------------------------------------------------------------------------
   Zeilen-Textanimation - 1:1-Port des Webflow-Custom-Scripts (Home, Page
   Settings, "[js-line-animation]"): SplitType in Zeilen, jede Zeile fährt aus
   einer Maske von yPercent 100 → 0. Im Original nur an ZWEI Elementen:
   Hero-H1 (data-delay="1") und Value-Statement-Text (data-stagger="0.5").
   Timing wie im Original: DOMContentLoaded + 700 ms (dort der Font-Puffer;
   hier zusätzlich fonts.ready, damit mit finalen Umbrüchen gesplittet wird).
   data-replay !== "false" → bei jedem erneuten Eintritt Restart.
   --------------------------------------------------------------------------- */

const DELAY_AFTER_DOM_MS = 700;

function split(el: HTMLElement): void {
  const speed = parseFloat(el.dataset.speed ?? '') || 0.7;
  const delay = parseFloat(el.dataset.delay ?? '') || 0;
  const amount = parseFloat(el.dataset.stagger ?? '') || 0.2;
  const replay = el.dataset.replay !== 'false';

  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit: (self) => {
      gsap.set(el, { autoAlpha: 1 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom bottom',
          toggleActions: 'play none none none',
          onEnter: () => {
            if (replay) tl.restart();
          },
        },
      });
      tl.fromTo(
        self.lines,
        { yPercent: 100 },
        { yPercent: 0, duration: speed, delay, ease: 'power2.out', stagger: { amount, ease: 'none' } },
      );
      return tl;
    },
  });
}

export function init(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-anim="lines"]');
  if (!els.length) return;
  // Bis zum Split unsichtbar (nur per JS - ohne JS bleibt der Text stehen).
  gsap.set(els, { autoAlpha: 0 });

  const domReady = new Promise<void>((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  }).then(() => new Promise<void>((resolve) => setTimeout(resolve, DELAY_AFTER_DOM_MS)));

  const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

  Promise.all([domReady, fontsReady]).then(() => els.forEach(split));
}
