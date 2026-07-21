import { gsap, EASE, BP, FINE_POINTER, onEnterOnce } from './util';

/* ---------------------------------------------------------------------------
   Footer-Animationen (IX2 a-87, a-123/a-124 - Decode ix2-relevant.txt §FOOTER).

   a-87 „Footer scroll [in]": choreografierter Einmal-Reveal beim Eintritt
   (Offset 5 %), NUR auf main+medium - auf small/tiny existiert das Event
   nicht, dort darf auch kein Initialzustand versteckt werden.

   a-123/a-124: Hover auf einem Footer-Nav-Link bzw. Social-Icon dimmt die
   GESCHWISTER der eigenen Gruppe (opacity 0.6 + blur 2px, 380 ms linear),
   Out stellt alle wieder her (340 ms wfEase). Nur Desktop (mq main).
   --------------------------------------------------------------------------- */

export function init(mm: gsap.MatchMedia): void {
  const root = document.querySelector<HTMLElement>('[data-footer]');
  if (!root) return;

  /* --- a-87: Reveal-Choreo (main+medium) ---------------------------------- */
  mm.add(BP.mainMedium, () => {
    const logo = root.querySelectorAll('[data-footer-logo]');
    const claim = root.querySelectorAll('[data-footer-claim]');
    const socials = root.querySelectorAll('[data-footer-social]');
    const navLinks = root.querySelectorAll('[data-footer-nav-link]');
    const contactIcon = root.querySelectorAll('[data-footer-contact-icon]');
    const contactTitle = root.querySelectorAll('[data-footer-contact-title]');
    const mail = root.querySelectorAll('[data-footer-mail]');
    const legal = root.querySelectorAll('[data-footer-legal]');

    gsap.set(logo, { yPercent: -125 });
    gsap.set(claim, { opacity: 0, x: '5rem' });
    gsap.set(socials, { yPercent: 130 });
    gsap.set(navLinks, { yPercent: -100 });
    gsap.set(contactIcon, { opacity: 0, x: '3.5rem' });
    gsap.set(contactTitle, { opacity: 0, x: '2rem' });
    gsap.set(mail, { yPercent: 110 });
    gsap.set(legal, { opacity: 0 });

    // Social-Delays wie live (Original-Elemente is-1 → 300 ms, is-3 → 500 ms).
    const socialDelay = [0.3, 0.5];

    onEnterOnce(root, 5, () => {
      gsap.to(logo, { yPercent: 0, duration: 0.7, ease: EASE.outQuart });
      gsap.to(claim, { x: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: EASE.outQuart });
      socials.forEach((el, i) =>
        gsap.to(el, {
          yPercent: 0,
          duration: 0.4,
          delay: socialDelay[i] ?? 0.5,
          ease: EASE.outQuart,
        }),
      );
      navLinks.forEach((el, i) =>
        gsap.to(el, { yPercent: 0, duration: 0.4, delay: 0.6 + i * 0.1, ease: EASE.outQuart }),
      );
      gsap.to(contactIcon, { x: 0, opacity: 1, duration: 0.7, delay: 1, ease: EASE.outQuart });
      gsap.to(contactTitle, { x: 0, opacity: 1, duration: 0.7, delay: 1.1, ease: EASE.outQuart });
      gsap.to(mail, { yPercent: 0, duration: 0.7, delay: 1.2, ease: EASE.outQuart });
      gsap.to(legal, { opacity: 1, duration: 2, delay: 1.2, ease: EASE.outQuart });
    });
  });

  /* --- a-123/a-124: Geschwister-Dim (main, feiner Pointer) ---------------- */
  mm.add(`${BP.main} and ${FINE_POINTER}`, () => {
    const cleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>('[data-dim-group]').forEach((group) => {
      const items = Array.from(group.querySelectorAll<HTMLElement>('[data-dim-item]'));
      items.forEach((item) => {
        const others = items.filter((o) => o !== item);
        if (!others.length) return;
        const enter = () =>
          gsap.to(others, { opacity: 0.6, filter: 'blur(2px)', duration: 0.38, ease: 'none' });
        const leave = () =>
          gsap.to(items, { opacity: 1, filter: 'blur(0px)', duration: 0.34, ease: EASE.ease });
        item.addEventListener('mouseenter', enter);
        item.addEventListener('mouseleave', leave);
        cleanups.push(() => {
          item.removeEventListener('mouseenter', enter);
          item.removeEventListener('mouseleave', leave);
        });
      });
      cleanups.push(() => gsap.set(items, { clearProps: 'opacity,filter' }));
    });
    return () => cleanups.forEach((fn) => fn());
  });
}
