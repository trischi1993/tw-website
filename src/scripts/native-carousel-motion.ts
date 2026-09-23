const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isNearViewport = (element: HTMLElement, margin = 40) => {
  const bounds = element.getBoundingClientRect();
  return bounds.bottom >= -margin && bounds.top <= window.innerHeight + margin;
};

export interface NativeCarouselMotion {
  beginManual(): void;
  finishManual(): void;
  pauseFor(milliseconds: number): void;
}

/**
 * Bewegt einen Carousel-Track mit der nativen Web-Animations-Engine. Anders
 * als ein pro requestAnimationFrame gesetztes scrollLeft kann der Browser die
 * Translation auf dem Compositor und mit der echten Display-Frequenz zeichnen.
 * Vor jeder manuellen Eingabe wird die sichtbare Position verlustfrei zurück
 * in den nativen Scroll-Container übertragen.
 */
export function createNativeCarouselMotion(
  carousel: HTMLElement,
  track: HTMLElement,
  speed = 22,
): NativeCarouselMotion {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileLayout = window.matchMedia(
    '(max-width: 767px), (max-width: 950px) and (max-height: 500px) and (orientation: landscape)',
  );
  const animationSupported = typeof track.animate === 'function';
  const enabled = () => animationSupported
    && !reducedMotion.matches
    && hoverCapable.matches
    && !mobileLayout.matches;

  let animation: Animation | null = null;
  let resumeTimer = 0;
  let direction = 1;
  let visible = isNearViewport(carousel);
  let hoverHeld = false;
  let manualHeld = false;
  let transformMode = false;
  let settledPosition = carousel.scrollLeft;

  const maxScroll = () => Math.max(0, carousel.scrollWidth - carousel.clientWidth);
  const clearResumeTimer = () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };
  const setTrackPosition = (position: number) => {
    settledPosition = clamp(position, 0, maxScroll());
    track.style.transform = `translate3d(${-settledPosition}px, 0, 0)`;
  };
  const readTrackPosition = () => {
    if (!transformMode) return carousel.scrollLeft;
    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === 'none') return settledPosition;

    try {
      return clamp(-new DOMMatrixReadOnly(transform).m41, 0, maxScroll());
    } catch {
      return settledPosition;
    }
  };
  const stopAnimation = () => {
    animation?.cancel();
    animation = null;
    carousel.classList.remove('is-auto-scrolling');
  };
  const enterTransformMode = () => {
    if (transformMode) return;
    const position = clamp(carousel.scrollLeft, 0, maxScroll());
    // Beide Schreibvorgänge laufen im selben Task: Der sichtbare Inhalt bleibt
    // am exakt gleichen Ort, nur die technische Bewegungsart wechselt.
    setTrackPosition(position);
    carousel.scrollLeft = 0;
    transformMode = true;
  };
  const commitToNativeScroll = () => {
    if (!transformMode) return;
    const position = readTrackPosition();
    stopAnimation();
    carousel.scrollLeft = position;
    track.style.removeProperty('transform');
    settledPosition = position;
    transformMode = false;
  };

  const canRun = () => enabled() && visible && !hoverHeld && !manualHeld;
  const start = () => {
    clearResumeTimer();
    if (!canRun()) return;

    enterTransformMode();
    const limit = maxScroll();
    if (limit <= 1) return;

    const from = readTrackPosition();
    const to = direction > 0 ? limit : 0;
    const distance = Math.abs(to - from);
    if (distance <= 0.5) {
      direction *= -1;
      resumeTimer = window.setTimeout(start, 850);
      return;
    }

    stopAnimation();
    carousel.classList.add('is-auto-scrolling');
    animation = track.animate(
      [
        { transform: `translate3d(${-from}px, 0, 0)` },
        { transform: `translate3d(${-to}px, 0, 0)` },
      ],
      {
        duration: (distance / speed) * 1000,
        easing: 'linear',
        fill: 'forwards',
      },
    );
    const current = animation;
    current.onfinish = () => {
      if (animation !== current) return;
      animation = null;
      carousel.classList.remove('is-auto-scrolling');
      current.cancel();
      setTrackPosition(to);
      direction *= -1;
      resumeTimer = window.setTimeout(start, 850);
    };
  };
  const scheduleStart = (milliseconds: number) => {
    clearResumeTimer();
    if (!canRun()) return;
    resumeTimer = window.setTimeout(start, milliseconds);
  };
  const pauseFor = (milliseconds: number) => {
    clearResumeTimer();
    commitToNativeScroll();
    scheduleStart(milliseconds);
  };
  const beginManual = () => {
    manualHeld = true;
    clearResumeTimer();
    commitToNativeScroll();
  };
  const finishManual = () => {
    manualHeld = false;
    scheduleStart(800);
  };

  if (!animationSupported) return { beginManual, finishManual, pauseFor };

  const updateMode = () => {
    if (enabled()) {
      carousel.classList.add('has-auto-scroll');
      scheduleStart(180);
      return;
    }
    clearResumeTimer();
    commitToNativeScroll();
    carousel.classList.remove('has-auto-scroll');
  };

  reducedMotion.addEventListener('change', updateMode);
  hoverCapable.addEventListener('change', updateMode);
  mobileLayout.addEventListener('change', updateMode);
  carousel.addEventListener('pointerenter', () => {
    hoverHeld = true;
    clearResumeTimer();
    commitToNativeScroll();
  });
  carousel.addEventListener('pointerleave', () => {
    hoverHeld = false;
    scheduleStart(300);
  });
  carousel.addEventListener('wheel', () => pauseFor(950), { passive: true });
  window.addEventListener('resize', () => pauseFor(180), { passive: true });

  if (typeof window.IntersectionObserver === 'function') {
    new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) scheduleStart(180);
        else {
          clearResumeTimer();
          commitToNativeScroll();
        }
      },
      { rootMargin: '40px 0px', threshold: 0 },
    ).observe(carousel);
  } else {
    const updateVisibility = () => {
      const nextVisible = isNearViewport(carousel);
      if (nextVisible === visible) return;
      visible = nextVisible;
      if (visible) scheduleStart(180);
      else {
        clearResumeTimer();
        commitToNativeScroll();
      }
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
  }

  updateMode();
  return { beginManual, finishManual, pauseFor };
}
