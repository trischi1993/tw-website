const CAROUSEL_SELECTOR = '[data-ebook-carousel]';
const AUTOPLAY_DELAY = 5200;
const TRANSITION_DURATION = 1200;
const EFFECT_PARAMETER = 'mockup-effect';
const EFFECTS = ['spotlight', 'orbit', 'pulse', 'engagement', 'cinematic'] as const;
type EbookEffect = (typeof EFFECTS)[number];

function isEbookEffect(value: string | null): value is EbookEffect {
  return value !== null && EFFECTS.includes(value as EbookEffect);
}

function initEbookCarousels(): void {
  document.querySelectorAll<HTMLElement>(CAROUSEL_SELECTOR).forEach((carousel) => {
    if (carousel.dataset.carouselReady === 'true') return;

    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-ebook-slide]'));
    const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>('[data-ebook-carousel-dot]'));
    const previous = carousel.querySelector<HTMLButtonElement>('[data-ebook-carousel-prev]');
    const next = carousel.querySelector<HTMLButtonElement>('[data-ebook-carousel-next]');
    const current = carousel.querySelector<HTMLElement>('[data-ebook-carousel-current]');
    const tester = carousel.parentElement?.querySelector<HTMLElement>('[data-ebook-effect-tester]');
    const effectButtons = Array.from(tester?.querySelectorAll<HTMLButtonElement>('[data-ebook-effect-button]') ?? []);
    if (slides.length < 2 || !previous || !next) return;

    carousel.dataset.carouselReady = 'true';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let autoplayTimer: number | undefined;
    let isAnimating = false;
    let isInView = false;
    let isPaused = false;
    let hasPlayedScrollTransition = false;
    let effectTimer: number | undefined;
    let entranceFrame: number | undefined;
    let swipePointerId: number | undefined;
    let swipeStartX = 0;
    let swipeStartY = 0;

    const requestedEffect = new URLSearchParams(window.location.search).get(EFFECT_PARAMETER);
    let activeEffect: EbookEffect = isEbookEffect(requestedEffect) ? requestedEffect : 'spotlight';

    const enterCinematic = (): void => {
      if (activeEffect !== 'cinematic' || carousel.classList.contains('has-cinematic-entered')) return;
      carousel.classList.add('has-cinematic-entered');
    };

    const prepareCinematicEntrance = (): void => {
      if (entranceFrame !== undefined) cancelAnimationFrame(entranceFrame);

      if (activeEffect !== 'cinematic') {
        carousel.classList.remove('is-cinematic-ready', 'has-cinematic-entered');
        return;
      }

      carousel.classList.add('is-cinematic-ready');
      carousel.classList.remove('has-cinematic-entered');

      if (reducedMotion.matches) {
        enterCinematic();
        return;
      }

      // Zwei Frames garantieren, dass der tiefe Ausgangszustand zuerst
      // gezeichnet wird. So bleibt die Entrance auch beim direkten Umschalten
      // auf die Testvariante sichtbar.
      entranceFrame = requestAnimationFrame(() => {
        entranceFrame = requestAnimationFrame(() => {
          entranceFrame = undefined;
          const bounds = carousel.getBoundingClientRect();
          const viewportHeight = document.documentElement.clientHeight;
          if (bounds.top <= viewportHeight * 0.82 && bounds.bottom >= viewportHeight * 0.18) {
            enterCinematic();
          }
        });
      });
    };

    const triggerEffectTransition = (): void => {
      if (effectTimer !== undefined) window.clearTimeout(effectTimer);
      carousel.classList.remove('is-effect-changing');
      void carousel.offsetWidth;
      carousel.classList.add('is-effect-changing');
      effectTimer = window.setTimeout(() => {
        carousel.classList.remove('is-effect-changing');
        effectTimer = undefined;
      }, TRANSITION_DURATION);
    };

    const setEffect = (effect: EbookEffect, updateUrl = false): void => {
      activeEffect = effect;
      carousel.dataset.ebookEffect = effect;
      prepareCinematicEntrance();
      effectButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.ebookEffectButton === effect));
      });

      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set(EFFECT_PARAMETER, effect);
        window.history.replaceState(window.history.state, '', url);
      }
    };

    if (tester && isEbookEffect(requestedEffect)) tester.hidden = false;
    effectButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const effect = button.dataset.ebookEffectButton ?? null;
        if (!isEbookEffect(effect)) return;
        setEffect(effect, true);
        triggerEffectTransition();
      });
    });
    setEffect(activeEffect);

    const relativePosition = (index: number): number => {
      let position = (index - activeIndex + slides.length) % slides.length;
      if (position > slides.length / 2) position -= slides.length;
      return position;
    };

    const updateStage = (): void => {
      slides.forEach((slide, index) => {
        const position = relativePosition(index);
        const state = position === 0 ? '0' : position === -1 ? '-1' : position === 1 ? '1' : 'far';
        const isCurrent = state === '0';
        slide.dataset.state = state;
        slide.classList.toggle('is-active', isCurrent);
        slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });

      dots.forEach((dot, index) => {
        const isCurrent = index === activeIndex;
        dot.classList.toggle('is-active', isCurrent);
        if (isCurrent) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
    };

    const clearAutoplay = (): void => {
      if (autoplayTimer === undefined) return;
      window.clearTimeout(autoplayTimer);
      autoplayTimer = undefined;
    };

    const scheduleAutoplay = (): void => {
      clearAutoplay();
      if (reducedMotion.matches || !isInView || isPaused || document.hidden) return;
      autoplayTimer = window.setTimeout(() => {
        void show(activeIndex + 1);
      }, AUTOPLAY_DELAY);
    };

    const animateSpotlightRotation = async (
      outgoing: HTMLElement,
      incoming: HTMLElement,
      direction: 1 | -1,
      enteringBackground?: HTMLElement,
      retiringBackground?: HTMLElement,
    ): Promise<void> => {
      const frameCount = 12;
      const sideAngle = 40;
      const orbitRadius = 45;
      const transitionClearance = 26;
      const maxDepth = 12;
      const depthRange = 1 - Math.cos(sideAngle * Math.PI / 180);
      const options: KeyframeAnimationOptions = {
        duration: TRANSITION_DURATION,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'both',
      };

      const frameAtAngle = (angle: number, offset: number, extraX = 0): Keyframe => {
        const angleInRadians = angle * Math.PI / 180;
        const depth = (1 - Math.cos(angleInRadians)) / depthRange;
        const x = orbitRadius * Math.sin(angleInRadians) + extraX;
        const z = -maxDepth * depth;
        const scale = 1 - 0.22 * depth;
        const opacity = 1 - 0.38 * depth;
        const brightness = 1 - 0.38 * depth;
        const saturation = 1 - 0.18 * depth;

        return {
          offset,
          transform: `translate3d(${x.toFixed(3)}%, 0, ${z.toFixed(3)}rem) rotateY(${(-angle * 0.3).toFixed(3)}deg) scale(${scale.toFixed(4)})`,
          opacity: Number(opacity.toFixed(4)),
          filter: `brightness(${brightness.toFixed(4)}) saturate(${saturation.toFixed(4)})`,
        };
      };

      const framesFor = (isIncoming: boolean): Keyframe[] => Array.from(
        { length: frameCount + 1 },
        (_, frameIndex) => {
          const progress = frameIndex / frameCount;
          const angle = isIncoming
            ? direction * sideAngle * (1 - progress)
            : direction * -sideAngle * progress;
          const clearance = Math.sin(Math.PI * progress) * transitionClearance;
          const extraX = direction * (isIncoming ? clearance : -clearance);
          const zIndex = isIncoming
            ? progress < 0.5 ? '4' : '5'
            : progress <= 0.5 ? '5' : '3';
          return { ...frameAtAngle(angle, progress, extraX), zIndex };
        },
      );

      // Beide Geräte benutzen exakt dieselbe Kreisbahn. Ihre translateZ-Tiefe
      // bestimmt die sichtbare Ebene, daher ist kein harter z-index-Wechsel nötig.
      const incomingAnimation = incoming.animate(framesFor(true), options);
      const outgoingAnimation = outgoing.animate(framesFor(false), options);
      const backgroundAnimations: Animation[] = [];

      // Das Nachladen der äußeren Nachbarn findet ausschließlich am jeweiligen
      // Rand statt. So zieht kein drittes, transparentes Handy durch die Mitte.
      if (enteringBackground && enteringBackground !== outgoing && enteringBackground !== incoming) {
        const side = direction;
        backgroundAnimations.push(enteringBackground.animate([
          {
            transform: `translate3d(${side * 43}%, 0, -16rem) rotateY(${side * -16}deg) scale(0.7)`,
            opacity: 0,
            filter: 'brightness(0.54) saturate(0.76)',
            zIndex: '1',
          },
          {
            offset: 0.62,
            transform: `translate3d(${side * 39}%, 0, -15rem) rotateY(${side * -15}deg) scale(0.71)`,
            opacity: 0,
            filter: 'brightness(0.55) saturate(0.77)',
            zIndex: '1',
          },
          { ...frameAtAngle(side * sideAngle, 1), zIndex: '1' },
        ], options));
      }

      if (retiringBackground && retiringBackground !== outgoing && retiringBackground !== incoming) {
        const side = -direction;
        retiringBackground.style.visibility = 'visible';
        backgroundAnimations.push(retiringBackground.animate([
          { ...frameAtAngle(side * sideAngle, 0), zIndex: '1' },
          {
            offset: 0.28,
            transform: `translate3d(${side * 39}%, 0, -15rem) rotateY(${side * -15}deg) scale(0.71)`,
            opacity: 0,
            filter: 'brightness(0.55) saturate(0.77)',
            zIndex: '1',
          },
          {
            transform: `translate3d(${side * 43}%, 0, -16rem) rotateY(${side * -16}deg) scale(0.7)`,
            opacity: 0,
            filter: 'brightness(0.54) saturate(0.76)',
            zIndex: '1',
          },
        ], options));
      }

      await Promise.all([
        incomingAnimation.finished.catch(() => undefined),
        outgoingAnimation.finished.catch(() => undefined),
        ...backgroundAnimations.map((animation) => animation.finished.catch(() => undefined)),
      ]);
      incomingAnimation.cancel();
      outgoingAnimation.cancel();
      backgroundAnimations.forEach((animation) => animation.cancel());
      retiringBackground?.style.removeProperty('visibility');
    };

    const show = async (requestedIndex: number): Promise<void> => {
      if (isAnimating) return;

      const nextIndex = (requestedIndex + slides.length) % slides.length;
      if (nextIndex === activeIndex) return;

      const outgoing = slides[activeIndex];
      const incoming = slides[nextIndex];
      const forwardDistance = (nextIndex - activeIndex + slides.length) % slides.length;
      const direction: 1 | -1 = forwardDistance <= slides.length / 2 ? 1 : -1;
      const useSpotlightRotation = !reducedMotion.matches && activeEffect === 'spotlight';
      const enteringBackground = slides[(nextIndex + direction + slides.length) % slides.length];
      const retiringBackground = slides.find((slide) => slide.dataset.state === String(-direction));

      clearAutoplay();
      isAnimating = true;
      if (useSpotlightRotation) carousel.classList.add('is-spotlight-rotating');
      activeIndex = nextIndex;
      updateStage();
      triggerEffectTransition();

      if (!reducedMotion.matches) {
        if (activeEffect === 'spotlight') {
          await animateSpotlightRotation(
            outgoing,
            incoming,
            direction,
            enteringBackground,
            retiringBackground,
          );
        } else {
          await new Promise((resolve) => window.setTimeout(resolve, TRANSITION_DURATION));
        }
      }

      carousel.classList.remove('is-spotlight-rotating');
      isAnimating = false;
      scheduleAutoplay();
    };

    previous.addEventListener('click', () => void show(activeIndex - 1));
    next.addEventListener('click', () => void show(activeIndex + 1));
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => void show(index));
    });

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        void show(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        void show(activeIndex + 1);
      }
    });

    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
      if ((event.target as Element).closest('button')) return;
      swipePointerId = event.pointerId;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      isPaused = true;
      clearAutoplay();
    });

    const finishSwipe = (event: PointerEvent): void => {
      if (event.pointerId !== swipePointerId) return;
      const distanceX = event.clientX - swipeStartX;
      const distanceY = event.clientY - swipeStartY;
      swipePointerId = undefined;
      isPaused = false;

      if (Math.abs(distanceX) >= 42 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
        if (isAnimating) {
          scheduleAutoplay();
          return;
        }
        void show(activeIndex + (distanceX < 0 ? 1 : -1));
        return;
      }

      scheduleAutoplay();
    };

    carousel.addEventListener('pointerup', finishSwipe);
    carousel.addEventListener('pointercancel', (event) => {
      if (event.pointerId !== swipePointerId) return;
      swipePointerId = undefined;
      isPaused = false;
      scheduleAutoplay();
    });

    const resetVisualMotion = (): void => {
      carousel.style.setProperty('--deck-tilt-x', '0deg');
      carousel.style.setProperty('--deck-tilt-y', '0deg');
      carousel.style.setProperty('--deck-shift-x', '0px');
      carousel.style.setProperty('--deck-shift-y', '0px');
      carousel.style.setProperty('--deck-shadow-x', '0px');
      carousel.style.setProperty('--deck-shadow-y', '1.75rem');
      carousel.style.setProperty('--effect-light-x', '0px');
      carousel.style.setProperty('--effect-light-y', '0px');
      carousel.style.setProperty('--engagement-near-x', '0px');
      carousel.style.setProperty('--engagement-near-y', '0px');
      carousel.style.setProperty('--engagement-far-x', '0px');
      carousel.style.setProperty('--engagement-far-y', '0px');
    };

    carousel.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      if ((event.target as Element).closest('.ebook-results-carousel__controls')) {
        carousel.classList.remove('is-tilting');
        resetVisualMotion();
        return;
      }

      carousel.classList.add('is-tilting');
      const bounds = carousel.getBoundingClientRect();
      const x = Math.min(0.5, Math.max(-0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
      const y = Math.min(0.5, Math.max(-0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
      carousel.style.setProperty('--deck-tilt-x', `${(-y * 6).toFixed(2)}deg`);
      carousel.style.setProperty('--deck-tilt-y', `${(x * 10).toFixed(2)}deg`);
      carousel.style.setProperty('--deck-shift-x', `${(x * 8).toFixed(1)}px`);
      carousel.style.setProperty('--deck-shift-y', `${(y * 5).toFixed(1)}px`);
      carousel.style.setProperty('--deck-shadow-x', `${(-x * 18).toFixed(1)}px`);
      carousel.style.setProperty('--deck-shadow-y', `${(28 - y * 10).toFixed(1)}px`);
      carousel.style.setProperty('--effect-light-x', `${(x * 24).toFixed(1)}px`);
      carousel.style.setProperty('--effect-light-y', `${(y * 16).toFixed(1)}px`);
      carousel.style.setProperty('--engagement-near-x', `${(-x * 34).toFixed(1)}px`);
      carousel.style.setProperty('--engagement-near-y', `${(-y * 24).toFixed(1)}px`);
      carousel.style.setProperty('--engagement-far-x', `${(x * 16).toFixed(1)}px`);
      carousel.style.setProperty('--engagement-far-y', `${(y * 12).toFixed(1)}px`);
    });

    carousel.addEventListener('pointerenter', () => {
      isPaused = true;
      clearAutoplay();
    });
    carousel.addEventListener('pointerleave', () => {
      carousel.classList.remove('is-tilting');
      isPaused = false;
      resetVisualMotion();
      scheduleAutoplay();
    });
    carousel.addEventListener('focusin', () => {
      isPaused = true;
      clearAutoplay();
    });
    carousel.addEventListener('focusout', () => {
      isPaused = false;
      scheduleAutoplay();
    });

    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      carousel.classList.toggle('is-in-view', isInView);

      if (isInView && !hasPlayedScrollTransition) {
        hasPlayedScrollTransition = true;
        clearAutoplay();
        if (!reducedMotion.matches) void show(activeIndex + 1);
        return;
      }

      scheduleAutoplay();
    }, { threshold: [0, 0.35, 0.7] });
    observer.observe(carousel);

    const entranceObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) enterCinematic();
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });
    entranceObserver.observe(carousel);

    document.addEventListener('visibilitychange', scheduleAutoplay);
    reducedMotion.addEventListener('change', scheduleAutoplay);
    updateStage();
  });
}

initEbookCarousels();
document.addEventListener('astro:page-load', initEbookCarousels);
