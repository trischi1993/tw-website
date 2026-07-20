/**
 * Header-Verhalten: Mobile-Menü (echter modaler Layer via `inert` + Fokus-Trap)
 * und der Scroll-Zustand des Headers.
 *
 * Als eigenes Modul (Lesbarkeit/Testbarkeit). Astro inlinet diesen kleinen,
 * importlosen Chunk ins HTML; die strikte CSP `script-src 'self'`
 * (public/_headers) deckt ihn per sha256-Hash ab — den trägt der Build-Hook
 * `injectCspScriptHashes` (astro.config.mjs) nach dem Build ein, statt
 * 'unsafe-inline' zu erlauben.
 */
const header = document.querySelector<HTMLElement>('[data-site-header]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

if (header && toggle && menu) {
  // Everything in <body> except the header (which holds the toggle + the menu)
  // becomes inert while open, so the overlay is a real modal layer: no focus
  // and no AT access reaches the page behind it.
  const backdrop = () =>
    (Array.from(document.body.children) as HTMLElement[]).filter((el) => el !== header);
  // Visible, tabbable controls inside the header while open (brand, toggle,
  // menu links) - the focus trap loops within this set.
  const trapStops = () =>
    Array.from(header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
      (el) => el.getClientRects().length > 0,
    );

  let lastFocused: HTMLElement | null = null;

  const setOpen = (open: boolean) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    backdrop().forEach((el) =>
      open ? el.setAttribute('inert', '') : el.removeAttribute('inert'),
    );
    if (open) {
      lastFocused = document.activeElement as HTMLElement;
      menu.removeAttribute('hidden');
      menu.querySelector<HTMLElement>('a[href], button')?.focus();
    } else {
      window.setTimeout(() => menu.setAttribute('hidden', ''), 450);
      (lastFocused ?? toggle).focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
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

// Header background state on scroll
const onScroll = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
