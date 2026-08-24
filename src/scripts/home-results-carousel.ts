const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isNearViewport = (element: HTMLElement, margin = 80) => {
  const bounds = element.getBoundingClientRect();
  return bounds.bottom >= -margin && bounds.top <= window.innerHeight + margin;
};

/** Bedienlogik aus dem Carousel „Weitere Kundenerfolge“ der AIO-Seite. */
function initAutoCarousel(carousel: HTMLElement): void {
  if (carousel.dataset.homeProofCarouselReady === '1') return;
  if (carousel.children.length < 2) return;

  carousel.dataset.homeProofCarouselReady = '1';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  carousel.classList.add('has-auto-scroll');
  const speed = 22;
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let direction = 1;
  let visible = isNearViewport(carousel, 40);
  let resumeAt = 0;
  let lastTime = 0;
  let visibilityCheckedAt = 0;
  let pointerHeld = false;
  let touchHeld = false;
  let hoverHeld = false;
  let manualSession = false;
  let manualSettleAt = 0;
  let position = carousel.scrollLeft;

  const syncPosition = () => {
    position = carousel.scrollLeft;
  };
  const pauseFor = (milliseconds: number) => {
    syncPosition();
    resumeAt = Math.max(resumeAt, performance.now() + milliseconds);
  };
  const beginManual = (source: 'pointer' | 'touch' | 'wheel') => {
    if (source === 'pointer') pointerHeld = true;
    if (source === 'touch') touchHeld = true;
    manualSession = true;
    manualSettleAt = Number.POSITIVE_INFINITY;
    resumeAt = Number.POSITIVE_INFINITY;
    syncPosition();
    carousel.classList.remove('is-auto-scrolling');
  };
  const finishManual = (source: 'pointer' | 'touch') => {
    if (source === 'pointer') pointerHeld = false;
    if (source === 'touch') touchHeld = false;
    syncPosition();
    if (pointerHeld || touchHeld) return;
    const now = performance.now();
    manualSettleAt = now + 280;
    resumeAt = now + 800;
  };
  const updateVisibility = () => {
    const nextVisible = isNearViewport(carousel, 40);
    if (nextVisible === visible) return;
    visible = nextVisible;
    lastTime = 0;
    position = carousel.scrollLeft;
    if (visible) pauseFor(180);
    else carousel.classList.remove('is-auto-scrolling');
  };
  const tick = () => {
    const now = performance.now();
    if (now - visibilityCheckedAt >= 250) {
      visibilityCheckedAt = now;
      updateVisibility();
    }
    if (!lastTime) lastTime = now;
    const delta = Math.min(50, now - lastTime);
    lastTime = now;
    if (!visible || pointerHeld || touchHeld || hoverHeld) return;
    if (manualSession) {
      if (now < manualSettleAt) return;
      manualSession = false;
      syncPosition();
      resumeAt = Math.max(resumeAt, now + 180);
      return;
    }
    if (now < resumeAt) return;

    const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    if (maxScroll <= 1) return;
    const next = clamp(position + direction * speed * delta / 1000, 0, maxScroll);
    position = next;
    carousel.scrollLeft = next;
    carousel.classList.add('is-auto-scrolling');

    if (direction < 0 && next <= 0.5) {
      direction = 1;
      pauseFor(850);
    } else if (direction > 0 && next >= maxScroll - 0.5) {
      direction = -1;
      pauseFor(850);
    }
  };

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility, { passive: true });
  if (hoverCapable) {
    carousel.addEventListener('pointerenter', () => {
      hoverHeld = true;
      syncPosition();
      carousel.classList.remove('is-auto-scrolling');
    });
    carousel.addEventListener('pointerleave', () => {
      hoverHeld = false;
      pauseFor(300);
    });
  }

  carousel.addEventListener('pointerdown', () => beginManual('pointer'), { passive: true });
  carousel.addEventListener('pointerup', () => finishManual('pointer'), { passive: true });
  carousel.addEventListener('pointercancel', () => finishManual('pointer'), { passive: true });
  carousel.addEventListener('touchstart', () => beginManual('touch'), { passive: true });
  carousel.addEventListener('touchend', () => finishManual('touch'), { passive: true });
  carousel.addEventListener('touchcancel', () => finishManual('touch'), { passive: true });
  carousel.addEventListener('wheel', () => {
    beginManual('wheel');
    const now = performance.now();
    manualSettleAt = now + 280;
    resumeAt = now + 950;
  }, { passive: true });
  carousel.addEventListener('scroll', () => {
    if (!manualSession) return;
    syncPosition();
    if (pointerHeld || touchHeld) return;
    const now = performance.now();
    manualSettleAt = now + 280;
    resumeAt = now + 800;
  }, { passive: true });
  window.addEventListener('pointerup', () => {
    if (pointerHeld) finishManual('pointer');
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (touchHeld) finishManual('touch');
  }, { passive: true });
  window.addEventListener('touchcancel', () => {
    if (touchHeld) finishManual('touch');
  }, { passive: true });

  window.setInterval(tick, 16);
}

document
  .querySelectorAll<HTMLElement>('[data-home-proof-carousel]')
  .forEach(initAutoCarousel);

export {};
