const MOBILE_PORTRAIT = '(max-width: 767px) and (orientation: portrait)';

/**
 * Zeigt im mobilen Hochformat einen dezenten Wischhinweis und entfernt ihn
 * nach der ersten horizontalen Geste. Die Kartenbewegung selbst kommt aus der
 * gemeinsamen nativen Carousel-Animation und wird hier nicht doppelt animiert.
 */
export function initMobileCarouselHint(carousel: HTMLElement): void {
  if (carousel.dataset.mobileSwipeHintReady === '1') return;

  const section = carousel.closest<HTMLElement>('section');
  const hint = section?.querySelector<HTMLElement>('[data-carousel-swipe-hint]');
  if (!hint) return;

  carousel.dataset.mobileSwipeHintReady = '1';
  const mobilePortrait = window.matchMedia(MOBILE_PORTRAIT);
  let isVisible = false;
  let dismissed = false;
  let pointerId: number | null = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let touchId: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    hint.classList.remove('is-visible');
    hint.classList.add('is-dismissed');
  };

  const updatePresentation = () => {
    if (dismissed || !mobilePortrait.matches || !isVisible) {
      hint.classList.remove('is-visible');
      return;
    }

    hint.classList.add('is-visible');
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
