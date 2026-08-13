import { EASE, gsap, onEnterOnce, type EnterOnceTrigger } from './util';

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

const root = document.documentElement;
const initialHashTarget = (() => {
  if (!root.classList.contains('has-initial-hash')) return null;
  const raw = (root.dataset.initialHash ?? window.location.hash).slice(1);
  if (!raw) return null;

  try {
    return document.getElementById(decodeURIComponent(raw));
  } catch {
    return document.getElementById(raw);
  }
})();

// Beim direkten Einstieg in den Erfolgs-Check werden nur dessen eigene Reveals
// bis nach der Anker-Stabilisierung zurückgehalten. Die nachfolgende FAQ nutzt
// bewusst denselben normalen Triggerpfad wie die FAQ der All-In-One-Seite.
const initialStaticScopes = initialHashTarget ? [initialHashTarget] : [];
let initialHashSettled = !root.classList.contains('has-initial-hash');
if (!initialHashSettled) {
  window.addEventListener(
    'lp:initial-hash-ready',
    () => {
      initialHashSettled = true;
    },
    { once: true },
  );
}

function belongsToInitialHashScopes(element: Element): boolean {
  return initialStaticScopes.some((scope) => scope.contains(element));
}

const triggers: EnterOnceTrigger[] = [];
const pendingHashListeners: Array<() => void> = [];
// FAQ a-107 ist pro Seitenaufruf einmalig: Bereits eingeblendete Zeilen bleiben
// bei einem responsiven Neuaufbau sichtbar. Noch nie gezeigte Zeilen behalten
// ihren Trigger und werden geprüft, falls sie im neuen Format sichtbar werden.
const revealedFaqItems = new WeakSet<HTMLElement>();
let initialized = false;

function onEnterOnceStable(el: Element, offset: number, onEnter: () => void): void {
  // Nach Abschluss der initialen Fragmentnavigation ist dieser Sonderpfad
  // verbraucht. Das ist wichtig, wenn ein Orientierungswechsel die Reveals
  // später neu initialisiert: Dann existiert das ready-Event nicht nochmals.
  if (
    initialHashSettled ||
    !root.classList.contains('has-initial-hash') ||
    !belongsToInitialHashScopes(el)
  ) {
    triggers.push(onEnterOnce(el, offset, onEnter));
    return;
  }

  const onHashReady = () => {
    const bounds = el.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const inset = viewportHeight * (offset / 100);

    if (bounds.top <= viewportHeight - inset && bounds.bottom >= inset) {
      onEnter();
      return;
    }

    triggers.push(onEnterOnce(el, offset, onEnter));
  };

  window.addEventListener('lp:initial-hash-ready', onHashReady, { once: true });
  pendingHashListeners.push(() => window.removeEventListener('lp:initial-hash-ready', onHashReady));
}

function initReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay ?? '') || 0;
    const durationAttr = parseFloat(el.dataset.duration ?? '');
    const duration = Number.isFinite(durationAttr) ? durationAttr : 0.8;
    const offsetAttr = parseFloat(el.dataset.offset ?? '');
    const offset = Number.isFinite(offsetAttr) ? offsetAttr : 16;
    const isHeroReveal = Boolean(el.closest('.ebook-hero'));
    gsap.set(el, isHeroReveal
      ? { opacity: 0, y: '1rem', force3D: true, willChange: 'transform, opacity' }
      : { opacity: 0, y: '1rem', filter: 'blur(5px)' });
    const reveal = () => {
      gsap.to(el, { opacity: 1, duration, delay, ease: EASE.ease });
      gsap.to(el, {
        y: 0,
        duration,
        delay,
        ease: EASE.outQuart,
        force3D: isHeroReveal,
        clearProps: isHeroReveal ? 'transform,willChange' : undefined,
      });
      if (isHeroReveal) return;
      gsap.to(el, {
        filter: 'blur(0px)',
        duration,
        delay,
        ease: EASE.ease,
        clearProps: 'filter',
      });
    };

    // Eager-Hero-Elemente starten bewusst mit der Ladechoreografie statt erst
    // beim Scroll-Eintritt. So bleibt die gestaffelte Animation ruhig, während
    // schnelles Scrollen das Mockup nicht nahezu unsichtbar passieren lässt.
    if (el.hasAttribute('data-reveal-eager')) reveal();
    else onEnterOnceStable(el, offset, reveal);
  });
}

function initUspRows(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="usp-row"]').forEach((row) => {
    const icons = row.querySelectorAll('[data-usp-icon]');
    const texts = row.querySelectorAll('[data-usp-text]');
    if (!icons.length && !texts.length) return;
    gsap.set(icons, { x: '-1rem', opacity: 0 });
    gsap.set(texts, { x: '1.5rem', opacity: 0 });
    triggers.push(
      onEnterOnce(row, 15, () => {
        gsap.to([icons, texts], {
          x: 0,
          duration: 1.15,
          ease: EASE.outQuart,
        });
        gsap.to([icons, texts], {
          opacity: 1,
          duration: 1.15,
          ease: EASE.ease,
        });
      }),
    );
  });
}

function initGrowLines(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="grow-line"]').forEach((line) => {
    gsap.set(line, { width: '0%' });
    triggers.push(
      onEnterOnce(line, 10, () => {
        gsap.to(line, { width: '100%', duration: 2, ease: EASE.outQuart });
      }),
    );
  });
}

function initFaqItems(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="faq-item"]').forEach((item) => {
    const top = item.querySelector<HTMLElement>('[data-faq-top]');
    if (!top) return;

    if (revealedFaqItems.has(item)) {
      gsap.set(top, { opacity: 1 });
      return;
    }

    gsap.set(top, { opacity: 0 });
    triggers.push(
      onEnterOnce(item, 15, () => {
        revealedFaqItems.add(item);
        gsap.to(top, { opacity: 1, duration: 1.5, ease: EASE.ease });
      }),
    );
  });
}

function build(): void {
  pendingHashListeners.splice(0).forEach((remove) => remove());
  triggers.splice(0).forEach((trigger) => trigger.kill());

  // Laufende oder bereits beendete Callback-Tweens gehören nicht automatisch
  // zu ihrem ScrollTrigger. Vor dem Neuaufbau stoppen; die FAQ-Funktion hält
  // bereits abgespielte Zeilen dabei bewusst sichtbar.
  const targets = document.querySelectorAll<HTMLElement>(
    '[data-anim="reveal"], [data-usp-icon], [data-usp-text], ' +
      '[data-anim="grow-line"], [data-faq-top]',
  );
  gsap.killTweensOf(targets);

  initReveal();
  initUspRows();
  initGrowLines();
  initFaqItems();
}

export function init(_mm: gsap.MatchMedia): void {
  initialized = true;
  build();
}

/** Webflow initialisiert seine IX2-Entrance-Events nach einem Breakpoint- bzw.
 * Orientierungswechsel neu. Generische Reveals starten neu; die einmaligen
 * FAQ-Zeilen behalten ihren sichtbaren Zustand und nur ausstehende Zeilen
 * werden am neuen Viewport geprüft. */
export function restart(): void {
  if (!initialized) return;
  build();
}
