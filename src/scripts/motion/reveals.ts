import { EASE, gsap, onEnterOnce, type EnterOnceTrigger } from './util';

/* ---------------------------------------------------------------------------
   Generische Scroll-Entrance-Reveals (IX2, alle Breakpoints):

   - data-anim="reveal"    a-110/a-117/a-119/a-159: opacity 0→1 (ease),
                           y 1rem→0 (outQuart), Text-Blur 3.5→0 (ease),
                           Bewegung/Fade je 0.8 s, Blur mindestens 0.9 s.
                           data-delay Sek. (a-117: 0.15, a-119: 0.3),
                           data-offset % vom unteren Viewportrand (Default 16).
                           Die Browser-Timeline animiert Bewegung, Fade und
                           Blur nativ. Nur echte Textflächen werden gefiltert;
                           Rahmen, Linien, Bilder und Container bleiben aus der
                           WebKit-Filterebene heraus. Das verhindert schwarze
                           Kanten und reduziert die Rasterlast auf 120-Hz-iPhones.
                           data-reveal-no-blur behält Fade und Bewegung bei,
                           vermeidet aber Filterkanten auf transparenten Flächen.
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
const activeRevealFinalizers = new Set<(holdTextLayer?: boolean) => void>();
interface RevealedTextLayer {
  targets: HTMLElement[];
  heldForOrientation: boolean;
}
const revealedTextLayers = new Set<RevealedTextLayer>();
let orientationHoldActive = false;
let orientationReleaseTimer: number | undefined;
let orientationReleaseFrame: number | undefined;
const ebookMobileQuery = window.matchMedia('(max-width: 767px)');
const isEbookPage = Boolean(document.querySelector('[data-ebook-hero]'));

const REVEAL_TEXT_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'dt',
  'dd',
  'figcaption',
  'button',
  'a',
  'label',
  'span',
  'strong',
  'small',
  's',
  '[data-reveal-blur-text]',
].join(',');

const NATIVE_EASE = {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  outQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
} as const;

/** Filtert ausschließlich die sichtbaren Textflächen eines Reveal-Blocks.
 * Ein Filter auf dem gesamten Container erzeugt in WebKit große transparente
 * Rasterebenen; genau daraus entstanden die schwarzen Querbalken. */
function getRevealTextTargets(root: HTMLElement): HTMLElement[] {
  const candidates = root.matches(REVEAL_TEXT_SELECTOR)
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(REVEAL_TEXT_SELECTOR));

  const eligible = candidates.filter((candidate) => {
    if (!candidate.textContent?.trim()) return false;
    if (candidate.closest('[aria-hidden="true"]')) return false;
    return candidate.closest<HTMLElement>('[data-anim="reveal"]') === root;
  });

  // Wenn z. B. ein H2 ein Span enthält, wird nur das H2 gefiltert. So bleibt
  // die Anzahl der gleichzeitig gerasterten Text-Layer möglichst klein.
  return eligible.filter(
    (candidate) => !eligible.some((ancestor) => ancestor !== candidate && ancestor.contains(candidate)),
  );
}

function holdTextLayersForOrientation(): void {
  orientationHoldActive = true;
  if (orientationReleaseTimer !== undefined) window.clearTimeout(orientationReleaseTimer);
  if (orientationReleaseFrame !== undefined) cancelAnimationFrame(orientationReleaseFrame);

  revealedTextLayers.forEach((layer) => {
    layer.heldForOrientation = true;
    // Ein explizites finales `none` bleibt bis zum Ende aller iOS-Viewport-
    // Stufen bestehen. Damit kann WebKit beim Neuumbrechen keine einzelne
    // Zeile mehr aus dem alten Blur-Compositor-Layer zeichnen.
    if (layer.targets.length) gsap.set(layer.targets, { filter: 'none' });
  });

  // Sicherheitsnetz fuer den seltenen Fall, dass kein stabiler Inhaltsanker
  // vorhanden ist und der zentrale Rotationsabschluss deshalb nicht feuert.
  orientationReleaseTimer = window.setTimeout(releaseOrientationHold, 2100);
}

function finishActiveRevealAnimations(holdTextLayer = false): void {
  [...activeRevealFinalizers].forEach((finish) => finish(holdTextLayer));
}

/** Entfernt den rein technischen Endzustand erst nach der finalen mobilen
 * Geometrie. Zwei Frames verhindern, dass Layer-Abbau und letzter Reflow in
 * demselben Safari-Paint landen. */
export function releaseOrientationHold(): void {
  if (orientationReleaseTimer !== undefined) window.clearTimeout(orientationReleaseTimer);
  if (orientationReleaseFrame !== undefined) cancelAnimationFrame(orientationReleaseFrame);
  orientationReleaseTimer = undefined;

  orientationReleaseFrame = requestAnimationFrame(() => {
    orientationReleaseFrame = requestAnimationFrame(() => {
      orientationReleaseFrame = undefined;
      orientationHoldActive = false;
      revealedTextLayers.forEach((layer) => {
        if (!layer.heldForOrientation) return;
        layer.heldForOrientation = false;
        if (layer.targets.length) gsap.set(layer.targets, { clearProps: 'filter,willChange' });
      });
    });
  });
}

interface SharedObserverGroup {
  observer: IntersectionObserver;
  callbacks: Map<Element, () => void>;
}

const sharedEbookObservers = new Map<number, SharedObserverGroup>();

function usesSharedEbookObserver(): boolean {
  return isEbookPage && ebookMobileQuery.matches && 'IntersectionObserver' in window;
}

/** Die E-Book-Seite besitzt deutlich mehr Reveal-Elemente als die übrigen
 * Seiten. Mobil teilen sie sich deshalb einen nativen Observer pro Offset,
 * statt für jedes Element eigene Scroll-/Resize-Listener anzulegen. */
function onEnterOnceShared(
  el: Element,
  offsetPct: number,
  onEnter: () => void,
): EnterOnceTrigger {
  if (!usesSharedEbookObserver()) return onEnterOnce(el, offsetPct, onEnter);

  const offset = Math.max(0, Math.min(49, offsetPct));
  let group = sharedEbookObservers.get(offset);
  if (!group) {
    const callbacks = new Map<Element, () => void>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const callback = callbacks.get(entry.target);
          if (!callback) return;
          callbacks.delete(entry.target);
          observer.unobserve(entry.target);
          callback();
        });
      },
      {
        rootMargin: `-${offset}% 0px -${offset}% 0px`,
        threshold: 0,
      },
    );
    group = { observer, callbacks };
    sharedEbookObservers.set(offset, group);
  }

  group.callbacks.set(el, onEnter);
  group.observer.observe(el);
  let stopped = false;

  return {
    kill: () => {
      if (stopped) return;
      stopped = true;
      group?.callbacks.delete(el);
      group?.observer.unobserve(el);
      if (group?.callbacks.size === 0) {
        group.observer.disconnect();
        sharedEbookObservers.delete(offset);
      }
    },
  };
}

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
    triggers.push(onEnterOnceShared(el, offset, onEnter));
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

    triggers.push(onEnterOnceShared(el, offset, onEnter));
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
    const isLightweightEbookReveal = usesSharedEbookObserver() && !isHeroReveal;
    const isLightweightReveal = isHeroReveal || isLightweightEbookReveal;
    const skipsBlur = el.hasAttribute('data-reveal-no-blur');
    const blurTargets = skipsBlur ? [] : getRevealTextTargets(el);
    const supportsNativeAnimation = typeof el.animate === 'function';

    gsap.set(el, { opacity: 0, y: '1rem' });
    if (blurTargets.length) gsap.set(blurTargets, { filter: 'blur(3.5px)' });

    const reveal = () => {
      // will-change erst beim tatsächlichen Eintritt setzen: viele dauerhaft
      // vorbereitete Ebenen würden auf iPhones unnötig Grafikspeicher belegen.
      const blurIncludesRoot = blurTargets.includes(el);
      const nestedBlurTargets = blurTargets.filter((target) => target !== el);
      gsap.set(el, {
        willChange: blurIncludesRoot ? 'transform, opacity, filter' : 'transform, opacity',
      });
      if (nestedBlurTargets.length) gsap.set(nestedBlurTargets, { willChange: 'filter' });

      if (!supportsNativeAnimation) {
        gsap.to(el, { opacity: 1, duration, delay, ease: EASE.ease });
        gsap.to(el, {
          y: 0,
          duration,
          delay,
          ease: EASE.outQuart,
          force3D: isLightweightReveal,
          clearProps: 'transform,willChange',
        });
        if (blurTargets.length) {
          gsap.to(blurTargets, {
            filter: 'blur(0px)',
            duration: Math.max(duration, 0.9),
            delay,
            ease: EASE.ease,
            clearProps: 'filter,willChange',
          });
        }
        return;
      }

      const timing = {
        duration: duration * 1000,
        delay: delay * 1000,
        fill: 'both' as FillMode,
      };
      const textLayer: RevealedTextLayer = {
        targets: blurTargets,
        // Ein Reveal kann erst DURCH die neue Viewport-Geometrie in den
        // sichtbaren Bereich geraten. Auch dann darf waehrend der Rotation
        // kein frischer Blur-Layer aufgebaut werden.
        heldForOrientation: orientationHoldActive,
      };
      revealedTextLayers.add(textLayer);
      const animations = [
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          ...timing,
          easing: NATIVE_EASE.ease,
        }),
        el.animate(
          [
            { transform: 'translate3d(0, 1rem, 0)' },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          { ...timing, easing: NATIVE_EASE.outQuart },
        ),
        ...blurTargets.map((target) =>
          target.animate(
            [
              { filter: 'blur(3.5px)', offset: 0 },
              { filter: 'blur(1.15px)', offset: 0.62 },
              // Ein fast-null Endwert verhindert, dass WebKit den Filter-
              // Layer im letzten sichtbaren Frame abrupt neu rasterisiert.
              { filter: 'blur(0.001px)', offset: 1 },
            ],
            {
              duration: Math.max(duration, 0.9) * 1000,
              delay: delay * 1000,
              easing: NATIVE_EASE.ease,
              fill: 'both',
            },
          ),
        ),
      ];

      let finished = false;
      const finish = (holdTextLayer = false) => {
        if (holdTextLayer) textLayer.heldForOrientation = true;

        if (!finished) {
          finished = true;
          activeRevealFinalizers.delete(finish);

          // Den sichtbaren Endzustand VOR `cancel()` hinter der nativen
          // Animation setzen. Die bisherige umgekehrte Reihenfolge legte auf
          // Safari fuer einen Paint wieder den vorbereiteten Blur-Startwert
          // frei; nach einem Zeilenumbruch betraf das oft nur eine Textzeile.
          gsap.set(el, { opacity: 1, y: 0 });
          if (blurTargets.length) gsap.set(blurTargets, { filter: 'none' });
          animations.forEach((animation) => animation.cancel());
          gsap.set(el, { clearProps: 'opacity,transform,willChange' });
        }

        if (!textLayer.heldForOrientation && blurTargets.length) {
          gsap.set(blurTargets, { clearProps: 'filter,willChange' });
        }
      };

      activeRevealFinalizers.add(finish);
      if (orientationHoldActive) finish(true);
      // Der Fehlerpfad ist bewusst identisch mit dem normalen Abschluss. Ein
      // von WebKit abgebrochener Teil darf nie als halbfertiger Layer bleiben.
      void Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);
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

function initAioProgrammeModules(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="aio-programme-modules"]').forEach((list) => {
    list.querySelectorAll<HTMLElement>('.aio-programme__group').forEach((group) => {
      const head = group.querySelector<HTMLElement>('.aio-programme__group-head');
      const modules = group.querySelectorAll<HTMLElement>('.aio-programme__module');
      const items = [head, ...modules].filter(Boolean) as HTMLElement[];
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: '1rem' });
      // Theorie und Praxis werden jeweils erst beim Erreichen ihrer Gruppe
      // eingeblendet. So bleibt der Praxis-Kopf auch auf kleinen Screens als
      // bewusster zweiter Programmteil wahrnehmbar.
      onEnterOnceStable(group, 18, () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.085,
          ease: EASE.outQuart,
        });
      });
    });
  });
}

function initAioCaseStudies(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="aio-case-study"]').forEach((study) => {
    const head = study.querySelector<HTMLElement>('.aio-case-study__head');
    const journey = study.querySelector<HTMLElement>('.aio-case-study__journey');
    const proofs = study.querySelectorAll<HTMLElement>('.aio-case-study__proofs figure');
    const metrics = study.querySelectorAll<HTMLElement>('.aio-case-study__metrics > div');
    const pieces = [head, ...proofs, ...metrics, journey].filter(Boolean) as HTMLElement[];

    gsap.set(study, { opacity: 0, y: '1.25rem' });
    gsap.set(pieces, { opacity: 0, y: '0.75rem' });
    onEnterOnceStable(study, 10, () => {
      const timeline = gsap.timeline();
      timeline
        .to(study, { opacity: 1, y: 0, duration: 0.75, ease: EASE.outQuart })
        .to(pieces, {
          opacity: 1,
          y: 0,
          duration: 0.58,
          stagger: 0.065,
          ease: EASE.outQuart,
        }, '-=0.35');
    });
  });
}

function initAioGrowthSystem(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="aio-growth-system"]').forEach((system) => {
    const stages = system.querySelectorAll<HTMLElement>('.aio-growth-stage');
    const statusDot = system.querySelector<HTMLElement>('.aio-growth-system__status i');
    const reachLine = system.querySelector<SVGPathElement>('[data-aio-growth-line]');
    const reachArea = system.querySelector<SVGPathElement>('[data-aio-growth-area]');
    const reachPoint = system.querySelector<SVGCircleElement>('[data-aio-growth-point]');
    const reachGlow = system.querySelector<SVGCircleElement>('[data-aio-growth-glow]');
    const reachGraphic = system.querySelector<HTMLElement>('.aio-growth-stage__graphic.is-reach');
    const communityGraphic = system.querySelector<HTMLElement>('.aio-growth-stage__graphic.is-community');
    const conversionGraphic = system.querySelector<HTMLElement>('.aio-growth-stage__graphic.is-conversion');
    const orbits = system.querySelectorAll<SVGCircleElement>('[data-aio-growth-orbit]');
    const network = system.querySelector<SVGPathElement>('[data-aio-growth-network]');
    const networkNodes = system.querySelectorAll<SVGCircleElement>('[data-aio-growth-nodes] circle');
    const networkHalo = system.querySelector<SVGCircleElement>('[data-aio-growth-halo]');
    const networkCore = system.querySelector<SVGCircleElement>('[data-aio-growth-core]');
    const flows = system.querySelectorAll<SVGPathElement>('[data-aio-growth-flow]');
    const sources = system.querySelectorAll<SVGRectElement>('[data-aio-growth-sources] rect');
    const conversion = system.querySelectorAll<SVGCircleElement>('[data-aio-growth-conversion]');
    const currency = system.querySelector<SVGTextElement>('[data-aio-growth-currency]');
    const labels = system.querySelectorAll<HTMLElement>('[data-aio-growth-label]');
    const preparePathDraw = (path: SVGPathElement) => {
      // Die Diagramm-Pfade sind per pathLength="1" normalisiert. In diesem
      // Fall muss auch das Dash-Muster mit derselben logischen Laenge arbeiten;
      // die physische getTotalLength()-Laenge wuerde durch die Normalisierung
      // vervielfacht und liesse den Pfad optisch bereits komplett erscheinen.
      const declaredLength = Number.parseFloat(path.getAttribute('pathLength') ?? '');
      const length = Number.isFinite(declaredLength) && declaredLength > 0
        ? declaredLength
        : path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: `${length} ${length}`,
        strokeDashoffset: length,
        autoAlpha: 0,
      });
      return length;
    };

    gsap.set(system, { opacity: 0, y: '1.5rem' });
    gsap.set(stages, { opacity: 0, y: '1rem' });
    if (statusDot) gsap.set(statusDot, { opacity: 0.35, scale: 0.55 });
    if (reachLine) preparePathDraw(reachLine);
    if (reachArea) {
      gsap.set(reachArea, {
        opacity: 0,
        clipPath: 'inset(0 100% 0 0)',
      });
    }
    if (reachPoint) gsap.set(reachPoint, { opacity: 0, scale: 0, transformOrigin: 'center' });
    if (reachGlow) gsap.set(reachGlow, { opacity: 0, scale: 0.3, transformOrigin: 'center' });
    if (orbits.length) gsap.set(orbits, { opacity: 0, scale: 0.82, transformOrigin: 'center' });
    if (network) preparePathDraw(network);
    if (networkNodes.length) gsap.set(networkNodes, { opacity: 0, scale: 0, transformOrigin: 'center' });
    if (networkHalo) gsap.set(networkHalo, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
    if (networkCore) gsap.set(networkCore, { opacity: 0, scale: 0, transformOrigin: 'center' });
    flows.forEach(preparePathDraw);
    if (sources.length) gsap.set(sources, { opacity: 0, scale: 0.55, transformOrigin: 'center' });
    if (conversion.length) gsap.set(conversion, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
    if (currency) gsap.set(currency, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
    if (labels.length) gsap.set(labels, { opacity: 0, x: '-0.5rem' });

    const addReachMotion = (timeline: gsap.core.Timeline, start = 0) => {
      if (reachLine) {
        timeline.to(reachLine, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, start);
        timeline.to(reachLine, {
          autoAlpha: 1,
          duration: 0.08,
          ease: 'none',
        }, start + 0.04);
        timeline.set(reachLine, { strokeLinecap: 'round' }, start + 0.5);
      }
      if (reachArea) {
        timeline.to(reachArea, {
          opacity: 1,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.5,
          ease: 'power2.out',
        }, start);
      }
      if (reachGlow) {
        timeline.to(reachGlow, {
          opacity: 0.32,
          scale: 1.12,
          duration: 0.22,
          ease: EASE.outQuart,
        }, start + 0.5);
      }
      if (reachPoint) {
        timeline.to(reachPoint, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: 'back.out(1.7)',
        }, start + 0.5);
      }
      if (labels[0]) {
        timeline.to(labels[0], {
          opacity: 1,
          x: 0,
          duration: 0.24,
          ease: EASE.outQuart,
        }, start + 0.42);
      }
    };

    const addCommunityMotion = (timeline: gsap.core.Timeline, start = 0) => {
      if (orbits.length) {
        timeline.to(orbits, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.035,
          ease: EASE.outQuart,
        }, start);
      }
      if (network) {
        timeline.to(network, {
          strokeDashoffset: 0,
          duration: 0.38,
          ease: 'power2.out',
        }, start + 0.04);
        timeline.to(network, {
          autoAlpha: 1,
          duration: 0.08,
          ease: 'none',
        }, start + 0.08);
      }
      if (networkHalo) {
        timeline.to(networkHalo, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: EASE.outQuart,
        }, start + 0.2);
      }
      if (networkCore) {
        timeline.to(networkCore, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: 'back.out(1.7)',
        }, start + 0.22);
      }
      if (networkNodes.length) {
        timeline.to(networkNodes, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          stagger: 0.025,
          ease: 'back.out(1.7)',
        }, start + 0.22);
      }
      if (labels[1]) {
        timeline.to(labels[1], {
          opacity: 1,
          x: 0,
          duration: 0.24,
          ease: EASE.outQuart,
        }, start + 0.42);
      }
    };

    const addConversionMotion = (timeline: gsap.core.Timeline, start = 0) => {
      if (sources.length) {
        timeline.to(sources, {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          stagger: 0.03,
          ease: 'back.out(1.55)',
        }, start);
      }
      if (flows.length) {
        timeline.to(flows, {
          strokeDashoffset: 0,
          duration: 0.34,
          stagger: 0.025,
          ease: 'power2.out',
        }, start + 0.04);
        timeline.to(flows, {
          autoAlpha: 1,
          duration: 0.08,
          stagger: 0.025,
          ease: 'none',
        }, start + 0.08);
      }
      if (conversion.length) {
        timeline.to(conversion, {
          opacity: 1,
          scale: 1,
          duration: 0.24,
          stagger: 0.03,
          ease: EASE.outQuart,
        }, start + 0.28);
      }
      if (currency) {
        timeline.to(currency, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: 'back.out(1.55)',
        }, start + 0.34);
      }
      if (labels[2]) {
        timeline.to(labels[2], {
          opacity: 1,
          x: 0,
          duration: 0.24,
          ease: EASE.outQuart,
        }, start + 0.42);
      }
    };

    const trackTimeline = (timeline: gsap.core.Timeline) => {
      triggers.push({ kill: () => timeline.kill() });
    };

    const isStacked = window.matchMedia('(max-width: 767px)').matches;

    // Rahmen und Inhalte erscheinen früh, die Diagramme starten erst dann,
    // wenn sie tatsächlich ins Sichtfeld kommen. So hängt ihr Timing nicht
    // von der Scrollgeschwindigkeit über die Überschrift ab.
    onEnterOnceStable(system, 8, () => {
      const timeline = gsap.timeline();
      timeline
        .to(system, {
          opacity: 1,
          y: 0,
          duration: 0.26,
          ease: EASE.outQuart,
        }, 0)
        .to(stages, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: isStacked ? 0.025 : 0.05,
          ease: EASE.outQuart,
        }, 0.06);

      if (statusDot) {
        timeline.to(statusDot, {
          opacity: 1,
          scale: 1,
          duration: 0.24,
          ease: 'back.out(1.7)',
        }, 0.1);
      }

      trackTimeline(timeline);
    });

    if (isStacked) {
      // In der gestapelten Mobilansicht bekommt jede Grafik ihren eigenen
      // kurzen Auftritt genau an ihrer Scrollposition.
      if (reachGraphic) {
        onEnterOnceStable(reachGraphic, 14, () => {
          const timeline = gsap.timeline();
          addReachMotion(timeline);
          trackTimeline(timeline);
        });
      }
      if (communityGraphic) {
        onEnterOnceStable(communityGraphic, 14, () => {
          const timeline = gsap.timeline();
          addCommunityMotion(timeline);
          trackTimeline(timeline);
        });
      }
      if (conversionGraphic) {
        onEnterOnceStable(conversionGraphic, 14, () => {
          const timeline = gsap.timeline();
          addConversionMotion(timeline);
          trackTimeline(timeline);
        });
      }
      return;
    }

    // Auf Desktop und im mobilen Querformat stehen die drei Diagramme auf
    // einer Linie. Ihre Bewegungen überlappen sich leicht und sind nach gut
    // einer Sekunde vollständig aufgebaut – ohne sichtbare Leerlaufpausen.
    if (reachGraphic) {
      onEnterOnceStable(reachGraphic, 14, () => {
        const timeline = gsap.timeline();
        addReachMotion(timeline, 0);
        addCommunityMotion(timeline, 0.42);
        addConversionMotion(timeline, 0.82);
        trackTimeline(timeline);
      });
    }
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
  finishActiveRevealAnimations();

  // Laufende oder bereits beendete Callback-Tweens gehören nicht automatisch
  // zu ihrem ScrollTrigger. Vor dem Neuaufbau stoppen; die FAQ-Funktion hält
  // bereits abgespielte Zeilen dabei bewusst sichtbar.
  const targets = document.querySelectorAll<HTMLElement>(
    '[data-anim="reveal"], [data-usp-icon], [data-usp-text], ' +
      '[data-anim="grow-line"], [data-faq-top], [data-anim="aio-growth-system"], ' +
      '[data-anim="aio-programme-modules"] .aio-programme__group-head, ' +
      '[data-anim="aio-programme-modules"] .aio-programme__module, ' +
      '[data-anim="aio-case-study"], [data-anim="aio-case-study"] .aio-case-study__head, ' +
      '[data-anim="aio-case-study"] .aio-case-study__journey figure, ' +
      '[data-anim="aio-case-study"] .aio-case-study__proofs figure, ' +
      '[data-anim="aio-case-study"] .aio-case-study__metrics > div, ' +
      '[data-anim="aio-results-carousel"], [data-anim="aio-results-carousel"] .aio-results__card, ' +
      '[data-aio-growth-line], [data-aio-growth-area], [data-aio-growth-point], ' +
      '[data-aio-growth-glow], [data-aio-growth-orbit], [data-aio-growth-network], ' +
      '[data-aio-growth-nodes] circle, [data-aio-growth-halo], [data-aio-growth-core], ' +
      '[data-aio-growth-flow], [data-aio-growth-sources] rect, ' +
      '[data-aio-growth-conversion], [data-aio-growth-currency], [data-aio-growth-label]',
  );
  gsap.killTweensOf(targets);

  initReveal();
  initUspRows();
  initGrowLines();
  initAioProgrammeModules();
  initAioCaseStudies();
  initAioGrowthSystem();
  initFaqItems();
}

export function init(_mm: gsap.MatchMedia): void {
  initialized = true;
  build();
}

/** Ein laufender Text-Reveal wird vor einer neuen Viewport-Geometrie sauber
 * beendet. Bereits fertige Reveals und normale Scroll-Eintritte bleiben
 * unangetastet. */
export function settleForOrientationChange(): void {
  holdTextLayersForOrientation();
  finishActiveRevealAnimations(true);
}

/** Webflow initialisiert seine IX2-Entrance-Events nach einem Breakpoint- bzw.
 * Orientierungswechsel neu. Generische Reveals starten neu; die einmaligen
 * FAQ-Zeilen behalten ihren sichtbaren Zustand und nur ausstehende Zeilen
 * werden am neuen Viewport geprüft. */
export function restart(): void {
  if (!initialized) return;
  build();
}
