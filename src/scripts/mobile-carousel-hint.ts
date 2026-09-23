const MOBILE_PORTRAIT = '(max-width: 767px) and (orientation: portrait)';

/**
 * Zeigt einmal pro Seitenaufruf einen kurzen mobilen Wischhinweis. Der Track
 * wird nur visuell per Web Animations API verschoben und kehrt exakt an seine
 * Ausgangsposition zurueck; nativer Scrollstand und Scroll-Snap bleiben daher
 * unangetastet.
 */
export function initMobileCarouselHint(
  carousel: HTMLElement,
  track: HTMLElement,
): void {
  if (carousel.dataset.mobileSwipeHintReady === '1') return;

  const section = carousel.closest<HTMLElement>('section');
  const hint = section?.querySelector<HTMLElement>('[data-carousel-swipe-hint]');
  const arrow = hint?.querySelector<HTMLElement>('[data-carousel-swipe-arrow]');
  if (!hint || !arrow) return;

  carousel.dataset.mobileSwipeHintReady = '1';
  const mobilePortrait = window.matchMedia(MOBILE_PORTRAIT);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isVisible = false;
  let cuePlayed = false;
  let dismissed = false;
  let cueTimer = 0;
  let trackAnimation: Animation | null = null;
  let arrowAnimation: Animation | null = null;
  let pointerId: number | null = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let touchId: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const cancelCue = () => {
    window.clearTimeout(cueTimer);
    cueTimer = 0;
    trackAnimation?.cancel();
    arrowAnimation?.cancel();
    trackAnimation = null;
    arrowAnimation = null;
  };

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    cancelCue();
    hint.classList.remove('is-visible');
    hint.classList.add('is-dismissed');
  };

  const runCue = () => {
    cueTimer = 0;
    if (dismissed || cuePlayed || !isVisible || !mobilePortrait.matches) return;
    cuePlayed = true;
    if (reducedMotion.matches || typeof track.animate !== 'function') return;

    const timing: KeyframeAnimationOptions = {
      duration: 900,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };
    trackAnimation = track.animate(
      [
        { transform: 'translate3d(0, 0, 0)', offset: 0 },
        { transform: 'translate3d(-18px, 0, 0)', offset: 0.45 },
        { transform: 'translate3d(0, 0, 0)', offset: 1 },
      ],
      timing,
    );
    arrowAnimation = arrow.animate(
      [
        { transform: 'translate3d(0, 0, 0)', offset: 0 },
        { transform: 'translate3d(0.35rem, 0, 0)', offset: 0.45 },
        { transform: 'translate3d(0, 0, 0)', offset: 1 },
      ],
      timing,
    );
    trackAnimation.onfinish = () => {
      trackAnimation = null;
    };
    arrowAnimation.onfinish = () => {
      arrowAnimation = null;
    };
  };

  const updatePresentation = () => {
    if (dismissed || !mobilePortrait.matches || !isVisible) {
      cancelCue();
      hint.classList.remove('is-visible');
      return;
    }

    hint.classList.add('is-visible');
    if (!cuePlayed) {
      window.clearTimeout(cueTimer);
      cueTimer = window.setTimeout(runCue, 280);
    }
  };

  const movedHorizontally = (deltaX: number, deltaY: number) =>
    Math.abs(deltaX) >= 10 && Math.abs(deltaX) > Math.abs(deltaY);

  carousel.addEventListener('pointerdown', (event) => {
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  }, { passive: true });
  carousel.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    if (movedHorizontally(event.clientX - pointerStartX, event.clientY - pointerStartY)) {
      pointerId = null;
      dismiss();
    }
  }, { passive: true });
  const endPointer = (event: PointerEvent) => {
    if (event.pointerId === pointerId) pointerId = null;
  };
  carousel.addEventListener('pointerup', endPointer, { passive: true });
  carousel.addEventListener('pointercancel', endPointer, { passive: true });

  // Touch-Events bleiben als WebKit-Fallback erhalten. `dismiss()` ist
  // idempotent, falls ein Browser fuer dieselbe Geste beide Eventtypen sendet.
  carousel.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  carousel.addEventListener('touchmove', (event) => {
    if (touchId === null) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId);
    if (!touch) return;
    if (movedHorizontally(touch.clientX - touchStartX, touch.clientY - touchStartY)) {
      touchId = null;
      dismiss();
    }
  }, { passive: true });
  const endTouch = (event: TouchEvent) => {
    if (touchId === null) return;
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === touchId);
    if (touch) touchId = null;
  };
  carousel.addEventListener('touchend', endTouch, { passive: true });
  carousel.addEventListener('touchcancel', endTouch, { passive: true });

  mobilePortrait.addEventListener('change', updatePresentation);
  reducedMotion.addEventListener('change', () => {
    cancelCue();
    updatePresentation();
  });

  if (typeof window.IntersectionObserver === 'function') {
    new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        updatePresentation();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    ).observe(carousel);
  } else {
    const updateVisibility = () => {
      const bounds = carousel.getBoundingClientRect();
      isVisible = bounds.bottom >= 0 && bounds.top <= window.innerHeight;
      updatePresentation();
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
    updateVisibility();
  }
}
