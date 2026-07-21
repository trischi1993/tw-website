/**
 * Burger-/Fullscreen-Menü (Header.astro): echter modaler Layer via `inert`
 * + Fokus-Trap, Body-Scroll-Lock, ESC schließt. Das Overlay (`.menu`, z 99)
 * liegt UNTER der Navbar (z 499) — Burger bleibt sichtbar und wird zum X
 * (global-chrome.md §5).
 */
const header = document.querySelector<HTMLElement>('[data-site-header]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const menu = document.querySelector<HTMLElement>('[data-site-menu]');

if (header && toggle && menu) {
  // Alles außer Header + Menü wird inert, solange offen — kein Fokus/AT-Zugriff
  // auf die Seite dahinter.
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
  let hideTimer: number | undefined;

  const setOpen = (open: boolean) => {
    window.clearTimeout(hideTimer);
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    backdrop().forEach((el) =>
      open ? el.setAttribute('inert', '') : el.removeAttribute('inert'),
    );
    if (open) {
      lastFocused = document.activeElement as HTMLElement;
      menu.removeAttribute('hidden');
      // Erst sichtbar machen, dann Panel einfahren (Transition braucht 2 Frames).
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      hideTimer = window.setTimeout(() => menu.setAttribute('hidden', ''), 600);
      (lastFocused ?? toggle).focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  // Link-Klick schließt; Klick auf die freie Fläche neben dem Panel ebenso.
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  menu.addEventListener('click', (e) => {
    if (e.target === menu) setOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (!header.classList.contains('is-menu-open')) return;
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
}
