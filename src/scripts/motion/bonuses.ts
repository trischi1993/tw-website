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
const CHARACTER_COUNT = PREFIX.length + NAME.length + DOTS.length;

export function init(_mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('[data-tristy-chat]').forEach((chat) => {
    const prefix = chat.querySelector<HTMLElement>('[data-tristy-prefix]');
    const name = chat.querySelector<HTMLElement>('[data-tristy-name]');
    const dots = chat.querySelector<HTMLElement>('[data-tristy-dots]');
    const cursor = chat.querySelector<HTMLElement>('[data-tristy-cursor]');
    const prompt = chat.querySelector<HTMLElement>('[data-tristy-prompt]');
    if (!prefix || !name || !dots || !cursor || !prompt) return;

    const render = (count: number) => {
      const typed = Math.max(0, Math.min(CHARACTER_COUNT, Math.round(count)));
      prefix.textContent = PREFIX.slice(0, typed).join('');
      name.textContent = NAME.slice(0, Math.max(0, typed - PREFIX.length)).join('');
      dots.textContent = DOTS.slice(
        0,
        Math.max(0, typed - PREFIX.length - NAME.length),
      ).join('');
    };

    render(0);
    gsap.set(chat, { opacity: 0, scale: 0.96, transformOrigin: '80% 100%' });
    gsap.set(prompt, { opacity: 0, y: 3 });
    gsap.set(cursor, { opacity: 0 });

    onEnterOnce(chat, 15, () => {
      const typing = { count: 0 };
      let cursorTween: gsap.core.Tween | undefined;
      const timeline = gsap.timeline();

      timeline
        .to(chat, { opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out' })
        .set(cursor, {
          opacity: 1,
          onComplete: () => {
            cursorTween = gsap.to(cursor, {
              opacity: 0,
              duration: 0.34,
              repeat: -1,
              yoyo: true,
              ease: 'steps(1)',
            });
          },
        }, 0.16)
        .to(typing, {
          count: CHARACTER_COUNT,
          duration: 1.35,
          ease: 'none',
          onUpdate: () => render(typing.count),
          onComplete: () => {
            render(CHARACTER_COUNT);
            cursorTween?.kill();
            gsap.set(cursor, { opacity: 0 });
          },
        }, 0.18)
        .to(prompt, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 1.72);
    });
  });
}
