import { gsap } from 'gsap';

/* ---------------------------------------------------------------------------
   Interaktive Widgets der Sections (delegierte Handler, ein zentraler Init):
   FAQ-Accordion, Coaching-Tabs, Read-More, Testimonials-Load-More und das
   direkte HTML5-Video. Animationsdauern fallen bei
   prefers-reduced-motion auf 0 (Zustand wechselt sofort).
   --------------------------------------------------------------------------- */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dur = (seconds: number) => (reduced ? 0 : seconds);

/* Laufzeit-Layoutänderungen (FAQ öffnen, Tab wechseln, „weiterlesen",
   Testimonials nachladen) verschieben alle nachfolgenden Inhalte. Dieses Signal
   lässt das Motion-Bundle die Scroll-Trigger-Positionen neu vermessen, damit
   noch nicht ausgelöste Reveals darunter nicht verfrüht feuern (motion.ts hört
   auf `lp:layout-changed`). Entkoppelt & zukunftssicher: jeder künftige Code,
   der die Höhe ändert, kann dasselbe Event dispatchen. */
function notifyLayoutChanged(): void {
  window.dispatchEvent(new Event('lp:layout-changed'));
}

/* --- FAQ-Accordion ([data-faq-*]) ------------------------------------------
   IX2 a-54/a-55 (Desktop ≥992): Antwort-Höhe 0 ↔ auto, 0.8 s power3.out.
   IX2 a-101/a-102 (≤991): zusätzlich fährt die Whipe-Fläche hinter der Frage
   ein (yPercent 101 → 0, 0.8 s power3.out) bzw. beim Schließen linear in
   0.5 s zurück und wird danach versteckt. Bei prefers-reduced-motion sofort. */

const faqMobile = window.matchMedia('(max-width: 991px)');

function toggleFaq(btn: HTMLElement): void {
  const item = btn.closest<HTMLElement>('[data-faq-item]');
  const panel = item?.querySelector<HTMLElement>('[data-faq-panel]');
  const whipe = item?.querySelector<HTMLElement>('[data-faq-whipe]');
  if (!item || !panel) return;

  if (item.classList.contains('is-open')) {
    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    gsap.to(panel, {
      height: 0,
      duration: dur(0.8),
      ease: 'power3.out',
      onComplete: () => {
        panel.hidden = true;
        notifyLayoutChanged();
      },
    });
    if (whipe && faqMobile.matches) {
      gsap.to(whipe, {
        yPercent: 101,
        duration: dur(0.5),
        ease: 'none',
        onComplete: () => {
          whipe.hidden = true;
        },
      });
    }
  } else {
    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    gsap.fromTo(panel, { height: 0 }, {
      height: 'auto',
      duration: dur(0.8),
      ease: 'power3.out',
      onComplete: notifyLayoutChanged,
    });
    if (whipe && faqMobile.matches) {
      whipe.hidden = false;
      gsap.fromTo(
        whipe,
        { yPercent: 101 },
        { yPercent: 0, duration: dur(0.8), ease: 'power3.out' },
      );
    }
  }
}

/* --- Tabs ([data-tabs]/[data-tab]/[data-tab-panel]) ------------------------ */

function switchTab(btn: HTMLElement): void {
  const root = btn.closest<HTMLElement>('[data-tabs]');
  const id = btn.dataset.tab;
  if (!root || !id) return;

  root.querySelectorAll<HTMLElement>('[data-tab]').forEach((tab) => {
    const active = tab.dataset.tab === id;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  root.querySelectorAll<HTMLElement>('[data-tab-panel]').forEach((panel) => {
    const show = panel.dataset.tabPanel === id;
    panel.hidden = !show;
    if (show && !reduced) {
      gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
    }
  });
  // Panels unterschiedlicher Höhe verschieben nachfolgende Sections.
  notifyLayoutChanged();
}

/* --- Read-More (lange Testimonial-Texte, Grenze wie im Original: 216) ------ */

const READ_MORE_LIMIT = 216;

function initReadMore(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-read-more]').forEach((el) => {
    if (el.dataset.readMoreDone) return;
    el.dataset.readMoreDone = '1';
    const full = el.textContent?.trim() ?? '';
    if (full.length <= READ_MORE_LIMIT) return;

    const short = full.slice(0, READ_MORE_LIMIT).trimEnd();
    el.textContent = `${short}… `;
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'read-more';
    more.textContent = 'weiterlesen';
    more.addEventListener('click', () => {
      el.textContent = full;
      notifyLayoutChanged();
    });
    el.appendChild(more);
  });
}

/* --- Testimonials-Load-More (seitenweise, 250 ms-Stagger wie Original) ----- */

function loadMore(btn: HTMLElement): void {
  const section = btn.closest('section');
  const grid = section?.querySelector<HTMLElement>('[data-initial-count]');
  if (!grid) return;
  const pageSize = parseInt(grid.dataset.initialCount ?? '', 10) || 3;

  const hiddenCards = Array.from(grid.querySelectorAll<HTMLElement>('[hidden]'));
  hiddenCards.slice(0, pageSize).forEach((card, i) => {
    card.hidden = false;
    if (!reduced) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, delay: i * 0.25, ease: 'power3.out' },
      );
    }
  });

  if (grid.querySelectorAll('[hidden]').length === 0) {
    (btn.closest<HTMLElement>('.reviews__more') ?? btn).remove();
  }
  // Neu eingeblendete Karten verlängern die Seite → Trigger darunter neu messen.
  notifyLayoutChanged();
}

/* --- Direktes HTML5-Video (Bunny MP4, ohne Drittanbieter-Player) ----------- */

function syncMuteIcons(controls: HTMLElement, muted: boolean): void {
  controls.querySelectorAll<SVGElement>('[data-icon]').forEach((icon) => {
    const isMutedIcon = icon.getAttribute('data-icon') === 'muted';
    icon.style.display = isMutedIcon === muted ? '' : 'none';
  });
}

function handleVideoAction(btn: HTMLElement): void {
  const controls = btn.closest<HTMLElement>('[data-video-controls]');
  const video = controls?.parentElement?.querySelector<HTMLVideoElement>('[data-video-player] video');
  if (!controls || !video) return;

  if (btn.dataset.action === 'toggle-mute') {
    const nowMuted = !video.muted;
    video.muted = nowMuted;
    controls.dataset.muted = nowMuted ? '1' : '0';
    syncMuteIcons(controls, nowMuted);
    void video.play().catch(() => undefined);
  } else if (btn.dataset.action === 'replay') {
    video.muted = false;
    video.currentTime = 0;
    controls.dataset.muted = '0';
    syncMuteIcons(controls, false);
    void video.play().catch(() => undefined);
  }
}

/* --- Delegierter Klick-Handler + Init -------------------------------------- */

document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  if (!target) return;

  const faqBtn = target.closest<HTMLElement>('[data-faq-toggle]');
  if (faqBtn) return toggleFaq(faqBtn);

  const tabBtn = target.closest<HTMLElement>('[data-tab]');
  if (tabBtn) return switchTab(tabBtn);

  const moreBtn = target.closest<HTMLElement>('[data-load-more]');
  if (moreBtn) return loadMore(moreBtn);

  const actionBtn = target.closest<HTMLElement>('[data-video-controls] [data-action]');
  if (actionBtn) return handleVideoAction(actionBtn);
});

initReadMore();
