/* Kritische AIO-Scroll-Reveals ohne GSAP/ScrollTrigger.
   Dieses kleine Modul ist absichtlich abhaengigkeitsfrei: Die ersten
   Einblendungen sind schon beim ersten Wisch bereit, ohne den Hauptthread in
   derselben Phase wie den ersten Menue-Tap mit dem grossen Motion-Bundle zu
   belegen. Spaeter uebernimmt motion.ts alle noch nicht behandelten Elemente. */

const root = document.documentElement;
const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const OUT_QUART = 'cubic-bezier(0.165, 0.84, 0.44, 1)';
const activeAnimations = new Set<Animation>();
const resultBulletFinalizers = new Set<() => void>();

const TEXT_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'dt',
  'dd',
  'figcaption',
  'button',
  'a',
  'label',
  'span',
  'strong',
  'small',
  's',
  '[data-reveal-blur-text]',
].join(',');

function play(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation {
  const animation = element.animate(keyframes, { fill: 'both', ...options });
  activeAnimations.add(animation);
  const forget = () => activeAnimations.delete(animation);
  animation.addEventListener('finish', forget, { once: true });
  animation.addEventListener('cancel', forget, { once: true });
  return animation;
}

function observeOnce(element: HTMLElement, offset: number, enter: () => void): void {
  const safeOffset = Math.max(0, Math.min(49, offset));
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        enter();
      },
      {
        rootMargin: `-${safeOffset}% 0px -${safeOffset}% 0px`,
        threshold: 0,
      },
    );
    observer.observe(element);
    return;
  }

  let frame: number | undefined;
  const check = () => {
    frame = undefined;
    const bounds = element.getBoundingClientRect();
    const viewport = document.documentElement;
    const inset = viewport.clientHeight * (safeOffset / 100);
    if (
      bounds.left <= viewport.clientWidth &&
      bounds.right >= 0 &&
      bounds.top <= viewport.clientHeight - inset &&
      bounds.bottom >= inset
    ) {
      cleanup();
      enter();
    }
  };
  const schedule = () => {
    if (frame === undefined) frame = requestAnimationFrame(check);
  };
  const cleanup = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
}

function textTargets(element: HTMLElement): HTMLElement[] {
  const candidates = element.matches(TEXT_SELECTOR)
    ? [element]
    : Array.from(element.querySelectorAll<HTMLElement>(TEXT_SELECTOR));
  const eligible = candidates.filter((candidate) => {
    if (!candidate.textContent?.trim()) return false;
    if (candidate.closest('[aria-hidden="true"]')) return false;
    return candidate.closest<HTMLElement>('[data-anim="reveal"]') === element;
  });
  return eligible.filter(
    (candidate) =>
      !eligible.some((parent) => parent !== candidate && parent.contains(candidate)),
  );
}

function initGenericReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="reveal"]').forEach((element) => {
    if (element.hasAttribute('data-aio-native-reveal')) return;
    element.setAttribute('data-aio-native-reveal', '');

    const delay = (Number.parseFloat(element.dataset.delay ?? '') || 0) * 1000;
    const parsedDuration = Number.parseFloat(element.dataset.duration ?? '');
    const duration = (Number.isFinite(parsedDuration) ? parsedDuration : 0.8) * 1000;
    const parsedOffset = Number.parseFloat(element.dataset.offset ?? '');
    const offset = Number.isFinite(parsedOffset) ? parsedOffset : 16;
    const blurTargets = element.hasAttribute('data-reveal-no-blur')
      ? []
      : textTargets(element);
    const isResultBullets = element.matches('.aio-results__outcomes > ul');
    if (isResultBullets) element.setAttribute('data-aio-result-list', '');

    element.style.opacity = '0';
    element.style.transform = 'translate3d(0, 1rem, 0)';
    blurTargets.forEach((target) => {
      target.style.filter = 'blur(3.5px)';
    });

    const reveal = () => {
      element.setAttribute('data-aio-native-revealed', '');
      if (isResultBullets && element.hasAttribute('data-aio-orientation-final')) {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
        blurTargets.forEach((target) => {
          target.style.removeProperty('filter');
          target.style.removeProperty('will-change');
        });
        return;
      }
      const animations = [
        play(element, [{ opacity: 0 }, { opacity: 1 }], {
          duration,
          delay,
          easing: EASE,
        }),
        play(
          element,
          [
            { transform: 'translate3d(0, 1rem, 0)' },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          { duration, delay, easing: OUT_QUART },
        ),
        ...blurTargets.map((target) =>
          play(
            target,
            [
              { filter: 'blur(3.5px)', offset: 0 },
              { filter: 'blur(1.15px)', offset: 0.62 },
              { filter: 'blur(0.001px)', offset: 1 },
            ],
            { duration: Math.max(duration, 900), delay, easing: EASE },
          ),
        ),
      ];

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (isResultBullets) resultBulletFinalizers.delete(finish);

        // Den nativen Endzustand zuerst unter die Animation legen. Erst dann
        // werden die WebKit-Layer entfernt; so existiert beim Canceln kein
        // einzelner Paint mit dem alten Blur-/Opacity-Startzustand.
        element.style.opacity = '1';
        element.style.transform = 'none';
        blurTargets.forEach((target) => {
          target.style.filter = 'none';
          target.style.removeProperty('will-change');
        });
        animations.forEach((animation) => {
          if (animation.playState !== 'idle') animation.cancel();
        });
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
        blurTargets.forEach((target) => target.style.removeProperty('filter'));
      };
      if (isResultBullets) resultBulletFinalizers.add(finish);
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
    };

    if (element.hasAttribute('data-reveal-eager')) reveal();
    else observeOnce(element, offset, reveal);
  });
}

function initProgrammeReveals(): void {
  document
    .querySelectorAll<HTMLElement>('[data-anim="aio-programme-modules"]')
    .forEach((list) => {
      if (list.hasAttribute('data-aio-native-programme')) return;
      list.setAttribute('data-aio-native-programme', '');
      list.querySelectorAll<HTMLElement>('.aio-programme__group').forEach((group) => {
        const head = group.querySelector<HTMLElement>('.aio-programme__group-head');
        const items = [
          ...(head ? [head] : []),
          ...Array.from(group.querySelectorAll<HTMLElement>('.aio-programme__module')),
        ];
        if (!items.length) return;
        items.forEach((item) => {
          item.style.opacity = '0';
          item.style.transform = 'translate3d(0, 1rem, 0)';
        });
        observeOnce(group, 18, () => {
          const animations = items.flatMap((item, index) => [
            play(item, [{ opacity: 0 }, { opacity: 1 }], {
              duration: 700,
              delay: index * 85,
              easing: OUT_QUART,
            }),
            play(
              item,
              [
                { transform: 'translate3d(0, 1rem, 0)' },
                { transform: 'translate3d(0, 0, 0)' },
              ],
              { duration: 700, delay: index * 85, easing: OUT_QUART },
            ),
          ]);
          void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
            items.forEach((item) => {
              item.style.removeProperty('opacity');
              item.style.removeProperty('transform');
            });
            animations.forEach((animation) => {
              if (animation.playState !== 'idle') animation.cancel();
            });
          });
        });
      });
    });
}

function initTristyChat(): void {
  document.querySelectorAll<HTMLElement>('[data-tristy-chat]').forEach((chat) => {
    if (chat.hasAttribute('data-aio-native-chat')) return;
    const prefix = chat.querySelector<HTMLElement>('[data-tristy-prefix]');
    const name = chat.querySelector<HTMLElement>('[data-tristy-name]');
    const dots = chat.querySelector<HTMLElement>('[data-tristy-dots]');
    const prompt = chat.querySelector<HTMLElement>('[data-tristy-prompt]');
    if (!prefix || !name || !dots || !prompt) return;

    chat.setAttribute('data-aio-native-chat', '');
    const greeting = `${prefix.textContent ?? ''}${name.textContent ?? ''}${dots.textContent ?? ''}`;
    const promptText = prompt.textContent ?? '';
    prefix.textContent = '';
    name.textContent = '';
    dots.textContent = '';
    prompt.textContent = '';
    chat.style.opacity = '0';
    chat.style.transform = 'translate3d(0, 3px, 0)';

    observeOnce(chat, 15, () => {
      const entrance = play(
        chat,
        [
          { opacity: 0, transform: 'translate3d(0, 3px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: 220, easing: 'ease-out' },
      );
      void entrance.finished.finally(() => {
        chat.style.removeProperty('opacity');
        chat.style.removeProperty('transform');
        if (entrance.playState !== 'idle') entrance.cancel();
      });

      let position = 340;
      Array.from(greeting).forEach((_, index) => {
        window.setTimeout(() => {
          const value = Array.from(greeting).slice(0, index + 1).join('');
          prefix.textContent = value.slice(0, Math.min(value.length, 13));
          name.textContent = value.slice(13, Math.min(value.length, 19));
          dots.textContent = value.slice(19);
        }, position);
        position += 58 + (index % 4) * 8;
      });
      position += 420;
      Array.from(promptText).forEach((_, index) => {
        window.setTimeout(() => {
          prompt.textContent = Array.from(promptText).slice(0, index + 1).join('');
        }, position);
        position += 58 + (index % 4) * 8;
      });
    });
  });
}

if (
  root.classList.contains('aio-mobile-motion') &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  initGenericReveals();
  initProgrammeReveals();
  initTristyChat();

  const portrait = window.matchMedia('(orientation: portrait)');
  let orientationClassTimer: number | undefined;
  portrait.addEventListener('change', () => {
    root.classList.add('is-aio-orientation-settling');
    document.querySelectorAll<HTMLElement>('[data-aio-result-list]').forEach((list) => {
      list.setAttribute('data-aio-orientation-final', '');
      list.style.removeProperty('opacity');
      list.style.removeProperty('transform');
      list.querySelectorAll<HTMLElement>('[data-reveal-blur-text]').forEach((text) => {
        text.style.removeProperty('filter');
        text.style.removeProperty('will-change');
      });
    });
    resultBulletFinalizers.forEach((finish) => finish());
    resultBulletFinalizers.clear();

    // Laufende Filter-/Transform-Layer vor dem mobilen Zeilenumbruch sauber
    // abschliessen. So kann WebKit keine einzelne alte Textzeile nachzeichnen.
    activeAnimations.forEach((animation) => {
      try {
        animation.finish();
      } catch {
        animation.cancel();
      }
    });
    if (orientationClassTimer !== undefined) window.clearTimeout(orientationClassTimer);
    orientationClassTimer = window.setTimeout(() => {
      root.classList.remove('is-aio-orientation-settling');
      orientationClassTimer = undefined;
    }, 900);
  });
}

export {};
