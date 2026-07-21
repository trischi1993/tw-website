import { SplitText } from 'gsap/SplitText';
import { BP, gsap } from './util';

gsap.registerPlugin(SplitText);

/* ---------------------------------------------------------------------------
   Werdegang-Timeline (Über mich) - 1:1-Port der Webflow-IX3-Interaction
   i-d5f08b7f / Timeline t-83140d68 (dekodiert: wf-scripts/ix3-data.json).

   Scrub 0.8 über den 1200vh-Track (start 'top bottom', end 'bottom bottom',
   clamp) - GSAP mappt den Scroll-Fortschritt über die Timeline-Eigenlänge
   (≈0.24), exakt wie die IX3-Runtime (timeline.progress()). Alle position/
   duration-Werte sind die ROHEN IX3-Werte. tt:2 = fromTo, tt:1 = from;
   ease-Indizes: 0 = linear, 2 = power1.out, 3 = power1.inOut - und OHNE
   ease-Angabe gilt der IX3-DEFAULT power1.out (headless am Original-Export
   nachgemessen: Bild-Scale/-Slide folgen exakt power1.out, nur explizit
   mit 0 markierte Actions wie der Listen-Pan laufen linear).
   Auf tiny (≤479) deaktiviert (conditionalPlayback "dont-animate" +
   Mobile-Portrait-Fix des Originals) - dort bleibt die statische Liste.
   --------------------------------------------------------------------------- */

export function init(mm: gsap.MatchMedia): void {
  const height = document.querySelector<HTMLElement>('[data-timeline-height]');
  if (!height) return;
  const card = height.querySelector<HTMLElement>('[data-timeline-card]');
  const list = height.querySelector<HTMLElement>('[data-timeline-list]');
  if (!card || !list) return;

  mm.add(BP.notTiny, () => {
    const one = (v: string) => height.querySelector<HTMLElement>(`[data-timeline="${v}"]`);
    const splits: SplitText[] = [];
    const chars = (v: string, type: 'chars' | 'words') => {
      const el = one(v);
      if (!el) return [];
      const split = SplitText.create(el, { type });
      splits.push(split);
      return type === 'chars' ? split.chars : split.words;
    };

    const tl = gsap.timeline({
      /* IX3-Default für Actions ohne ease-Angabe (siehe Kopfkommentar). */
      defaults: { ease: 'power1.out' },
      scrollTrigger: {
        trigger: height,
        start: 'clamp(top bottom)',
        end: 'clamp(bottom bottom)',
        scrub: 0.8,
      },
    });

    /* Karte wächst auf Fullscreen, Liste pant -800vw (ease 0 = linear!),
       Bilder zoomen ein (Default power1.out). */
    tl.fromTo(list, { x: '0vw' }, { x: '-800vw', duration: 0.21, ease: 'none' }, 0.03);
    tl.fromTo(
      card,
      { width: '24vw', height: '55vh', x: '10vw', yPercent: 10 },
      { width: '100vw', height: '100vh', x: '0vw', yPercent: 0, duration: 0.011, ease: 'power1.out' },
      0.012,
    );
    const media = height.querySelectorAll<HTMLElement>('[data-timeline-media]');
    if (media.length) {
      tl.fromTo(media, { xPercent: -30 }, { xPercent: 0, duration: 0.011 }, 0.012);
      tl.fromTo(media, { scale: 0.8 }, { scale: 1.1, duration: 0.016 }, 0.012);
    }

    /* Stationen - Reihenfolge/Werte exakt aus t-83140d68. */
    const from = (v: string, vars: gsap.TweenVars, position: number) => {
      const el = one(v);
      if (el) tl.from(el, vars, position);
    };

    from('1-description', { opacity: 0, x: '2em', duration: 0.01 }, 0.02);
    from('1-year', { yPercent: -101, duration: 0.008 }, 0.022);
    from('1-text', { yPercent: 101, duration: 0.008 }, 0.022);

    from('2-content-left', { yPercent: -101, duration: 0.008 }, 0.032);
    from('2-content-left', { x: '-9rem', duration: 0.015, ease: 'none' }, 0.04);
    from('2-description', { x: '8em', duration: 0.01, ease: 'none' }, 0.045);

    from('3-content-left', { rotation: 80, x: '-21vw', y: '10vh', duration: 0.027, ease: 'none' }, 0.055);
    from('3-description', { x: '30vw', opacity: 0, duration: 0.012, ease: 'none' }, 0.07);

    from('4-year', { opacity: 0, xPercent: 101, duration: 0.015, ease: 'none' }, 0.093);
    from('4-text', { opacity: 0, yPercent: -101, duration: 0.013, ease: 'none' }, 0.095);
    from('4-description', { opacity: 0, xPercent: -101, duration: 0.013, ease: 'none' }, 0.095);

    from('5-letter-1', { opacity: 0, x: '-15vw', y: '-25vh', duration: 0.01, ease: 'none' }, 0.115);
    from('5-letter-2', { opacity: 0, y: '-16vh', duration: 0.01, ease: 'none' }, 0.115);
    from('5-letter-3', { opacity: 0, y: '28vh', x: '-20vw', duration: 0.01, ease: 'none' }, 0.115);
    from('5-letter-4', { opacity: 0, y: '28vh', x: '16vw', duration: 0.01, ease: 'none' }, 0.115);
    from('5-text', { opacity: 0, xPercent: 40, duration: 0.01, ease: 'none' }, 0.124);
    from('5-description', { opacity: 0, x: '3rem', duration: 0.007, ease: 'none' }, 0.127);

    const y6 = chars('6-year', 'chars');
    if (y6.length)
      tl.from(
        y6,
        { opacity: 0, yPercent: -50, duration: 0.011, ease: 'power1.out', stagger: { amount: 0.009 } },
        0.141,
      );
    const t6 = chars('6-text', 'chars');
    if (t6.length)
      tl.from(
        t6,
        { opacity: 0, yPercent: 200, duration: 0.011, ease: 'power1.out', stagger: { amount: 0.009 } },
        0.141,
      );
    const d6 = chars('6-description', 'words');
    if (d6.length)
      tl.from(
        d6,
        {
          x: '1.5rem',
          opacity: 0,
          duration: 0.011,
          ease: 'power1.out',
          stagger: { amount: 0.008, ease: 'power1.out', from: 'center' },
        },
        0.146,
      );

    const c7 = chars('7-content-left', 'chars');
    if (c7.length)
      tl.from(
        c7,
        {
          opacity: 0,
          scale: 2,
          transformOrigin: '50% 0%',
          duration: 0.005,
          ease: 'power1.out',
          stagger: { amount: 0.011 },
        },
        0.172,
      );
    from('7-description', { opacity: 0, duration: 0.01, ease: 'power1.inOut' }, 0.179);

    from('8-year', { yPercent: -101, opacity: 0, duration: 0.02 }, 0.194);
    from('8-text', { yPercent: 101, opacity: 0, duration: 0.02 }, 0.194);
    from('8-description', { opacity: 0, x: '4em', duration: 0.02, ease: 'power1.out' }, 0.194);

    from('9-content-left', { opacity: 0, y: '70vh', duration: 0.014, ease: 'power1.out' }, 0.225);
    from('9-description', { opacity: 0, y: '-70vh', duration: 0.014, ease: 'power1.out' }, 0.225);

    return () => {
      splits.forEach((s) => s.revert());
    };
  });
}
