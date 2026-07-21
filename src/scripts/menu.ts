import { gsap, EASE } from './motion/util';

/**
 * Burger-/Fullscreen-Menü (Header.astro) — Funktion + exakte IX2-Choreografie.
 *
 * Original (Webflow): Menü existiert nur ≤991 (Burger auf Desktop
 * display:none; die Desktop-ActionLists a-26/a-58 sind dadurch unerreichbar).
 * Öffnen = a-121, Schließen = a-122, Link-Hover = a-56/a-57, Link-Klick =
 * a-74 — alle Werte 1:1 aus dem IX2-Datensatz (Dauern ms, Delays ms):
 *
 *   Öffnen:  Navbar-BG → transparent (200 ease) · right-inner x→9.2rem
 *            (500 outQuart) · Panel x -100 %→0 (1500 inOutQuart) · Burger:
 *            Mitte x→200 % (500 outQuart, d100), außen rotate ±45° + y ∓3.5px
 *            (300 outQuart, d200) · Links x -80px→0 (600 outQuart) + Fade
 *            (400 ease) gestaffelt d1000/1100/1200/1300 (Reihenfolge is-1..4 =
 *            Startseite, Über mich, ALL-IN-ONE, Zum E-Book) · Pfeile Fade
 *            (500 ease, d1500).
 *   Schließen: Links-Fade 0 (500 ease) · Burger zurück (rotate 300 d0,
 *            y 300 d200, Mitte 300 d400) · Pfeile Fade 0 (500) · Panel
 *            x→-100 % (1100 inOutQuart, d200) · right-inner x→0 (500 outQuart,
 *            d200) · Navbar-BG → rgba(231,226,220,0.12) (500 ease, d600 —
 *            bewusst der Original-Datenwert) · Ende: Links x -70px, display none.
 *
 * A11y/Funktion bleibt auch unter prefers-reduced-motion erhalten (Zustände
 * werden dann instant gesetzt): inert-Backdrop, Fokus-Trap, ESC, Scroll-Lock.
 */

const header = document.querySelector<HTMLElement>('[data-site-header]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const menu = document.querySelector<HTMLElement>('[data-site-menu]');
const panel = menu?.querySelector<HTMLElement>('[data-menu-panel]');

/** Stagger-Delays (s) nach DOM-Position: Startseite, Zum E-Book, ALL-IN-ONE,
    Über mich ⇒ is-1/is-4/is-3/is-2 ⇒ 1.0/1.3/1.2/1.1 (Original-Werte). */
const LINK_DELAYS_4 = [1.0, 1.3, 1.2, 1.1];

if (header && toggle && menu && panel) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const links = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-link]'));
  const texts = links.map((l) => l.querySelector<HTMLElement>('[data-menu-text]'));
  const arrows = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-arrow]'));
  const burgerTop = header.querySelector<HTMLElement>('[data-burger-top]');
  const burgerMiddle = header.querySelector<HTMLElement>('[data-burger-middle]');
  const burgerBottom = header.querySelector<HTMLElement>('[data-burger-bottom]');
  const rightInner = header.querySelector<HTMLElement>('[data-nav-right-inner]');

  const linkDelay = (i: number) =>
    links.length === 4 ? LINK_DELAYS_4[i] : 1.0 + i * 0.1;

  // Initialzustände nur mit Motion (ohne JS/Reduced bleibt alles sichtbar,
  // das Menü ist ohnehin display:none bis zum Öffnen).
  if (!reduced) {
    gsap.set(links, { opacity: 0, x: -80 });
    gsap.set(arrows, { opacity: 0 });
    gsap.set(panel, { xPercent: -100 });
  }

  let tl: gsap.core.Timeline | null = null;

  const openAnim = () => {
    tl?.kill();
    tl = gsap.timeline();
    tl.to(header, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.2, ease: EASE.ease }, 0);
    if (rightInner) tl.to(rightInner, { x: '9.2rem', duration: 0.5, ease: EASE.outQuart }, 0);
    tl.to(panel, { xPercent: 0, duration: 1.5, ease: EASE.inOutQuart }, 0);
    if (burgerMiddle) tl.to(burgerMiddle, { xPercent: 200, duration: 0.5, ease: EASE.outQuart }, 0.1);
    if (burgerTop) {
      tl.to(burgerTop, { rotation: 45, duration: 0.3, ease: EASE.outQuart }, 0.2);
      tl.to(burgerTop, { y: 3.5, duration: 0.3, ease: EASE.outQuart }, 0.2);
    }
    if (burgerBottom) {
      tl.to(burgerBottom, { rotation: -45, duration: 0.3, ease: EASE.outQuart }, 0.2);
      tl.to(burgerBottom, { y: -3.5, duration: 0.3, ease: EASE.outQuart }, 0.2);
    }
    links.forEach((link, i) => {
      tl!.to(link, { x: 0, duration: 0.6, ease: EASE.outQuart }, linkDelay(i));
      tl!.to(link, { opacity: 1, duration: 0.4, ease: EASE.ease }, linkDelay(i));
    });
    if (arrows.length) tl.to(arrows, { opacity: 1, duration: 0.5, ease: EASE.ease }, 1.5);
  };

  const closeAnim = (onDone: () => void) => {
    tl?.kill();
    tl = gsap.timeline({
      onComplete: () => {
        gsap.set(links, { x: -70 });
        onDone();
      },
    });
    tl.to(links, { opacity: 0, duration: 0.5, ease: EASE.ease }, 0);
    if (burgerTop) tl.to(burgerTop, { rotation: 0, duration: 0.3, ease: EASE.outQuart }, 0);
    if (burgerBottom) tl.to(burgerBottom, { rotation: 0, duration: 0.3, ease: EASE.outQuart }, 0);
    if (arrows.length) tl.to(arrows, { opacity: 0, duration: 0.5, ease: EASE.ease }, 0);
    tl.to(panel, { xPercent: -100, duration: 1.1, ease: EASE.inOutQuart }, 0.2);
    if (burgerTop) tl.to(burgerTop, { y: 0, duration: 0.3, ease: EASE.outQuart }, 0.2);
    if (burgerBottom) tl.to(burgerBottom, { y: 0, duration: 0.3, ease: EASE.outQuart }, 0.2);
    if (burgerMiddle) tl.to(burgerMiddle, { xPercent: 0, duration: 0.3, ease: EASE.outQuart }, 0.4);
    if (rightInner) tl.to(rightInner, { x: 0, duration: 0.5, ease: EASE.outQuart }, 0.2);
    tl.to(header, { backgroundColor: 'rgba(231,226,220,0.12)', duration: 0.5, ease: EASE.ease }, 0.6);
  };

  // Alles außer Header + Menü wird inert, solange offen.
  const backdrop = () =>
    (Array.from(document.body.children) as HTMLElement[]).filter(
      (el) => el !== header && el !== menu,
    );
  const trapStops = () =>
    [
      ...Array.from(header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')),
      ...Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')),
    ].filter((el) => el.getClientRects().length > 0);

  let lastFocused: HTMLElement | null = null;
  let isOpen = false;

  const setOpen = (open: boolean) => {
    if (open === isOpen) return;
    isOpen = open;
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    backdrop().forEach((el) =>
      open ? el.setAttribute('inert', '') : el.removeAttribute('inert'),
    );
    if (open) {
      lastFocused = document.activeElement as HTMLElement;
      menu.removeAttribute('hidden');
      if (reduced) {
        gsap.set([...links, ...arrows], { clearProps: 'all' });
        gsap.set(panel, { xPercent: 0 });
      } else {
        openAnim();
      }
    } else {
      (lastFocused ?? toggle).focus();
      if (reduced) {
        menu.setAttribute('hidden', '');
      } else {
        closeAnim(() => menu.setAttribute('hidden', ''));
      }
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen));
  // Link-Klick schließt (a-74-Klick-Feedback läuft parallel in bindLinkFx).
  links.forEach((a) => a.addEventListener('click', () => setOpen(false)));
  menu.addEventListener('click', (e) => {
    if (e.target === menu) setOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      const stops = trapStops();
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Link-Hover (a-56/a-57) + Klick-Wipe (a-74) — dekorativ, nur mit Motion.
  if (!reduced) {
    links.forEach((link, i) => {
      const wipe = link.querySelector<HTMLElement>('[data-menu-wipe]');
      const clickWipe = link.querySelector<HTMLElement>('[data-menu-click-wipe]');
      const arrow = arrows[i];
      const text = texts[i];

      link.addEventListener('mouseenter', () => {
        if (wipe) gsap.to(wipe, { height: '100%', duration: 0.5, ease: EASE.inOutQuart });
        if (arrow) gsap.to(arrow, { rotation: 90, duration: 0.5, ease: EASE.outQuart });
        if (text) gsap.to(text, { x: 40, duration: 0.5, ease: EASE.outQuart });
      });
      link.addEventListener('mouseleave', () => {
        if (wipe) gsap.to(wipe, { height: 0, duration: 0.5, ease: EASE.inOutQuart });
        if (arrow) gsap.to(arrow, { rotation: 0, duration: 0.5, ease: EASE.outQuart });
        if (text) gsap.to(text, { x: 0, duration: 0.5, ease: EASE.outQuart });
      });
      link.addEventListener('click', () => {
        if (clickWipe) gsap.to(clickWipe, { height: '100%', duration: 0.3, ease: EASE.outQuart });
        if (arrow) gsap.to(arrow, { rotation: 45, duration: 0.3, ease: EASE.outQuart });
      });
    });
  }
}
