import { gsap, onEnterOnce } from './util';

/* ---------------------------------------------------------------------------
   Bonusse (AIO): Karten bleiben statisch. Nur Tristys Sprechblase erhält eine
   bewusst kurze, einmalige Chat-Sequenz beim Eintritt in den Viewport.

   Ohne JS und bei prefers-reduced-motion bleibt der vollständige Text sofort
   sichtbar. Die frühere IX2-Hover-Choreo a-130/a-131 bleibt unberücksichtigt:
   Sie zielte auf eine Klasse, die auf keiner Live-Seite existiert.
   --------------------------------------------------------------------------- */

const PREFIX = Array.from('Hey, ich bin ');
const NAME = Array.from('Tristy');
const DOTS = Array.from('...');
const PROMPT = Array.from('Wie kann ich dir helfen?');
const GREETING_COUNT = PREFIX.length + NAME.length + DOTS.length;

const CADENCE = [0.055, 0.075, 0.048, 0.068, 0.086, 0.058, 0.072];

function typingDelay(character: string, index: number): number {
  if (character === ',') return 0.22;
  if (character === '.') return 0.18;
  if (character === '?') return 0.2;
  if (character === ' ') return 0.04;
  return CADENCE[index % CADENCE.length];
}

export function init(_mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('[data-tristy-chat]').forEach((chat) => {
    const prefix = chat.querySelector<HTMLElement>('[data-tristy-prefix]');
    const name = chat.querySelector<HTMLElement>('[data-tristy-name]');
    const dots = chat.querySelector<HTMLElement>('[data-tristy-dots]');
    const greetingCursor = chat.querySelector<HTMLElement>(
      '[data-tristy-cursor="greeting"]',
    );
    const prompt = chat.querySelector<HTMLElement>('[data-tristy-prompt]');
    const promptCursor = chat.querySelector<HTMLElement>(
      '[data-tristy-cursor="prompt"]',
    );
    if (!prefix || !name || !dots || !greetingCursor || !prompt || !promptCursor) return;

    const renderGreeting = (count: number) => {
      const typed = Math.max(0, Math.min(GREETING_COUNT, count));
      prefix.textContent = PREFIX.slice(0, typed).join('');
      name.textContent = NAME.slice(0, Math.max(0, typed - PREFIX.length)).join('');
      dots.textContent = DOTS.slice(
        0,
        Math.max(0, typed - PREFIX.length - NAME.length),
      ).join('');
    };

    const renderPrompt = (count: number) => {
      prompt.textContent = PROMPT.slice(
        0,
        Math.max(0, Math.min(PROMPT.length, count)),
      ).join('');
    };

    renderGreeting(0);
    renderPrompt(0);
    gsap.set(chat, { opacity: 0, y: 3 });
    gsap.set([greetingCursor, promptCursor], { opacity: 0 });

    onEnterOnce(chat, 15, () => {
      let cursorTween: gsap.core.Tween | undefined;
      const timeline = gsap.timeline();

      const showCursor = (cursor: HTMLElement) => {
        cursorTween?.kill();
        gsap.set([greetingCursor, promptCursor], { opacity: 0 });
        gsap.set(cursor, { opacity: 1 });
        cursorTween = gsap.to(cursor, {
          opacity: 0,
          duration: 0.42,
          repeat: -1,
          yoyo: true,
          ease: 'steps(1)',
        });
      };

      const hideCursor = () => {
        cursorTween?.kill();
        cursorTween = undefined;
        gsap.set([greetingCursor, promptCursor], { opacity: 0 });
      };

      timeline.to(chat, {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: 'power2.out',
      });

      let position = 0.34;
      timeline.call(() => showCursor(greetingCursor), undefined, 0.15);
      [...PREFIX, ...NAME, ...DOTS].forEach((character, index) => {
        timeline.call(() => renderGreeting(index + 1), undefined, position);
        position += typingDelay(character, index);
      });

      timeline.call(hideCursor, undefined, position + 0.08);
      position += 0.42;
      timeline.call(() => showCursor(promptCursor), undefined, position);
      PROMPT.forEach((character, index) => {
        timeline.call(() => renderPrompt(index + 1), undefined, position);
        position += typingDelay(character, index + GREETING_COUNT);
      });
      timeline.call(hideCursor, undefined, position + 0.28);
    });
  });
}
