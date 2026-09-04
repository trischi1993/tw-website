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
const ebookMobileQuery = window.matchMedia('(max-width: 767px)');
const isEbookPage = Boolean(document.querySelector('[data-ebook-hero]'));

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
    gsap.set(
      el,
      isHeroReveal
        ? { opacity: 0, y: '1rem', force3D: true, willChange: 'transform, opacity' }
        : isLightweightEbookReveal
          ? { opacity: 0, y: '1rem' }
          : { opacity: 0, y: '1rem', filter: 'blur(5px)' },
    );
    const reveal = () => {
      // will-change erst beim tatsächlichen Eintritt setzen: 60 dauerhaft
      // vorbereitete Ebenen würden auf iPhones unnötig Grafikspeicher belegen.
      if (isLightweightEbookReveal) {
        gsap.set(el, { willChange: 'transform, opacity' });
      }
      gsap.to(el, { opacity: 1, duration, delay, ease: EASE.ease });
      gsap.to(el, {
        y: 0,
        duration,
        delay,
        ease: EASE.outQuart,
        force3D: isLightweightReveal,
        ...(isLightweightReveal ? { clearProps: 'transform,willChange' } : {}),
      });
      if (isLightweightReveal) return;
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

function initBeforeAfterComparisons(): void {
  document.querySelectorAll<HTMLElement>('[data-before-after]').forEach((comparison) => {
    const range = comparison.querySelector<HTMLInputElement>('[data-before-after-range]');
    const beforeLabel = comparison.querySelector<HTMLElement>('.aio-case-study__comparison-label.is-before');
    const afterLabel = comparison.querySelector<HTMLElement>('.aio-case-study__comparison-label.is-after');
    if (!range) return;

    let hasInteracted = false;
    let activePointerId: number | null = null;
    let activeTouchId: number | null = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchDragging = false;
    let hintTimeline: gsap.core.Timeline | null = null;

    const update = () => {
      const value = Number(range.value);
      const dividerPosition = comparison.clientWidth * value / 100;
      const beforeLabelEdge = beforeLabel
        ? beforeLabel.offsetLeft + beforeLabel.offsetWidth + 8
        : 0;
      const afterLabelEdge = afterLabel ? afterLabel.offsetLeft - 8 : comparison.clientWidth;

      comparison.style.setProperty('--comparison-position', `${value}%`);
      comparison.classList.toggle('is-before-label-hidden', dividerPosition <= beforeLabelEdge);
      comparison.classList.toggle('is-after-label-hidden', dividerPosition >= afterLabelEdge);
    };

    const cancelHint = () => {
      hasInteracted = true;
      hintTimeline?.kill();
      hintTimeline = null;
    };
    const onInput = () => {
      cancelHint();
      update();
    };
    const setFromClientX = (clientX: number) => {
      const bounds = comparison.getBoundingClientRect();
      if (!bounds.width) return;
      const value = Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100));
      range.value = value.toFixed(2);
      update();
    };
    const onPointerDown = (event: PointerEvent) => {
      cancelHint();
      activePointerId = event.pointerId;
      try {
        range.setPointerCapture?.(event.pointerId);
      } catch {
        // Safari can reject pointer capture while native range handling is active.
      }
      setFromClientX(event.clientX);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      setFromClientX(event.clientX);
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      if (range.hasPointerCapture?.(event.pointerId)) range.releasePointerCapture(event.pointerId);
    };
    const getActiveTouch = (touches: TouchList) => {
      if (activeTouchId === null) return null;
      return Array.from(touches).find((touch) => touch.identifier === activeTouchId) ?? null;
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      cancelHint();
      activeTouchId = touch.identifier;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchDragging = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = getActiveTouch(event.touches);
      if (!touch) return;

      const distanceX = touch.clientX - touchStartX;
      const distanceY = touch.clientY - touchStartY;
      if (!isTouchDragging) {
        if (Math.abs(distanceX) < 5 && Math.abs(distanceY) < 5) return;
        if (Math.abs(distanceY) > Math.abs(distanceX)) {
          activeTouchId = null;
          return;
        }
        isTouchDragging = true;
      }

      event.preventDefault();
      setFromClientX(touch.clientX);
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = getActiveTouch(event.changedTouches);
      if (!touch) return;
      if (!isTouchDragging) setFromClientX(touch.clientX);
      activeTouchId = null;
      isTouchDragging = false;
    };

    update();
    range.addEventListener('input', onInput);
    range.addEventListener('pointerdown', onPointerDown);
    range.addEventListener('pointermove', onPointerMove);
    range.addEventListener('pointerup', onPointerEnd);
    range.addEventListener('pointercancel', onPointerEnd);
    range.addEventListener('keydown', cancelHint);
    comparison.addEventListener('touchstart', onTouchStart, { passive: true });
    comparison.addEventListener('touchmove', onTouchMove, { passive: false });
    comparison.addEventListener('touchend', onTouchEnd, { passive: true });
    comparison.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Dieser kurze Hinweis ist zugleich eine Bedienhilfe und bleibt deshalb
    // auch auf iOS aktiv, wenn das System reduzierte Bewegung meldet.
    onEnterOnceStable(comparison, 8, () => {
      if (hasInteracted) return;

      const position = { value: Number(range.value) };
      const setPosition = () => {
        range.value = position.value.toFixed(2);
        update();
      };

      // Ein kurzer, einmaliger "Drag-Hinweis": Der Trenner bewegt sich
      // sichtbar in beide Richtungen und kehrt danach in die Mitte zurueck.
      hintTimeline = gsap.timeline({ delay: 0.18 });
      hintTimeline
        .to(position, { value: 43, duration: 0.32, ease: 'power2.inOut', onUpdate: setPosition })
        .to(position, { value: 57, duration: 0.5, ease: 'power2.inOut', onUpdate: setPosition })
        .to(position, {
          value: 50,
          duration: 0.34,
          ease: 'power2.out',
          onUpdate: setPosition,
          onComplete: () => {
            hintTimeline = null;
          },
        });
    });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(comparison);
    triggers.push({
      kill: () => {
        hintTimeline?.kill();
        resizeObserver.disconnect();
        range.removeEventListener('input', onInput);
        range.removeEventListener('pointerdown', onPointerDown);
        range.removeEventListener('pointermove', onPointerMove);
        range.removeEventListener('pointerup', onPointerEnd);
        range.removeEventListener('pointercancel', onPointerEnd);
        range.removeEventListener('keydown', cancelHint);
        comparison.removeEventListener('touchstart', onTouchStart);
        comparison.removeEventListener('touchmove', onTouchMove);
        comparison.removeEventListener('touchend', onTouchEnd);
        comparison.removeEventListener('touchcancel', onTouchEnd);
      },
    });
  });
}

function initAioResultsCarousels(animateEntrance = true): void {
  document
    .querySelectorAll<HTMLElement>(
      '[data-anim="aio-results-carousel"], [data-anim="aio-proof-carousel"]',
    )
    .forEach((carousel) => {
    const isProofCarousel = carousel.matches('[data-anim="aio-proof-carousel"]');
    const cards = carousel.querySelectorAll<HTMLElement>(
      isProofCarousel ? ':scope > figure' : '.aio-results__card',
    );
    if (!cards.length) return;

    let direction = 1;
    let pointerPaused = false;
    let focusPaused = false;
    let visible = false;
    let autoReady = false;
    let resumeTimer = 0;
    let scrollTween: gsap.core.Tween | null = null;
    let revealTimeline: gsap.core.Timeline | null = null;
    const scrollPosition = { value: carousel.scrollLeft };
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    carousel.classList.add('has-auto-scroll');

    const stopAutoScroll = () => {
      scrollTween?.kill();
      scrollTween = null;
      scrollPosition.value = carousel.scrollLeft;
      carousel.classList.remove('is-auto-scrolling');
    };
    const clearResumeTimer = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = 0;
    };
    const canAutoScroll = () =>
      autoReady &&
      visible &&
      !pointerPaused &&
      !focusPaused &&
      !(hoverCapable && carousel.matches(':hover'));
    const startAutoScroll = () => {
      clearResumeTimer();
      stopAutoScroll();
      if (!canAutoScroll()) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (maxScroll <= 1) return;

      const target = direction > 0 ? maxScroll : 0;
      const distance = Math.abs(target - carousel.scrollLeft);
      if (distance <= 1) {
        direction *= -1;
        resumeTimer = window.setTimeout(startAutoScroll, 850);
        return;
      }

      carousel.classList.add('is-auto-scrolling');
      scrollPosition.value = carousel.scrollLeft;
      scrollTween = gsap.to(scrollPosition, {
        value: target,
        duration: Math.max(distance / (isProofCarousel ? 19 : 22), 0.2),
        ease: 'none',
        overwrite: 'auto',
        onUpdate: () => {
          carousel.scrollLeft = scrollPosition.value;
        },
        onComplete: () => {
          scrollTween = null;
          carousel.classList.remove('is-auto-scrolling');
          direction *= -1;
          resumeTimer = window.setTimeout(startAutoScroll, 850);
        },
      });
    };
    const resumeAfter = (duration = 1200) => {
      clearResumeTimer();
      stopAutoScroll();
      resumeTimer = window.setTimeout(startAutoScroll, duration);
    };
    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        pointerPaused = true;
        clearResumeTimer();
        stopAutoScroll();
      }
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        pointerPaused = false;
        resumeAfter(300);
      }
    };
    const onPointerDown = () => {
      pointerPaused = true;
      clearResumeTimer();
      stopAutoScroll();
    };
    const onPointerUp = () => {
      pointerPaused = false;
      resumeAfter(1000);
    };
    const onGlobalPointerEnd = () => {
      if (!pointerPaused) return;
      pointerPaused = false;
      resumeAfter(750);
    };
    const onFocusIn = () => {
      focusPaused = true;
      clearResumeTimer();
      stopAutoScroll();
    };
    const onFocusOut = () => {
      focusPaused = false;
      resumeAfter(300);
    };
    const onManualScroll = () => resumeAfter(1200);

    const visibilityObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            visible = Boolean(entry?.isIntersecting);
            if (visible) resumeAfter(180);
            else {
              clearResumeTimer();
              stopAutoScroll();
            }
          },
          { threshold: 0.04 },
        )
      : null;

    if (visibilityObserver) visibilityObserver.observe(carousel);
    else visible = true;

    carousel.addEventListener('pointerenter', onPointerEnter);
    carousel.addEventListener('pointerleave', onPointerLeave);
    carousel.addEventListener('pointerdown', onPointerDown, { passive: true });
    carousel.addEventListener('pointerup', onPointerUp, { passive: true });
    carousel.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('pointerup', onGlobalPointerEnd);
    window.addEventListener('pointercancel', onGlobalPointerEnd);
    window.addEventListener('touchend', onGlobalPointerEnd, { passive: true });
    window.addEventListener('touchcancel', onGlobalPointerEnd, { passive: true });
    carousel.addEventListener('focusin', onFocusIn);
    carousel.addEventListener('focusout', onFocusOut);
    carousel.addEventListener('wheel', onManualScroll, { passive: true });
    carousel.addEventListener('touchmove', onManualScroll, { passive: true });

    triggers.push({
      kill: () => {
        clearResumeTimer();
        stopAutoScroll();
        revealTimeline?.kill();
        visibilityObserver?.disconnect();
        carousel.classList.remove('has-auto-scroll');
        carousel.removeEventListener('pointerenter', onPointerEnter);
        carousel.removeEventListener('pointerleave', onPointerLeave);
        carousel.removeEventListener('pointerdown', onPointerDown);
        carousel.removeEventListener('pointerup', onPointerUp);
        carousel.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('pointerup', onGlobalPointerEnd);
        window.removeEventListener('pointercancel', onGlobalPointerEnd);
        window.removeEventListener('touchend', onGlobalPointerEnd);
        window.removeEventListener('touchcancel', onGlobalPointerEnd);
        carousel.removeEventListener('focusin', onFocusIn);
        carousel.removeEventListener('focusout', onFocusOut);
        carousel.removeEventListener('wheel', onManualScroll);
        carousel.removeEventListener('touchmove', onManualScroll);
      },
    });

    if (isProofCarousel || !animateEntrance) {
      // Die Belege werden bereits zusammen mit der Fallstudie eingeblendet.
      // Hier wird auf schmalen Ansichten nur dieselbe ruhige Auto-Scroll-
      // Mechanik wie bei den weiteren Kundenerfolgen ergänzt. Im statischen
      // Reduced-Motion-Pfad bleibt der Inhalt ebenfalls sofort sichtbar; nur
      // die funktionale, vom Nutzer angeforderte Scroll-Mechanik wird aktiv.
      autoReady = true;
      if (visible) resumeAfter(300);
      return;
    }

    gsap.set(carousel, { opacity: 0, y: '1rem' });
    gsap.set(cards, { opacity: 0, y: '0.85rem' });
    onEnterOnceStable(carousel, 8, () => {
      revealTimeline = gsap.timeline({
        onComplete: () => {
          autoReady = true;
          resumeAfter(300);
        },
      });
      revealTimeline
        .to(carousel, { opacity: 1, y: 0, duration: 0.65, ease: EASE.outQuart })
        .to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.055,
          ease: EASE.outQuart,
        }, '-=0.34');
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

/** Webflow initialisiert seine IX2-Entrance-Events nach einem Breakpoint- bzw.
 * Orientierungswechsel neu. Generische Reveals starten neu; die einmaligen
 * FAQ-Zeilen behalten ihren sichtbaren Zustand und nur ausstehende Zeilen
 * werden am neuen Viewport geprüft. */
export function restart(): void {
  if (!initialized) return;
  build();
}
