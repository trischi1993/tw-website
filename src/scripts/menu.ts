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

interface EarlyMenuBridgeElement extends HTMLElement {
  __earlyMenuBridge?: {
    cancel(): void;
  };
}

/**
 * Ein gemeinsamer Rotationsablauf fuer die Kopfzeile aller Seiten.
 *
 * Mobile Safari baut den Visual Viewport beim Drehen in mehreren Schritten um
 * und kann dabei alte Grafikschichten einzelner fixed-Kinder an ihrer
 * vorherigen Position weiterzeichnen. Einzelne Logo-/CTA-Schutzschichten
 * verschieben das Problem nur auf das jeweils andere Element. Deshalb wird
 * waehrend der instabilen Phase der komplette Header-Inhalt verborgen und
 * nach stabiler Geometrie als eine Einheit neu aufgebaut. Die normalen,
 * seitenspezifischen Load-Choreografien bleiben davon unberuehrt.
 */
if (header) {
  const portrait = window.matchMedia('(orientation: portrait)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logoText1 = Array.from(
    header.querySelectorAll<HTMLElement>('[data-nav-logo-text="1"]'),
  );
  const logoText2 = Array.from(
    header.querySelectorAll<HTMLElement>('[data-nav-logo-text="2"]'),
  );
  const logoLines = Array.from(
    header.querySelectorAll<HTMLElement>('[data-nav-logo-line]'),
  );
  const navRight = header.querySelector<HTMLElement>('[data-nav-right]');
  const headerMotionTargets = [
    ...logoText1,
    ...logoText2,
    ...logoLines,
    ...(navRight ? [navRight] : []),
  ];

  const MIN_HIDE_MS = 600;
  const VIEWPORT_QUIET_MS = 160;
  const HARD_SETTLE_MS = 1500;

  let pending = false;
  let pendingPortrait = portrait.matches;
  let startedAt = 0;
  let lastViewportChangeAt = 0;
  let settleTimer: number | undefined;
  let hardSettleTimer: number | undefined;
  let replayTimeline: gsap.core.Timeline | null = null;

  const cancelHeaderAnimations = () => {
    replayTimeline?.kill();
    replayTimeline = null;
    gsap.killTweensOf(headerMotionTargets);
    headerMotionTargets.forEach((target) => {
      target.getAnimations().forEach((animation) => animation.cancel());
    });
  };

  const clearOrientationStyles = () => {
    if (logoText1.length || logoText2.length) {
      gsap.set([...logoText1, ...logoText2], { clearProps: 'transform,willChange' });
    }
    if (logoLines.length) {
      gsap.set(logoLines, { clearProps: 'height,transform,transformOrigin,willChange' });
    }
    if (navRight) {
      gsap.set(navRight, { clearProps: 'transform,opacity,willChange' });
    }
  };

  const finishOrientationChange = () => {
    if (!pending) return;
    pending = false;
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    if (hardSettleTimer !== undefined) window.clearTimeout(hardSettleTimer);
    settleTimer = undefined;
    hardSettleTimer = undefined;

    cancelHeaderAnimations();
    clearOrientationStyles();

    if (reducedMotion) {
      header.classList.remove('is-orientation-changing');
      return;
    }

    // Alle Ausgangswerte werden gesetzt, solange der gesamte Inhalt noch
    // unsichtbar ist. Dadurch kann kein einzelnes Kind an der alten Position
    // aufblitzen, und der erste sichtbare Frame ist immer der definierte
    // Animationsanfang der vollstaendigen Kopfzeile.
    gsap.set(logoText1, { xPercent: 140, willChange: 'transform' });
    gsap.set(logoText2, { xPercent: -140, willChange: 'transform' });
    gsap.set(logoLines, {
      scaleY: 0,
      transformOrigin: '50% 50%',
      willChange: 'transform',
    });
    if (navRight) {
      gsap.set(navRight, {
        opacity: 0,
        x: '2.5rem',
        willChange: 'transform,opacity',
      });
    }

    replayTimeline = gsap.timeline({
      onComplete: () => {
        replayTimeline = null;
        clearOrientationStyles();
      },
    });
    replayTimeline.to(logoLines, {
      scaleY: 1,
      duration: 0.5,
      ease: EASE.outQuart,
    }, 0);
    replayTimeline.to(logoText1, {
      xPercent: 0,
      duration: 0.9,
      ease: EASE.outQuart,
    }, 0.06);
    replayTimeline.to(logoText2, {
      xPercent: 0,
      duration: 0.9,
      ease: EASE.outQuart,
    }, 0.06);
    if (navRight) {
      replayTimeline.to(navRight, {
        opacity: 1,
        duration: 1.08,
        ease: EASE.ease,
      }, 0.06);
      replayTimeline.to(navRight, {
        x: 0,
        duration: 0.9,
        ease: EASE.outQuart,
      }, 0.06);
    }

    header.classList.remove('is-orientation-changing');
  };

  const scheduleStableFinish = () => {
    if (!pending) return;
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    const now = performance.now();
    const earliestFinish = Math.max(
      startedAt + MIN_HIDE_MS,
      lastViewportChangeAt + VIEWPORT_QUIET_MS,
    );
    settleTimer = window.setTimeout(
      finishOrientationChange,
      Math.max(0, earliestFinish - now),
    );
  };

  const beginOrientationChange = () => {
    const isPortrait = portrait.matches;
    const now = performance.now();

    // orientationchange, Screen Orientation und MediaQuery melden dieselbe
    // Drehung je nach Browser nacheinander. Nur eine echte neue Ausrichtung
    // startet den Ablauf erneut; Duplikate verlaengern ihn nicht kuenstlich.
    if (pending && isPortrait === pendingPortrait) {
      lastViewportChangeAt = now;
      scheduleStableFinish();
      return;
    }

    pending = true;
    pendingPortrait = isPortrait;
    startedAt = now;
    lastViewportChangeAt = now;
    header.classList.add('is-orientation-changing');
    cancelHeaderAnimations();
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    if (hardSettleTimer !== undefined) window.clearTimeout(hardSettleTimer);
    scheduleStableFinish();
    hardSettleTimer = window.setTimeout(finishOrientationChange, HARD_SETTLE_MS);
  };

  const handleViewportResize = () => {
    if (!pending) return;
    lastViewportChangeAt = performance.now();
    scheduleStableFinish();
  };

  const handleOrientationSignal = () => beginOrientationChange();
  window.addEventListener('orientationchange', handleOrientationSignal, { passive: true });
  screen.orientation?.addEventListener('change', handleOrientationSignal);
  portrait.addEventListener('change', handleOrientationSignal);
  window.addEventListener('resize', handleViewportResize, { passive: true });
  window.visualViewport?.addEventListener('resize', handleViewportResize, { passive: true });
  window.addEventListener('lp:orientation-settled', scheduleStableFinish);
}

/** Stagger-Delays (s) nach DOM-Position: Startseite, Zum E-Book, ALL-IN-ONE,
    Über mich ⇒ is-1/is-4/is-3/is-2 ⇒ 1.0/1.3/1.2/1.1 (Original-Werte). */
const LINK_DELAYS_4 = [1.0, 1.3, 1.2, 1.1];

if (header && toggle && menu && panel && !menu.hasAttribute('data-aio-native-menu')) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactMenuMotion = window.matchMedia(
    '(max-width: 767px), (hover: none) and (pointer: coarse)',
  ).matches;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]'));
  const texts = links.map((l) => l.querySelector<HTMLElement>('[data-menu-text]'));
  const arrows = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-arrow]'));
  const burgerTop = header.querySelector<HTMLElement>('[data-burger-top]');
  const burgerMiddle = header.querySelector<HTMLElement>('[data-burger-middle]');
  const burgerBottom = header.querySelector<HTMLElement>('[data-burger-bottom]');
  const rightInner = header.querySelector<HTMLElement>('[data-nav-right-inner]');
  const headerCta = header.querySelector<HTMLElement>('.navbar__cta');
  const earlyMenu = menu as EarlyMenuBridgeElement;
  const openedBeforeMainModule =
    toggle.getAttribute('aria-expanded') === 'true' && !menu.hasAttribute('hidden');

  /* Der Parser-Bootstrap haelt das mobile Panel bereits offscreen im
     Compositor. Sobald die vollstaendige Steuerung uebernimmt, wird dieser
     Vorbereitungszustand atomar adoptiert: geschlossen wieder `hidden`, offen
     ohne irgendeinen sichtbaren Zwischenframe. */
  if (menu.hasAttribute('data-menu-prepared')) {
    menu.removeAttribute('data-menu-prepared');
    menu.style.removeProperty('pointer-events');
    if (openedBeforeMainModule) {
      menu.removeAttribute('inert');
      menu.removeAttribute('aria-hidden');
    } else {
      menu.setAttribute('hidden', '');
      menu.setAttribute('inert', '');
      menu.setAttribute('aria-hidden', 'true');
      panel.style.removeProperty('transform');
      panel.style.removeProperty('will-change');
      links.forEach((link) => {
        link.style.removeProperty('transform');
        link.style.removeProperty('opacity');
      });
      arrows.forEach((arrow) => arrow.style.removeProperty('opacity'));
    }
  }

  // Der geöffnete Zustand schiebt den Burger an die bisherige CTA-Position
  // und den CTA vollständig aus der Overflow-Maske. Der frühere Fixwert von
  // 9.2rem passte nicht mehr zur aktuellen Beschriftung „Insta-Check" und ließ
  // rechts einen schmalen Button-Rest stehen.
  const openMenuShift = () => {
    if (!rightInner || !headerCta) return 9.2 * 16;
    const gap = Number.parseFloat(getComputedStyle(rightInner).columnGap) || 0;
    return headerCta.getBoundingClientRect().width + gap;
  };

  const linkDelay = (i: number) => {
    if (compactMenuMotion) return 0.18 + i * 0.07;
    return links.length === 4 ? LINK_DELAYS_4[i] : 1.0 + i * 0.1;
  };

  // Initialzustände nur mit Motion (ohne JS/Reduced bleibt alles sichtbar,
  // das Menü ist ohnehin display:none bis zum Öffnen).
  if (!reduced && !openedBeforeMainModule) {
    gsap.set(links, { opacity: 0, x: -80 });
    gsap.set(arrows, { opacity: 0 });
    gsap.set(panel, { xPercent: -100 });
  }

  let tl: gsap.core.Timeline | null = null;
  let openFrame: number | undefined;

  const openAnim = () => {
    tl?.kill();
    gsap.set(panel, { willChange: 'transform' });
    tl = gsap.timeline({
      onComplete: () => gsap.set(panel, { clearProps: 'willChange' }),
    });
    tl.to(header, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.2, ease: EASE.ease }, 0);
    if (rightInner) {
      tl.to(rightInner, {
        x: openMenuShift,
        duration: compactMenuMotion ? 0.35 : 0.5,
        ease: EASE.outQuart,
      }, 0);
    }
    tl.to(panel, {
      xPercent: 0,
      duration: compactMenuMotion ? 0.72 : 1.5,
      ease: compactMenuMotion ? EASE.outQuart : EASE.inOutQuart,
      force3D: true,
    }, 0);
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
      tl!.to(link, {
        x: 0,
        duration: compactMenuMotion ? 0.35 : 0.6,
        ease: EASE.outQuart,
      }, linkDelay(i));
      tl!.to(link, {
        opacity: 1,
        duration: compactMenuMotion ? 0.25 : 0.4,
        ease: EASE.ease,
      }, linkDelay(i));
    });
    if (arrows.length) {
      tl.to(
        arrows,
        { opacity: 1, duration: compactMenuMotion ? 0.25 : 0.5, ease: EASE.ease },
        compactMenuMotion ? 0.45 : 1.5,
      );
    }
  };

  const closeAnim = (onDone: () => void) => {
    tl?.kill();
    gsap.set(panel, { willChange: 'transform' });
    tl = gsap.timeline({
      onComplete: () => {
        gsap.set(links, { x: -70 });
        gsap.set(panel, { clearProps: 'willChange' });
        // Die Menuebewegung braucht die Transform-Ebene nur waehrend der
        // Animation. Am geschlossenen Header muss sie weg, sonst kann iOS sie
        // beim spaeteren Drehen an der alten Viewportposition weiterzeichnen.
        if (rightInner) gsap.set(rightInner, { clearProps: 'transform' });
        onDone();
      },
    });
    tl.to(links, {
      opacity: 0,
      duration: compactMenuMotion ? 0.18 : 0.5,
      ease: EASE.ease,
    }, 0);
    if (burgerTop) {
      tl.to(burgerTop, {
        rotation: 0,
        duration: compactMenuMotion ? 0.25 : 0.3,
        ease: EASE.outQuart,
      }, 0);
    }
    if (burgerBottom) {
      tl.to(burgerBottom, {
        rotation: 0,
        duration: compactMenuMotion ? 0.25 : 0.3,
        ease: EASE.outQuart,
      }, 0);
    }
    if (arrows.length) {
      tl.to(arrows, {
        opacity: 0,
        duration: compactMenuMotion ? 0.18 : 0.5,
        ease: EASE.ease,
      }, 0);
    }
    tl.to(panel, {
      xPercent: -100,
      duration: compactMenuMotion ? 0.52 : 1.1,
      ease: compactMenuMotion ? EASE.outQuart : EASE.inOutQuart,
      force3D: true,
    }, compactMenuMotion ? 0 : 0.2);
    if (burgerTop) {
      tl.to(burgerTop, {
        y: 0,
        duration: compactMenuMotion ? 0.25 : 0.3,
        ease: EASE.outQuart,
      }, compactMenuMotion ? 0.1 : 0.2);
    }
    if (burgerBottom) {
      tl.to(burgerBottom, {
        y: 0,
        duration: compactMenuMotion ? 0.25 : 0.3,
        ease: EASE.outQuart,
      }, compactMenuMotion ? 0.1 : 0.2);
    }
    if (burgerMiddle) {
      tl.to(burgerMiddle, {
        xPercent: 0,
        duration: compactMenuMotion ? 0.25 : 0.3,
        ease: EASE.outQuart,
      }, compactMenuMotion ? 0.15 : 0.4);
    }
    if (rightInner) {
      tl.to(rightInner, {
        x: 0,
        duration: compactMenuMotion ? 0.35 : 0.5,
        ease: EASE.outQuart,
      }, compactMenuMotion ? 0.1 : 0.2);
    }
    tl.to(header, {
      backgroundColor: 'rgba(231,226,220,0.12)',
      duration: compactMenuMotion ? 0.3 : 0.5,
      ease: EASE.ease,
    }, compactMenuMotion ? 0.2 : 0.6);
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

  let lastFocused: HTMLElement | null = openedBeforeMainModule ? toggle : null;
  let isOpen = openedBeforeMainModule;

  if (openedBeforeMainModule) {
    // Der Inline-Bootstrap hat bereits auf den ersten Tap reagiert. Seine
    // browsernativen Animationen werden jetzt atomar in denselben GSAP-
    // Endzustand ueberfuehrt, damit die normale Schliessanimation und A11y-
    // Logik ohne sichtbaren Zustandswechsel uebernehmen koennen.
    earlyMenu.__earlyMenuBridge?.cancel();
    delete earlyMenu.__earlyMenuBridge;
    panel.style.removeProperty('transform');
    panel.style.removeProperty('will-change');
    links.forEach((link) => {
      link.style.removeProperty('transform');
      link.style.removeProperty('opacity');
    });
    arrows.forEach((arrow) => arrow.style.removeProperty('opacity'));
    gsap.set(panel, { xPercent: 0, clearProps: 'willChange' });
    gsap.set(links, { opacity: 1, x: 0 });
    gsap.set(arrows, { opacity: 1 });
    gsap.set(header, { backgroundColor: 'rgba(0,0,0,0)' });
    if (rightInner) gsap.set(rightInner, { x: openMenuShift() });
    if (burgerMiddle) gsap.set(burgerMiddle, { xPercent: 200 });
    if (burgerTop) gsap.set(burgerTop, { rotation: 45, y: 3.5 });
    if (burgerBottom) gsap.set(burgerBottom, { rotation: -45, y: -3.5 });
    backdrop().forEach((el) => el.setAttribute('inert', ''));
  }

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
      menu.removeAttribute('inert');
      menu.removeAttribute('aria-hidden');
      lastFocused = document.activeElement as HTMLElement;
      menu.removeAttribute('hidden');
      if (reduced) {
        gsap.set([...links, ...arrows], { clearProps: 'all' });
        gsap.set(panel, { xPercent: 0 });
      } else {
        /* Zwei Frames geben WebKit Zeit, die geschlossene Seite und die
           offscreen liegende Menue-Ebene getrennt zu compositen. Dadurch
           startet die Vollbild-Transformation nicht im selben Paint wie der
           Scroll-Lock und das Entfernen teurer Hintergrundfilter. */
        openFrame = requestAnimationFrame(() => {
          openFrame = requestAnimationFrame(() => {
            openFrame = undefined;
            if (isOpen) openAnim();
          });
        });
      }
    } else {
      menu.setAttribute('inert', '');
      menu.setAttribute('aria-hidden', 'true');
      if (openFrame !== undefined) {
        cancelAnimationFrame(openFrame);
        openFrame = undefined;
      }
      (lastFocused ?? toggle).focus();
      if (reduced) {
        menu.setAttribute('hidden', '');
      } else {
        closeAnim(() => menu.setAttribute('hidden', ''));
      }
    }
  };

  // Ab jetzt gibt der fruehe Inline-Listener jeden Klick an diese vollstaendige
  // Menue-Steuerung weiter.
  toggle.setAttribute('data-menu-ready', '');
  toggle.addEventListener('click', () => setOpen(!isOpen));
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

  // --- Link-Hover (a-56/a-57) + Klick-Wipe (a-74). -------------------------
  let navigationPending = false;

  links.forEach((link, i) => {
    const wipe = link.querySelector<HTMLElement>('[data-menu-wipe]');
    const clickWipe = link.querySelector<HTMLElement>('[data-menu-click-wipe]');
    const arrow = arrows[i];
    const text = texts[i];

    if (!reduced) {
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
    }

    link.addEventListener('click', (event) => {
      const modifiedClick =
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const opensSeparateContext = link.target === '_blank' || link.hasAttribute('download');

      // Modifizierte Klicks und Downloads behalten ihr natives Verhalten. Das
      // visuelle Feedback laeuft dabei wie im Webflow-Original parallel.
      if (modifiedClick || opensSeparateContext) {
        if (!reduced) {
          if (clickWipe) gsap.to(clickWipe, { height: '100%', duration: 0.3, ease: EASE.outQuart });
          if (arrow) gsap.to(arrow, { rotation: 45, duration: 0.3, ease: EASE.outQuart });
        }
        return;
      }

      event.preventDefault();
      if (navigationPending) return;
      navigationPending = true;

      const navigate = () => window.location.assign(link.href);

      if (reduced) {
        navigate();
        return;
      }

      // Webflow animiert die Klickflaeche in 300 ms von oben nach unten. Die
      // schnelle Astro-Navigation startet erst danach, damit der Endzustand
      // sichtbar erreicht wird, aber keine weitere Wartezeit entsteht.
      if (arrow) gsap.to(arrow, { rotation: 45, duration: 0.3, ease: EASE.outQuart });
      if (clickWipe) {
        gsap.to(clickWipe, {
          height: '100%',
          duration: 0.3,
          ease: EASE.outQuart,
          onComplete: navigate,
        });
      } else {
        window.setTimeout(navigate, 300);
      }
    });
  });
}
