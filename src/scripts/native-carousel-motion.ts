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
 * Beim reinen Hover bleibt dieselbe transformierte Ebene stehen, damit beim
 * Pausieren kein sichtbarer Darstellungswechsel entsteht. Erst vor einer
 * echten manuellen Eingabe wird die sichtbare Position verlustfrei zurück in
 * den nativen Scroll-Container übertragen.
 */
export function createNativeCarouselMotion(
  carousel: HTMLElement,
  track: HTMLElement,
  speed = 22,
): NativeCarouselMotion {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animationSupported = typeof track.animate === 'function';
  const enabled = () => animationSupported
    && !reducedMotion.matches;

  let animation: Animation | null = null;
  let resumeTimer = 0;
  let direction = 1;
  let visible = isNearViewport(carousel);
  let hoverHeld = false;
  let manualHeld = false;
  let manualMoved = false;
  let manualSettling = false;
  let manualStartPosition = carousel.scrollLeft;
  let touchStartX = 0;
  let touchStartY = 0;
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
    carousel.classList.add('has-auto-scroll');
    setTrackPosition(position);
    carousel.scrollLeft = 0;
    transformMode = true;
  };
  const commitToNativeScroll = () => {
    if (!transformMode) return;
    const position = readTrackPosition();
    stopAnimation();
    // Die Translation muss vor scrollLeft entfernt werden. Andernfalls
    // berechnet WebKit die Scroll-Snap-Punkte aus der noch transformierten
    // Track-Geometrie und versetzt die Karten beim Handoff sichtbar.
    track.style.removeProperty('transform');
    transformMode = false;
    carousel.scrollLeft = position;
    settledPosition = position;
  };
  const freezeTransformPosition = () => {
    if (!transformMode) return;
    const position = readTrackPosition();
    stopAnimation();
    setTrackPosition(position);
  };

  const canRun = () => enabled() && visible && !hoverHeld && !manualHeld;
  const start = () => {
    clearResumeTimer();
    if (!canRun()) return;
    manualSettling = false;

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
    if (manualHeld) return;
    manualHeld = true;
    manualMoved = false;
    manualSettling = false;
    clearResumeTimer();
    commitToNativeScroll();
    manualStartPosition = carousel.scrollLeft;
  };
  const finishManual = () => {
    if (!manualHeld) return;
    manualHeld = false;
    manualSettling = manualMoved;
    if (manualMoved) carousel.classList.remove('has-auto-scroll');
    scheduleStart(manualMoved ? 1100 : 500);
  };

  if (!animationSupported) return { beginManual, finishManual, pauseFor };

  const updateMode = () => {
    if (enabled()) {
      scheduleStart(180);
      return;
    }
    clearResumeTimer();
    commitToNativeScroll();
    carousel.classList.remove('has-auto-scroll');
  };

  reducedMotion.addEventListener('change', updateMode);
  hoverCapable.addEventListener('change', () => {
    if (hoverCapable.matches) return;
    hoverHeld = false;
    scheduleStart(180);
  });
  carousel.addEventListener('pointerenter', () => {
    if (!hoverCapable.matches) return;
    hoverHeld = true;
    clearResumeTimer();
    freezeTransformPosition();
  });
  carousel.addEventListener('pointerleave', () => {
    if (!hoverCapable.matches) return;
    hoverHeld = false;
    scheduleStart(300);
  });
  carousel.addEventListener('wheel', () => pauseFor(950), { passive: true });
  carousel.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    beginManual();
  }, { passive: true });
  carousel.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch || !manualHeld) return;
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > 4 && Math.abs(deltaX) > Math.abs(deltaY)) manualMoved = true;
  }, { passive: true });
  carousel.addEventListener('touchend', () => finishManual(), { passive: true });
  carousel.addEventListener('touchcancel', () => finishManual(), { passive: true });
  carousel.addEventListener('scroll', () => {
    if (transformMode) return;
    settledPosition = carousel.scrollLeft;
    if (manualHeld) {
      if (Math.abs(carousel.scrollLeft - manualStartPosition) > 2) manualMoved = true;
      return;
    }
    if (manualSettling && enabled() && visible) scheduleStart(950);
  }, { passive: true });
  window.addEventListener('resize', () => {
    clearResumeTimer();
    freezeTransformPosition();
    scheduleStart(240);
  }, { passive: true });

  if (typeof window.IntersectionObserver === 'function') {
    new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) scheduleStart(180);
        else {
          clearResumeTimer();
          commitToNativeScroll();
          carousel.classList.remove('has-auto-scroll');
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
        carousel.classList.remove('has-auto-scroll');
      }
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
  }

  updateMode();
  return { beginManual, finishManual, pauseFor };
}
