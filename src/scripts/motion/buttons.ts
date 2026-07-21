import { gsap, EASE, BP } from './util';

/* ---------------------------------------------------------------------------
   Button-Hover — IX2 a-93/a-98 (Glow-Button-Pfeile) + a-91/a-92
   (Underline-Wipe).

   a-93/a-98 (alle Breakpoints): Im Glow-Button liegen zwei Pfeile in einer
   1em-Overflow-Maske. Initial: Pfeil 1 x -131 %, Pfeil 2 x 0. Hover: Pfeil 2
   → +131 %, Pfeil 1 → 0 (je 400 ms sine.out); Out: zurück (400 ms sine.out).
   Buttons ohne Pfeile (z. B. Navbar-CTA „0 € Angebot") sind wie im Original
   ohne Hover-Effekt.

   a-91/a-92: [data-underline]-Container mit Kind .link-underline__line.
   Over: Linie auf x -101 % setzen, dann → 0 (300 ms sine.out); Out: → +101 %
   (200 ms sine.out). `data-underline` ohne Wert = alle Breakpoints
   (Navbar-Links e-869/908, Load-More e-854); `data-underline="main"` = nur
   ≥992 (Secondary-Buttons, e-454).
   --------------------------------------------------------------------------- */

function bindArrows(btn: HTMLElement): void {
  const icon1 = btn.querySelector<HTMLElement>('[data-btn-icon-1]');
  const icon2 = btn.querySelector<HTMLElement>('[data-btn-icon-2]');
  if (!icon1 || !icon2) return;
  gsap.set(icon1, { xPercent: -131 });
  gsap.set(icon2, { xPercent: 0 });
  btn.addEventListener('mouseenter', () => {
    gsap.to(icon2, { xPercent: 131, duration: 0.4, ease: EASE.outSine });
    gsap.to(icon1, { xPercent: 0, duration: 0.4, ease: EASE.outSine });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(icon2, { xPercent: 0, duration: 0.4, ease: EASE.outSine });
    gsap.to(icon1, { xPercent: -131, duration: 0.4, ease: EASE.outSine });
  });
}

function bindUnderline(el: HTMLElement): () => void {
  const line = el.querySelector<HTMLElement>('.link-underline__line');
  if (!line) return () => {};
  const over = () => {
    gsap.set(line, { xPercent: -101 });
    gsap.to(line, { xPercent: 0, duration: 0.3, ease: EASE.outSine });
  };
  const out = () => {
    gsap.to(line, { xPercent: 101, duration: 0.2, ease: EASE.outSine });
  };
  el.addEventListener('mouseenter', over);
  el.addEventListener('mouseleave', out);
  return () => {
    el.removeEventListener('mouseenter', over);
    el.removeEventListener('mouseleave', out);
    gsap.set(line, { clearProps: 'all' });
  };
}

export function init(mm: gsap.MatchMedia): void {
  document.querySelectorAll<HTMLElement>('.btn-glow').forEach(bindArrows);

  document.querySelectorAll<HTMLElement>('[data-underline]').forEach((el) => {
    if (el.dataset.underline === 'main') {
      mm.add(BP.main, () => bindUnderline(el));
    } else {
      bindUnderline(el);
    }
  });
}
