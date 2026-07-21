import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------------------------------------------------------------------------
   Scroll-/Hover-Animationen, 1:1 nach docs/webflow-spec/animations.md.
   Data-Attribut-getrieben, ein zentraler Init.

   Grundsätze:
   - Initialzustände NUR hier per gsap.set - nie im CSS. Ohne JS ist alles
     sichtbar; die Scroll-Strecken-Layouts (Hero-Wipe 300vh, Results 200vh,
     Timeline 1200vh) aktiviert erst die Klasse `has-motion` am <html>
     (sections.css).
   - prefers-reduced-motion: kompletter No-op (statisch gestapelte Layouts).
   - Entrance-Reveals einmalig (once), Trigger `top 85%` ≈ Webflow-Offset 15%.
   --------------------------------------------------------------------------- */

const OUT = 'power3.out';
const REVEAL_START = 'top 85%';

const desktop = '(min-width: 992px)';
const timelineOn = '(min-width: 480px)';
const finePointer = '(hover: hover) and (pointer: fine)';

function once(trigger: Element, onEnter: () => void, start = REVEAL_START): void {
  ScrollTrigger.create({ trigger, start, once: true, onEnter });
}

/* --- Entrance-Reveals ([data-anim]) --------------------------------------- */

function initLines(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="lines"]').forEach((el) => {
    const duration = parseFloat(el.dataset.speed ?? '') || 0.7;
    const delay = parseFloat(el.dataset.delay ?? '') || 0;
    const amount = parseFloat(el.dataset.stagger ?? '') || 0.2;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.lines,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration,
            delay,
            ease: 'power2.out',
            stagger: { amount },
            scrollTrigger: { trigger: el, start: 'top bottom', once: true },
            immediateRender: true,
          },
        ),
    });
  });
}

function initReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-anim]').forEach((el) => {
    const kind = el.dataset.anim;
    const delay = parseFloat(el.dataset.delay ?? '');
    switch (kind) {
      case 'reveal-up': {
        // H5: 800 ms, +300 ms Delay, y 1rem, blur(5px)→0.
        const d = Number.isFinite(delay) ? delay : 0.3;
        gsap.set(el, { opacity: 0, y: 16, filter: 'blur(5px)' });
        once(el, () =>
          gsap.to(el, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            delay: d,
            ease: OUT,
            clearProps: 'filter',
          }),
        );
        break;
      }
      case 'reveal-left': {
        // H4: FAQ-Items von links komplett einschieben, 1500 ms.
        gsap.set(el, { xPercent: -100, opacity: 0 });
        once(el, () =>
          gsap.to(el, { xPercent: 0, opacity: 1, duration: 1.5, delay: delay || 0, ease: OUT }),
        );
        break;
      }
      case 'reveal-split': {
        // H3: Label von links (-1rem), Text von rechts (+1.5rem), 1150 ms.
        const a = el.querySelectorAll('[data-split-a]');
        const b = el.querySelectorAll('[data-split-b]');
        gsap.set(a, { x: -16, opacity: 0 });
        gsap.set(b, { x: 24, opacity: 0 });
        once(el, () => {
          gsap.to(a, { x: 0, opacity: 1, duration: 1.15, ease: OUT });
          gsap.to(b, { x: 0, opacity: 1, duration: 1.15, ease: OUT });
        });
        break;
      }
      case 'reveal-x': {
        // Buttons: von rechts (40px) einfahren.
        gsap.set(el, { x: 40, opacity: 0 });
        once(el, () =>
          gsap.to(el, { x: 0, opacity: 1, duration: 0.8, delay: delay || 0, ease: OUT }),
        );
        break;
      }
      case 'fade': {
        gsap.set(el, { opacity: 0 });
        once(el, () =>
          gsap.to(el, { opacity: 1, duration: 0.8, delay: delay || 0, ease: 'power1.out' }),
        );
        break;
      }
      default:
        break; // 'lines' übernimmt initLines()
    }
  });

  // Template-Hook des generischen Text-Abschnitts: wie reveal-up, ohne Delay.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 16 });
    once(el, () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: OUT }));
  });
}

/* --- Linien-„Draw" (Modul-Titelzeile, USP-Trennlinien) --------------------- */

function initLineDraw(): void {
  document.querySelectorAll<HTMLElement>('[data-line-draw]').forEach((line) => {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    once(line, () => gsap.to(line, { scaleX: 1, duration: 1.2, ease: OUT }));
  });
}

/* --- Scrubs ---------------------------------------------------------------- */

/** Home-Hero: Wipe-Fläche über dem Bild wird über die 300vh-Strecke
    weggeblendet (Desktop; ≤991 ist das Layout statisch gestapelt). */
function initHeroScroll(mm: gsap.MatchMedia): void {
  mm.add(desktop, () => {
    document.querySelectorAll<HTMLElement>('[data-hero-scroll]').forEach((root) => {
      const track = root.querySelector('.hhero__track');
      const wipe = root.querySelector('[data-hero-wipe]');
      if (!track || !wipe) return;
      gsap.fromTo(
        wipe,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: true },
        },
      );
    });
  });
}

/** Scroll-Indikator im Hero: dünne Linie läuft endlos durch ihr Fenster. */
function initHeroScrollLine(): void {
  document.querySelectorAll<HTMLElement>('[data-hero-scroll-line]').forEach((line) => {
    gsap.fromTo(
      line,
      { yPercent: -100 },
      { yPercent: 100, duration: 2, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.4 },
    );
  });
}

/** Über-mich-Portrait: Wipe-Fläche schiebt sich beim Laden nach rechts weg. */
function initAboutWipe(): void {
  document.querySelectorAll<HTMLElement>('[data-wipe]').forEach((wipe) => {
    gsap.to(wipe, { xPercent: 101, duration: 1.2, delay: 0.5, ease: 'power4.inOut' });
  });
}

/** Zahlen & Fakten: Karten fächern über die 200vh-Strecke auf; die beiden
    Titel-Ebenen (gefüllt/Outline) schieben sich gegenläufig. */
function initResults(): void {
  document.querySelectorAll<HTMLElement>('[data-results]').forEach((root) => {
    const track = root.querySelector('.results__track');
    if (!track) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    const t1 = root.querySelector('[data-results-title-1]');
    const t2 = root.querySelector('[data-results-title-2]');
    if (t1) tl.fromTo(t1, { xPercent: 3 }, { xPercent: -3, ease: 'none' }, 0);
    if (t2) tl.fromTo(t2, { xPercent: -3 }, { xPercent: 3, ease: 'none' }, 0);
    root.querySelectorAll<HTMLElement>('[data-results-card]').forEach((card) => {
      const i = parseInt(card.dataset.resultsCard ?? '1', 10) - 1;
      if (i <= 0) return;
      tl.fromTo(
        card,
        { rotation: 0, x: 0, y: 0 },
        { rotation: i * 4, x: i * 40, y: i * 14, transformOrigin: '20% 80%', ease: 'none' },
        0,
      );
    });
  });
}

/** Galerie („Bekannt aus"/Säulen): die 180%-Reihe driftet horizontal durch
    ihr Fenster, während die Section den Viewport passiert (nur Desktop;
    darunter nativer Overflow-Scroll). */
function initGallery(mm: gsap.MatchMedia): void {
  mm.add(desktop, () => {
    document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((row) => {
      const wrapper = row.parentElement;
      if (!wrapper) return;
      const shift = () => Math.max(0, (row.scrollWidth - wrapper.clientWidth) / 2);
      gsap.fromTo(
        row,
        { x: () => shift() },
        {
          x: () => -shift(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  });
}

/** Testimonial-Banner: die zwei Headline-Ebenen laufen gegenläufig. */
function initBanner(): void {
  document.querySelectorAll<HTMLElement>('[data-banner]').forEach((banner) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: banner, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const top = banner.querySelector('[data-banner-top]');
    const bottom = banner.querySelector('[data-banner-bottom]');
    if (top) tl.fromTo(top, { xPercent: 3 }, { xPercent: -5, ease: 'none' }, 0);
    if (bottom) tl.fromTo(bottom, { xPercent: -3 }, { xPercent: 5, ease: 'none' }, 0);
  });
}

/** Werdegang-Timeline: Sticky-Pin über 1200vh, die 9-Stationen-Liste fährt
    horizontal durch das 45vw-Fenster. ≤479 deaktiviert (vertikale Liste). */
function initTimeline(mm: gsap.MatchMedia): void {
  mm.add(timelineOn, () => {
    document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((root) => {
      const track = root.querySelector<HTMLElement>('[data-timeline-track]');
      const list = root.querySelector<HTMLElement>('[data-timeline-list]');
      const windowEl = list?.parentElement;
      if (!track || !list || !windowEl) return;
      gsap.to(list, {
        x: () => -Math.max(0, list.scrollWidth - windowEl.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
}

/* --- Hover (Desktop, feiner Pointer) --------------------------------------- */

/** G4: Glow-Kreis im Gold-Button folgt dem Cursor, zentriert beim Verlassen. */
function initGlowFollow(mm: gsap.MatchMedia): void {
  mm.add(`${desktop} and ${finePointer}`, () => {
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('[data-glow-circle]').forEach((circle) => {
      const btn = circle.closest<HTMLElement>('a, button');
      if (!btn) return;
      const xTo = gsap.quickTo(circle, 'xPercent', { duration: 0.5, ease: 'power2.out' });
      const yTo = gsap.quickTo(circle, 'y', { duration: 0.5, ease: 'power2.out' });
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 100);
        yTo(((e.clientY - r.top) / r.height - 0.5) * 100);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        btn.removeEventListener('mousemove', move);
        btn.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  });
}

/** H6: „Bekannt aus"-Karten - Titel-Overlay gleitet hoch, Bild zoomt + blurt.
    Nur für Karten mit sichtbarem Titel-Overlay. */
function initWorkItemHover(mm: gsap.MatchMedia): void {
  mm.add(`${desktop} and ${finePointer}`, () => {
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('.gallery__item').forEach((item) => {
      const overlay = item.querySelector<HTMLElement>('.gallery__item-title:not(.visually-hidden)');
      const img = item.querySelector('img');
      if (!overlay || !img) return;
      gsap.set(overlay, { yPercent: 101, opacity: 0 });
      const enter = () => {
        gsap.to(overlay, { yPercent: 0, duration: 0.8, ease: OUT });
        gsap.to(overlay, { opacity: 1, duration: 0.6, ease: 'power1.out' });
        gsap.to(img, { scale: 1.05, filter: 'blur(6px)', duration: 0.75, ease: OUT });
      };
      const leave = () => {
        gsap.to(overlay, { yPercent: 101, opacity: 0, duration: 0.67, ease: OUT });
        gsap.to(img, { scale: 1, filter: 'blur(0px)', duration: 0.65, ease: OUT });
      };
      item.addEventListener('mouseenter', enter);
      item.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        item.removeEventListener('mouseenter', enter);
        item.removeEventListener('mouseleave', leave);
        gsap.set(overlay, { clearProps: 'all' });
        gsap.set(img, { clearProps: 'all' });
      });
    });
    return () => cleanups.forEach((fn) => fn());
  });
}

/* --- Init ------------------------------------------------------------------ */

function init(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Schaltet die Scroll-Strecken-Layouts frei (sections.css: html.has-motion).
  document.documentElement.classList.add('has-motion');
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();

  const start = () => {
    initLines();
    initReveals();
    initLineDraw();
    initHeroScroll(mm);
    initHeroScrollLine();
    initAboutWipe();
    initResults();
    initGallery(mm);
    initBanner();
    initTimeline(mm);
    initGlowFollow(mm);
    initWorkItemHover(mm);
    ScrollTrigger.refresh();
  };

  // Fonts zuerst: SplitText soll mit finalen Zeilenumbrüchen splitten.
  if (document.fonts?.ready) {
    document.fonts.ready.then(start, start);
  } else {
    start();
  }

  // Nach Bildern/Videos stimmen die Trigger-Positionen endgültig.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

init();
