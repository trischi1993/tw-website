const PRELOAD_MARGIN = 1800;

const isNearViewport = (element: HTMLElement) => {
  const bounds = element.getBoundingClientRect();
  return (
    bounds.bottom >= -PRELOAD_MARGIN
    && bounds.top <= window.innerHeight + PRELOAD_MARGIN
  );
};

/**
 * Horizontally off-screen images are treated as far away by native lazy
 * loading. Start fetching a carousel's screenshots shortly before the whole
 * section reaches the viewport so a fast swipe cannot outrun the requests.
 */
export function preloadCarouselImages(
  carousel: HTMLElement,
  imageSelector: string,
): void {
  const images = Array.from(
    carousel.querySelectorAll<HTMLImageElement>(imageSelector),
  );
  if (!images.length) return;

  let started = false;
  let observer: IntersectionObserver | null = null;

  const preload = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    window.removeEventListener('scroll', checkFallback);
    window.removeEventListener('resize', checkFallback);

    images.forEach((image) => {
      image.loading = 'eager';
    });
  };

  const checkFallback = () => {
    if (isNearViewport(carousel)) preload();
  };

  if (isNearViewport(carousel)) {
    preload();
    return;
  }

  if (typeof window.IntersectionObserver === 'function') {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) preload();
      },
      { rootMargin: `${PRELOAD_MARGIN}px 0px`, threshold: 0 },
    );
    observer.observe(carousel);
    return;
  }

  window.addEventListener('scroll', checkFallback, { passive: true });
  window.addEventListener('resize', checkFallback, { passive: true });
}
