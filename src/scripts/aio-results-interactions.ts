/*
 * Die drei AIO-Ergebnis-Interaktionen laufen absichtlich ohne GSAP und ohne
 * ScrollTrigger. Sie sind Bedienlogik (Vorher/Nachher, Beleg-Slider und
 * Kundenresultate) und sollen deshalb auch dann funktionieren, wenn das grosse Motion-
 * Bundle auf einem mobilen Browser spaeter laedt oder bei der Initialisierung
 * einer anderen Animation abbricht.
 */

import { preloadCarouselImages } from './carousel-image-preload';
import { initMobileCarouselHint } from './mobile-carousel-hint';
import { createNativeCarouselMotion } from './native-carousel-motion';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isNearViewport = (element: HTMLElement, margin = 80) => {
  const bounds = element.getBoundingClientRect();
  return bounds.bottom >= -margin && bounds.top <= window.innerHeight + margin;
};

function enableMouseDrag(
  carousel: HTMLElement,
  begin: () => void,
  finish: () => void,
): void {
  let pointerId: number | null = null;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;
  let suppressClickUntil = 0;

  const end = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    const shouldSuppressClick = moved;
    pointerId = null;
    moved = false;
    carousel.classList.remove('is-pointer-dragging');
    try {
      if (carousel.hasPointerCapture(event.pointerId)) {
        carousel.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Der Browser kann den Capture beim Verlassen des Fensters bereits lösen.
    }
    if (shouldSuppressClick) suppressClickUntil = performance.now() + 350;
    finish();
  };

  carousel.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (
      event.target instanceof Element
      && event.target.closest('a, button, input, textarea, select, label, [role="button"]')
    ) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    moved = false;
    begin();
    startScrollLeft = carousel.scrollLeft;
  });
  carousel.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    if (!moved && Math.abs(deltaX) < 4) return;
    if (!moved) {
      moved = true;
      try {
        carousel.setPointerCapture(event.pointerId);
      } catch {
        // Falls der Pointer das Element bereits verlassen hat, beendet der
        // Window-Listener die Geste weiterhin zuverlässig.
      }
    }
    carousel.classList.add('is-pointer-dragging');
    event.preventDefault();
    const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    carousel.scrollLeft = clamp(startScrollLeft - deltaX, 0, maxScroll);
  });
  carousel.addEventListener('pointerup', end);
  carousel.addEventListener('pointercancel', end);
  window.addEventListener('pointerup', end, { passive: true });
  window.addEventListener('pointercancel', end, { passive: true });
  carousel.addEventListener('dragstart', (event) => {
    if (pointerId !== null) event.preventDefault();
  });
  carousel.addEventListener('click', (event) => {
    if (performance.now() > suppressClickUntil) return;
    suppressClickUntil = 0;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function initBeforeAfterComparison(comparison: HTMLElement): void {
  if (comparison.dataset.aioComparisonReady === '1') return;

  const range = comparison.querySelector<HTMLInputElement>('[data-before-after-range]');
  const handle = comparison.querySelector<HTMLElement>('[data-before-after-handle]');
  const beforeLabel = comparison.querySelector<HTMLElement>(
    '.aio-case-study__comparison-label.is-before',
  );
  const afterLabel = comparison.querySelector<HTMLElement>(
    '.aio-case-study__comparison-label.is-after',
  );
  if (!range || !handle) return;

  comparison.dataset.aioComparisonReady = '1';
  let pointerId: number | null = null;
  let touchId: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchIsHorizontal = false;
  let hintInterval = 0;
  let hintTimer = 0;
  let hasInteracted = false;
  let hintWasScheduled = false;

  const update = (value = Number(range.value)) => {
    const safeValue = clamp(value, 0, 100);
    range.value = safeValue.toFixed(2);
    comparison.style.setProperty('--comparison-position', `${safeValue}%`);

    const dividerX = comparison.clientWidth * safeValue / 100;
    const beforeEdge = beforeLabel
      ? beforeLabel.offsetLeft + beforeLabel.offsetWidth + 8
      : 0;
    const afterEdge = afterLabel
      ? afterLabel.offsetLeft - 8
      : comparison.clientWidth;
    comparison.classList.toggle('is-before-label-hidden', dividerX <= beforeEdge);
    comparison.classList.toggle('is-after-label-hidden', dividerX >= afterEdge);
  };

  const setFromClientX = (clientX: number) => {
    const bounds = comparison.getBoundingClientRect();
    if (bounds.width <= 0) return;
    update(((clientX - bounds.left) / bounds.width) * 100);
  };

  const cancelHint = () => {
    hasInteracted = true;
    window.clearTimeout(hintTimer);
    window.clearInterval(hintInterval);
  };

  range.addEventListener('input', () => {
    cancelHint();
    update();
  });
  range.addEventListener('keydown', cancelHint);

  handle.addEventListener('pointerdown', (event) => {
    cancelHint();
    pointerId = event.pointerId;
    event.preventDefault();
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // iOS kann Pointer-Capture waehrend der Geste ablehnen.
    }
  });
  handle.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    setFromClientX(event.clientX);
  });
  const endPointer = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    try {
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    } catch {
      // Der Browser kann Capture bereits selbst beendet haben.
    }
  };
  handle.addEventListener('pointerup', endPointer);
  handle.addEventListener('pointercancel', endPointer);

  // Fallback fuer aeltere WebKit-Versionen. Auf aktuellen iPhones uebernimmt
  // Pointer Events; dieselbe Logik bleibt dadurch ohne User-Agent-Weichen.
  handle.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    cancelHint();
    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchIsHorizontal = false;
  }, { passive: true });
  handle.addEventListener('touchmove', (event) => {
    if (touchId === null) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId);
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (!touchIsHorizontal) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        touchId = null;
        return;
      }
      touchIsHorizontal = true;
    }

    event.preventDefault();
    setFromClientX(touch.clientX);
  }, { passive: false });
  const endTouch = (event: TouchEvent) => {
    if (touchId === null) return;
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === touchId);
    if (!touch) return;
    touchId = null;
    touchIsHorizontal = false;
  };
  handle.addEventListener('touchend', endTouch, { passive: true });
  handle.addEventListener('touchcancel', endTouch, { passive: true });

  const runHint = () => {
    if (hasInteracted) return;
    const keyframes = [
      { value: 50, at: 0 },
      { value: 43, at: 0.28 },
      { value: 57, at: 0.7 },
      { value: 50, at: 1 },
    ];
    const duration = 1250;
    const startedAt = performance.now();

    const tick = () => {
      if (hasInteracted) return;
      const now = performance.now();
      const progress = clamp((now - startedAt) / duration, 0, 1);
      let from = keyframes[0];
      let to = keyframes[1];
      for (let index = 1; index < keyframes.length; index += 1) {
        if (progress <= keyframes[index].at) {
          from = keyframes[index - 1];
          to = keyframes[index];
          break;
        }
      }
      const local = clamp((progress - from.at) / (to.at - from.at), 0, 1);
      const eased = local < 0.5
        ? 2 * local * local
        : 1 - Math.pow(-2 * local + 2, 2) / 2;
      update(from.value + (to.value - from.value) * eased);
      if (progress >= 1) window.clearInterval(hintInterval);
    };
    tick();
    hintInterval = window.setInterval(tick, 16);
  };

  const scheduleHintWhenVisible = () => {
    if (hintWasScheduled || hasInteracted || !isNearViewport(comparison)) return;
    hintWasScheduled = true;
    window.removeEventListener('scroll', scheduleHintWhenVisible);
    window.removeEventListener('resize', scheduleHintWhenVisible);
    hintTimer = window.setTimeout(runHint, 180);
  };
  window.addEventListener('scroll', scheduleHintWhenVisible, { passive: true });
  window.addEventListener('resize', scheduleHintWhenVisible, { passive: true });
  scheduleHintWhenVisible();

  update();
  if ('ResizeObserver' in window) new ResizeObserver(() => update()).observe(comparison);
}

function initAutoCarousel(carousel: HTMLElement): void {
  if (carousel.dataset.aioCarouselReady === '1') return;
  const track = carousel.querySelector<HTMLElement>('[data-carousel-track]');
  if (!track || track.children.length < 2) return;

  carousel.dataset.aioCarouselReady = '1';
  preloadCarouselImages(carousel, '.aio-results__media img');
  const motion = createNativeCarouselMotion(carousel, track);
  initMobileCarouselHint(carousel);
  enableMouseDrag(carousel, motion.beginManual, motion.finishManual);
}

function initProofSlider(slider: HTMLElement): void {
  if (slider.dataset.aioProofSliderReady === '1') return;

  const shell = slider.closest<HTMLElement>('.aio-case-study__proofs-shell');
  const previous = shell?.querySelector<HTMLButtonElement>('[data-aio-proof-prev]');
  const next = shell?.querySelector<HTMLButtonElement>('[data-aio-proof-next]');
  const status = shell?.querySelector<HTMLElement>('[data-aio-proof-status]');
  const slides = Array.from(slider.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (!shell || !previous || !next || slides.length < 2) return;

  slider.dataset.aioProofSliderReady = '1';
  const mobileLayout = window.matchMedia(
    '(max-width: 767px), (max-width: 950px) and (max-height: 500px) and (orientation: landscape)',
  );
  let index = 0;

  const updateControls = () => {
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    if (status) status.textContent = `${index + 1} / ${slides.length}`;
  };

  const show = (nextIndex: number, smooth = true) => {
    index = clamp(nextIndex, 0, slides.length - 1);
    if (mobileLayout.matches) {
      slider.scrollTo({
        left: index * slider.clientWidth,
        behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'smooth'
          : 'auto',
      });
    } else {
      slider.scrollLeft = 0;
    }
    updateControls();
  };

  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  mobileLayout.addEventListener('change', () => show(0, false));
  window.addEventListener('resize', () => show(index, false), { passive: true });

  show(0, false);
}

document
  .querySelectorAll<HTMLElement>('[data-before-after]')
  .forEach(initBeforeAfterComparison);

document
  .querySelectorAll<HTMLElement>('[data-anim="aio-results-carousel"]')
  .forEach(initAutoCarousel);

document
  .querySelectorAll<HTMLElement>('[data-aio-proof-slider]')
  .forEach(initProofSlider);

export {};
