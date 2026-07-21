import { gsap } from 'gsap';
import { hasConsent, grantCategory, onConsentChange, VIMEO_CATEGORY } from './consent';

/* ---------------------------------------------------------------------------
   Interaktive Widgets der Sections (delegierte Handler, ein zentraler Init):
   FAQ-Accordion, Coaching-Tabs, Read-More, Testimonials-Load-More und das
   consent-gated Vimeo-Embed. Animationsdauern fallen bei
   prefers-reduced-motion auf 0 (Zustand wechselt sofort).
   --------------------------------------------------------------------------- */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dur = (seconds: number) => (reduced ? 0 : seconds);

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
    gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: dur(0.8), ease: 'power3.out' });
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
}

/* --- Vimeo (consent-gated, Steuerung über die player.vimeo.com-postMessage-
       API - kein zusätzliches SDK) ----------------------------------------- */

function vimeoPost(iframe: HTMLIFrameElement, method: string, value?: unknown): void {
  iframe.contentWindow?.postMessage(JSON.stringify({ method, value }), 'https://player.vimeo.com');
}

function applyVimeoConsent(box: HTMLElement, allowed: boolean): void {
  const id = box.getAttribute('data-vimeo');
  if (!id) return;
  const consentLayer = box.querySelector<HTMLElement>('[data-vimeo-consent]');
  const controls = box.parentElement?.querySelector<HTMLElement>('[data-vimeo-controls]');
  const existing = box.querySelector('iframe');

  if (allowed) {
    if (consentLayer) consentLayer.hidden = true;
    if (!existing) {
      const iframe = document.createElement('iframe');
      // background=1: autoplay, muted, loop, ohne Player-UI (eigene Controls).
      iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(id)}?background=1&autoplay=1&muted=1&loop=1&autopause=0`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.title = 'Vimeo-Video';
      box.appendChild(iframe);
    }
    if (controls) {
      controls.hidden = false;
      controls.dataset.muted = '1';
      syncMuteIcons(controls, true);
    }
  } else {
    existing?.remove();
    if (consentLayer) consentLayer.hidden = false;
    if (controls) controls.hidden = true;
  }
}

function syncMuteIcons(controls: HTMLElement, muted: boolean): void {
  controls.querySelectorAll<SVGElement>('[data-icon]').forEach((icon) => {
    const isMutedIcon = icon.getAttribute('data-icon') === 'muted';
    icon.style.display = isMutedIcon === muted ? '' : 'none';
  });
}

function handleVimeoAction(btn: HTMLElement): void {
  const controls = btn.closest<HTMLElement>('[data-vimeo-controls]');
  const iframe = controls?.parentElement?.querySelector<HTMLIFrameElement>('[data-vimeo] iframe');
  if (!controls || !iframe) return;

  if (btn.dataset.action === 'toggle-mute') {
    const nowMuted = controls.dataset.muted !== '1';
    controls.dataset.muted = nowMuted ? '1' : '0';
    vimeoPost(iframe, 'setVolume', nowMuted ? 0 : 1);
    syncMuteIcons(controls, nowMuted);
  } else if (btn.dataset.action === 'replay') {
    vimeoPost(iframe, 'setCurrentTime', 0);
    vimeoPost(iframe, 'play');
  }
}

function initVimeo(): void {
  const boxes = document.querySelectorAll<HTMLElement>('[data-vimeo]');
  if (!boxes.length) return;
  const apply = (allowed: boolean) => boxes.forEach((box) => applyVimeoConsent(box, allowed));
  apply(hasConsent(VIMEO_CATEGORY));
  onConsentChange((state) => apply(state[VIMEO_CATEGORY] === true));
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

  if (target.closest('[data-vimeo-accept]')) return grantCategory(VIMEO_CATEGORY);

  const actionBtn = target.closest<HTMLElement>('[data-vimeo-controls] [data-action]');
  if (actionBtn) return handleVimeoAction(actionBtn);
});

initReadMore();
initVimeo();
