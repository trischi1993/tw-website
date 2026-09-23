import { preloadCarouselImages } from './carousel-image-preload';
import { createNativeCarouselMotion } from './native-carousel-motion';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const track = carousel.querySelector<HTMLElement>('[data-carousel-track]');
  if (!track || track.children.length < 2) return;

  carousel.dataset.homeProofCarouselReady = '1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  preloadCarouselImages(carousel, '.home-proof-card__media img');
  const motion = createNativeCarouselMotion(carousel, track);
  const jumpButtons = Array.from(
    carousel.closest<HTMLElement>('[data-home-proof]')
      ?.querySelectorAll<HTMLButtonElement>('[data-proof-jump]') ?? [],
  );

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

    motion.pauseFor(2600);
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
    setActiveJump(kind);
    carousel.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  jumpButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.proofJump;
      if (kind === 'own' || kind === 'customer') jumpToKind(kind);
    });
  });
  enableMouseDrag(carousel, motion.beginManual, motion.finishManual);
}

document
  .querySelectorAll<HTMLElement>('[data-home-proof-carousel]')
  .forEach(initAutoCarousel);

export {};
