const COUNTER_GROUP_SELECTOR = '.ebook-author__stats';
const COUNTER_SELECTOR = '[data-ebook-count]';
const DURATION = 1400;

function initEbookCountUp(): void {
  document.querySelectorAll<HTMLElement>(COUNTER_GROUP_SELECTOR).forEach((group) => {
    if (group.dataset.countUpReady === 'true') return;

    const counters = Array.from(group.querySelectorAll<HTMLElement>(COUNTER_SELECTOR))
      .map((element) => ({
        element,
        target: Number(element.dataset.ebookCount),
        suffix: element.dataset.ebookCountSuffix ?? '',
      }))
      .filter(({ target }) => Number.isFinite(target) && target >= 0);

    if (counters.length === 0) return;
    group.dataset.countUpReady = 'true';

    const showFinalValues = (): void => {
      counters.forEach(({ element, target, suffix }) => {
        element.textContent = `${target}${suffix}`;
      });
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      showFinalValues();
      return;
    }

    counters.forEach(({ element, suffix }) => {
      element.textContent = `0${suffix}`;
    });

    const animate = (): void => {
      const startedAt = performance.now();

      const update = (now: number): void => {
        const progress = Math.min(1, (now - startedAt) / DURATION);

        counters.forEach(({ element, target, suffix }) => {
          const value = Math.min(target, Math.round(target * progress));
          element.textContent = `${value}${suffix}`;
        });

        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        if (reducedMotion.matches) showFinalValues();
        else animate();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.25 },
    );

    observer.observe(group);
  });
}

initEbookCountUp();
document.addEventListener('astro:page-load', initEbookCountUp);
