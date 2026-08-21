const setupMessageWall = (wall: HTMLElement) => {
  if (wall.dataset.messageWallReady === 'true') return;
  wall.dataset.messageWallReady = 'true';

  const messages = [...wall.querySelectorAll<HTMLElement>('[data-ebook-message]')];
  const dots = [...wall.querySelectorAll<HTMLElement>('[data-ebook-message-dot]')];
  const deck = wall.querySelector<HTMLElement>('[data-ebook-message-deck]');
  const previousButton = wall.querySelector<HTMLButtonElement>('[data-ebook-message-prev]');
  const nextButton = wall.querySelector<HTMLButtonElement>('[data-ebook-message-next]');
  const indexLabel = wall.querySelector<HTMLElement>('[data-ebook-message-index]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const digits = Number(wall.dataset.messageDigits ?? '2');

  if (!messages.length) return;

  let activeIndex = 0;
  let rotationTimer: number | undefined;
  let isInView = false;
  let isHoverPaused = false;
  let isTapPaused = false;
  let lastPointerWasTouch = false;
  const autoplayDelay = 2500;
  const touchInput = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)');

  const relativePosition = (index: number) => {
    let offset = (index - activeIndex + messages.length) % messages.length;
    if (offset > Math.floor(messages.length / 2)) offset -= messages.length;
    return offset >= -5 && offset <= 5 ? String(offset) : 'hidden';
  };

  const render = () => {
    messages.forEach((message, index) => {
      const isActive = index === activeIndex;
      message.dataset.state = relativePosition(index);
      message.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
    if (indexLabel) indexLabel.textContent = String(activeIndex + 1).padStart(digits, '0');
  };

  const move = (direction: 1 | -1) => {
    activeIndex = (activeIndex + direction + messages.length) % messages.length;
    render();
  };

  const stopRotation = () => {
    if (rotationTimer !== undefined) window.clearInterval(rotationTimer);
    rotationTimer = undefined;
    wall.classList.remove('is-playing');
  };

  const canRotate = () =>
    messages.length > 1
    && isInView
    && !isHoverPaused
    && !isTapPaused
    && !reduceMotion.matches
    && document.visibilityState === 'visible';

  const startRotation = () => {
    if (!canRotate() || rotationTimer !== undefined) return;
    wall.classList.add('is-playing');
    rotationTimer = window.setInterval(() => move(1), autoplayDelay);
  };

  const syncRotation = () => {
    if (canRotate()) startRotation();
    else stopRotation();
  };

  const restartRotation = () => {
    stopRotation();
    startRotation();
  };

  wall.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch' || touchInput.matches) return;
    isHoverPaused = true;
    wall.classList.add('is-hover-paused');
    syncRotation();
  });

  wall.addEventListener('pointerleave', () => {
    isHoverPaused = false;
    wall.classList.remove('is-hover-paused');
    syncRotation();
  });

  deck?.addEventListener('pointerdown', (event) => {
    lastPointerWasTouch = event.pointerType === 'touch';
  });

  deck?.addEventListener('click', () => {
    if (lastPointerWasTouch || touchInput.matches) {
      isTapPaused = !isTapPaused;
      wall.classList.toggle('is-tap-paused', isTapPaused);
      const tapHint = wall.querySelector<HTMLElement>('[data-ebook-message-tap-hint]');
      if (tapHint) {
        tapHint.textContent = isTapPaused
          ? 'Pausiert · Erneut tippen zum Fortsetzen'
          : 'Läuft automatisch · Tippen zum Pausieren';
      }
      lastPointerWasTouch = false;
      syncRotation();
      return;
    }

    move(1);
    restartRotation();
  });

  previousButton?.addEventListener('click', () => {
    move(-1);
    restartRotation();
  });

  nextButton?.addEventListener('click', () => {
    move(1);
    restartRotation();
  });

  wall.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
    restartRotation();
  });

  reduceMotion.addEventListener('change', syncRotation);
  document.addEventListener('visibilitychange', syncRotation);

  const observer = new IntersectionObserver(([entry]) => {
    isInView = entry?.isIntersecting ?? false;
    syncRotation();
  }, {
    threshold: 0.25,
  });
  observer.observe(wall);

  document.addEventListener('astro:before-swap', () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', syncRotation);
    stopRotation();
  }, { once: true });
  render();
};

const setupMessageWalls = () => {
  document.querySelectorAll<HTMLElement>('[data-ebook-message-wall]').forEach(setupMessageWall);
};

setupMessageWalls();
document.addEventListener('astro:page-load', setupMessageWalls);
