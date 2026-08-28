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
    startScrollLeft = carousel.scrollLeft;
    moved = false;
    begin();
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

/** Bedienlogik aus dem Carousel „Weitere Kundenerfolge“ der AIO-Seite. */
function initAutoCarousel(carousel: HTMLElement): void {
  if (carousel.dataset.homeProofCarouselReady === '1') return;
  if (carousel.children.length < 2) return;

  carousel.dataset.homeProofCarouselReady = '1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) carousel.classList.add('has-auto-scroll');
  const speed = 22;
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let direction = 1;
  let visible = isNearViewport(carousel, 40);
  let resumeAt = 0;
  let lastTime = 0;
  let pointerHeld = false;
  let touchHeld = false;
  let hoverHeld = false;
  let manualSession = false;
  let manualSettleAt = 0;
  let jumpLockUntil = 0;
  let autoScrolling = false;
  let position = carousel.scrollLeft;
  const jumpButtons = Array.from(
    carousel.closest<HTMLElement>('[data-home-proof]')
      ?.querySelectorAll<HTMLButtonElement>('[data-proof-jump]') ?? [],
  );

  const syncPosition = () => {
    position = carousel.scrollLeft;
  };
  const setAutoScrolling = (active: boolean) => {
    if (autoScrolling === active) return;
    autoScrolling = active;
    carousel.classList.toggle('is-auto-scrolling', active);
  };
  const pauseFor = (milliseconds: number) => {
    setAutoScrolling(false);
    syncPosition();
    resumeAt = Math.max(resumeAt, performance.now() + milliseconds);
  };
  const setActiveJump = (kind: 'own' | 'customer') => {
    jumpButtons.forEach((button) => {
      const active = button.dataset.proofJump === kind;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  const jumpToKind = (kind: 'own' | 'customer') => {
    const card = carousel.querySelector<HTMLElement>(`[data-result-kind="${kind}"]`);
    if (!card) return;

    const carouselBounds = carousel.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const scrollPaddingStart = Number.parseFloat(
      window.getComputedStyle(carousel).scrollPaddingLeft,
    ) || 0;
    const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    const target = clamp(
      carousel.scrollLeft + cardBounds.left - carouselBounds.left - scrollPaddingStart,
      0,
      maxScroll,
    );
    const now = performance.now();

    manualSession = true;
    manualSettleAt = now + 700;
    jumpLockUntil = now + 2600;
    resumeAt = jumpLockUntil;
    direction = 1;
    setAutoScrolling(false);
    setActiveJump(kind);
    carousel.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const beginManual = (source: 'pointer' | 'touch' | 'wheel') => {
    if (source === 'pointer') pointerHeld = true;
    if (source === 'touch') touchHeld = true;
    manualSession = true;
    manualSettleAt = Number.POSITIVE_INFINITY;
    jumpLockUntil = 0;
    resumeAt = Number.POSITIVE_INFINITY;
    syncPosition();
    setAutoScrolling(false);
  };
  const finishManual = (source: 'pointer' | 'touch') => {
    if (source === 'pointer') pointerHeld = false;
    if (source === 'touch') touchHeld = false;
    syncPosition();
    if (pointerHeld || touchHeld) return;
    const now = performance.now();
    manualSettleAt = now + 280;
    resumeAt = Math.max(now + 800, jumpLockUntil);
  };
  const updateVisibility = (nextVisible: boolean) => {
    if (nextVisible === visible) return;
    visible = nextVisible;
    lastTime = 0;
    position = carousel.scrollLeft;
    if (visible) pauseFor(180);
    else setAutoScrolling(false);
  };
  const tick = (now: number) => {
    window.requestAnimationFrame(tick);
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
    setAutoScrolling(true);

    if (direction < 0 && next <= 0.5) {
      direction = 1;
      pauseFor(850);
    } else if (direction > 0 && next >= maxScroll - 0.5) {
      direction = -1;
      pauseFor(850);
    }
  };

  if (typeof window.IntersectionObserver === 'function') {
    new IntersectionObserver(
      ([entry]) => updateVisibility(Boolean(entry?.isIntersecting)),
      { rootMargin: '40px 0px', threshold: 0 },
    ).observe(carousel);
  } else {
    window.addEventListener('scroll', () => updateVisibility(isNearViewport(carousel, 40)), {
      passive: true,
    });
    window.addEventListener('resize', () => updateVisibility(isNearViewport(carousel, 40)), {
      passive: true,
    });
  }
  jumpButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.proofJump;
      if (kind === 'own' || kind === 'customer') jumpToKind(kind);
    });
  });
  if (hoverCapable) {
    carousel.addEventListener('pointerenter', () => {
      hoverHeld = true;
      syncPosition();
      setAutoScrolling(false);
    });
    carousel.addEventListener('pointerleave', () => {
      hoverHeld = false;
      pauseFor(300);
    });
  }

  enableMouseDrag(
    carousel,
    () => beginManual('pointer'),
    () => finishManual('pointer'),
  );
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
    resumeAt = jumpLockUntil > now ? jumpLockUntil : now + 800;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (touchHeld) finishManual('touch');
  }, { passive: true });
  window.addEventListener('touchcancel', () => {
    if (touchHeld) finishManual('touch');
  }, { passive: true });

  if (!reducedMotion) window.requestAnimationFrame(tick);
}

document
  .querySelectorAll<HTMLElement>('[data-home-proof-carousel]')
  .forEach(initAutoCarousel);

export {};
