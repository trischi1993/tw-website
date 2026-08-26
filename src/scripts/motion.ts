import { gsap, ScrollTrigger, refreshEnterOnce } from './motion/util';
import * as lines from './motion/lines';
import * as reveals from './motion/reveals';
import * as homeLoad from './motion/home-load';
import * as homeHero from './motion/home-hero';
import * as results from './motion/results';
import * as banner from './motion/banner';
import * as gallery from './motion/gallery';
import * as faqHover from './motion/faq-hover';
import * as aioLoad from './motion/aio-load';
import * as ebookLoad from './motion/ebook-load';
import * as moduleScrub from './motion/module';
import * as bonuses from './motion/bonuses';
import * as aboutLoad from './motion/about-load';
import * as erfolgsCheckLoad from './motion/erfolgs-check-load';
import * as timeline from './motion/timeline';
import * as interests from './motion/interests';
import * as footer from './motion/footer';
import * as buttons from './motion/buttons';
import * as glow from './motion/glow';

type WebflowMediaKey = 'main' | 'medium' | 'small' | 'tiny';

type ViewportScrollAnchor = {
  element: HTMLElement;
  ratio: number;
};

function webflowMediaKey(width = window.innerWidth): WebflowMediaKey {
  if (width >= 992) return 'main';
  if (width >= 768) return 'medium';
  if (width >= 480) return 'small';
  return 'tiny';
}

/** Hält nach der responsiv ihre Höhe wechselnden Werdegang-Timeline den
 * tatsächlich sichtbaren Folgeinhalt im Viewport. Eine absolute Scrollposition
 * reicht dort nicht: 500vh im Hochformat und 1200vh im Querformat ergeben auf
 * einem Handy unterschiedlich viele Pixel. */
function preserveAboutContentAfterTimeline(portrait: MediaQueryList): void {
  const timeline = document.querySelector<HTMLElement>('.tl');
  if (!timeline) return;

  const root = document.documentElement;
  const anchorSelector = [
    '.interests h2',
    '.interests__intro',
    '.interests__item',
    '.marquee',
    '.final-cta h2',
    '.final-cta p',
    '.final-cta__buttons',
    '.interests',
    '.final-cta',
    'footer',
  ].join(',');
  let anchor: ViewportScrollAnchor | undefined;
  let captureFrame: number | undefined;
  let wasPortrait = portrait.matches;

  const capture = () => {
    captureFrame = undefined;
    const centerX = root.clientWidth / 2;
    const centerY = root.clientHeight / 2;
    const hit = document.elementFromPoint(centerX, centerY) as HTMLElement | null;
    const element = hit?.closest<HTMLElement>(anchorSelector) ?? hit?.closest<HTMLElement>('section, footer');
    const followsTimeline = element
      && !timeline.contains(element)
      && Boolean(timeline.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);

    if (!element || !followsTimeline) {
      anchor = undefined;
      return;
    }

    const bounds = element.getBoundingClientRect();
    if (bounds.height <= 0) {
      anchor = undefined;
      return;
    }

    anchor = {
      element,
      ratio: Math.min(1, Math.max(0, (centerY - bounds.top) / bounds.height)),
    };
  };

  const queueCapture = () => {
    if (captureFrame !== undefined) return;
    captureFrame = requestAnimationFrame(capture);
  };

  const restore = (saved: ViewportScrollAnchor): void => {
    if (!saved.element.isConnected) return;

    const bounds = saved.element.getBoundingClientRect();
    const currentFocusY = bounds.top + bounds.height * saved.ratio;
    const targetY = window.scrollY + currentFocusY - root.clientHeight / 2;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, targetY);
    root.style.scrollBehavior = previousBehavior;

    // Aktualisiert auch GSAPs internen Scroller-Cache auf die korrigierte
    // Position, damit ein späterer Refresh nicht auf den alten Wert zurückfällt.
    ScrollTrigger.update();
    capture();
  };

  window.addEventListener('scroll', queueCapture, { passive: true });
  window.addEventListener('load', queueCapture, { once: true });
  capture();

  // Dieses Event läuft nach GSAPs vollständigem matchMedia-Refresh, aber noch
  // im selben Task und damit vor dem nächsten sichtbaren Browser-Frame.
  ScrollTrigger.addEventListener('matchMedia', () => {
    const isPortrait = portrait.matches;
    if (isPortrait === wasPortrait) return;
    wasPortrait = isPortrait;

    const saved = anchor;
    if (!saved?.element.isConnected) return;
    restore(saved);
  });
}

/** Hält auf der Startseite beim Wechsel zwischen Hoch- und Querformat den
 * gerade betrachteten Inhalt im Viewport. Ein bloßes Wiederherstellen von
 * scrollY reicht nicht, weil Hero, Carousel und Angebotsbrücke ihre Höhen beim
 * Drehen deutlich ändern. Deshalb wird das Element in der Viewportmitte samt
 * relativer Position gespeichert und nach GSAPs responsivem Neuaufbau erneut
 * zentriert. */
function preserveHomeContentOnOrientation(portrait: MediaQueryList): void {
  const homeHero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!homeHero) return;

  const root = document.documentElement;
  const anchorSelector = [
    '.home-proof-card',
    '.home-proof__head',
    '.split-cta__grid',
    'article',
    'section',
    'footer',
    'main',
  ].join(',');
  let anchor: ViewportScrollAnchor | undefined;
  let pendingAnchor: ViewportScrollAnchor | undefined;
  let captureFrame: number | undefined;
  let settleTimer: number | undefined;
  let restoring = false;
  let wasPortrait = portrait.matches;

  const capture = () => {
    captureFrame = undefined;
    if (restoring) return;

    const centerX = root.clientWidth / 2;
    const centerY = root.clientHeight / 2;
    const hit = document.elementFromPoint(centerX, centerY) as HTMLElement | null;
    const element = hit?.closest<HTMLElement>(anchorSelector);
    if (!element || element === document.body || element === root) return;

    const bounds = element.getBoundingClientRect();
    if (bounds.height <= 0) return;

    anchor = {
      element,
      ratio: Math.min(1, Math.max(0, (centerY - bounds.top) / bounds.height)),
    };
  };

  const queueCapture = () => {
    if (captureFrame !== undefined || restoring) return;
    captureFrame = requestAnimationFrame(capture);
  };

  const restore = (saved: ViewportScrollAnchor): void => {
    if (!saved.element.isConnected) return;

    const bounds = saved.element.getBoundingClientRect();
    if (bounds.height <= 0) return;

    const currentFocusY = bounds.top + bounds.height * saved.ratio;
    const targetY = window.scrollY + currentFocusY - root.clientHeight / 2;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, targetY));
    root.style.scrollBehavior = previousBehavior;
    ScrollTrigger.update();
  };

  const restorePending = () => {
    const saved = pendingAnchor;
    if (!saved) return;
    restore(saved);
  };

  window.addEventListener('scroll', queueCapture, { passive: true });
  window.addEventListener('load', queueCapture, { once: true });
  capture();

  // matchMedia und der explizite Refresh nach der stabilen iOS-Phase können
  // den Window-Scroller jeweils neu vermessen. Nach jedem Refresh wird deshalb
  // der vor der Drehung gespeicherte Inhaltsanker erneut hergestellt.
  ScrollTrigger.addEventListener('refresh', () => {
    if (!restoring || !pendingAnchor) return;
    requestAnimationFrame(restorePending);
  });

  portrait.addEventListener('change', () => {
    const isPortrait = portrait.matches;
    if (isPortrait === wasPortrait) return;
    wasPortrait = isPortrait;

    pendingAnchor = anchor;
    if (!pendingAnchor?.element.isConnected) return;
    restoring = true;

    requestAnimationFrame(() => requestAnimationFrame(restorePending));
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      restorePending();
      pendingAnchor = undefined;
      restoring = false;
      requestAnimationFrame(capture);
    }, 750);
  });
}

/* ---------------------------------------------------------------------------
   Zentraler Motion-Init - 1:1-Nachbau der Webflow-Animationen (IX2 + IX3 +
   Custom-Scripts, dekodiert aus dem Export; Referenz im Repo-HANDOVER).

   Grundsätze:
   - Initialzustände NUR per gsap.set in den Modulen - nie im CSS. Ohne JS ist
     alles sichtbar; Scroll-Strecken-Layouts aktiviert erst `html.has-motion`.
   - Jedes Modul setzt seine Initialzustände innerhalb DERSELBEN
     matchMedia-Bedingung wie seine Animation (sonst versteckt z. B. der
     Footer-Reveal auf Mobile Inhalte, obwohl er dort nie abspielt).
   - prefers-reduced-motion: kompletter No-op (statische Layouts). Funktionale
     Interaktionen (Menü, FAQ, Modals, Video) leben in widgets/menu
     und bleiben auch dann bedienbar.
   --------------------------------------------------------------------------- */

function init(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('has-motion');
  // Signal fürs Pre-Paint-Failsafe (BaseLayout-Inline-Script): das Motion-Bundle
  // hat initialisiert und übernimmt die Reveals - Failsafe NICHT auslösen.
  document.documentElement.classList.add('motion-ready');
  ScrollTrigger.config({
    ignoreMobileResize: true,
    // Mobile Browserleisten verändern beim Scrollen nur die Viewport-Höhe.
    // Besonders im flachen Querformat überschreitet das GSAPs prozentuale
    // Ignore-Schwelle und löst sonst einen vollständigen Refresh aus, der den
    // Scroller intern kurz auf 0 setzt. iOS Safari kann während einer aktiven
    // Berührung dort hängen bleiben. Echte Rotations-/Breakpoint-Wechsel
    // verarbeitet gsap.matchMedia weiterhin selbst; Desktop-Resize bleibt an.
    autoRefreshEvents: ScrollTrigger.isTouch === 1
      ? 'visibilitychange,DOMContentLoaded,load'
      : 'visibilitychange,DOMContentLoaded,load,resize',
  });

  /* Webflows Scroll-Engine bleibt auf der Über-mich-Seite auch im statischen
     Tiny-Layout aktiv. Bei uns wäre die responsive Timeline dort dagegen der
     einzige ScrollTrigger: Beim ersten Aktivieren kennt GSAP den Scroller noch
     nicht, beim Deaktivieren löscht es mit dem letzten Trigger dessen gemerkte
     Position. Dieser permanente, wirkungslose Trigger hält nur den Window-
     Scroller registriert. So zeichnet GSAP den echten Scrollstand VOR jedem
     Timeline-Neuaufbau/-Abbau auf und restauriert ihn samt Animationszustand. */
  const isAboutPage = Boolean(document.querySelector('[data-about-hero]'));
  if (isAboutPage) {
    ScrollTrigger.create({ id: 'about-scroll-state', start: 0, end: 1 });
  }

  const mm = gsap.matchMedia();

  lines.init();
  reveals.init(mm);
  homeLoad.init(mm);
  homeHero.init(mm);
  results.init(mm);
  banner.init(mm);
  gallery.init(mm);
  faqHover.init(mm);
  aioLoad.init(mm);
  ebookLoad.init(mm);
  moduleScrub.init(mm);
  bonuses.init(mm);
  aboutLoad.init(mm);
  erfolgsCheckLoad.init();
  timeline.init(mm);
  interests.init(mm);
  footer.init(mm);
  buttons.init(mm);
  glow.init(mm);

  ScrollTrigger.refresh();

  // Nach Bildern/Videos stimmen die Trigger-Positionen endgültig.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* Webflow stoppt und initialisiert IX2 neu, sobald resize/orientationchange
     den aktiven main/medium/small/tiny-Breakpoint ändert. Generische Reveals
     dürfen dadurch erneut starten; bereits sichtbare FAQ-Zeilen behalten ihren
     einmaligen Zustand. Reine Höhenänderungen durch mobile Browserleisten
     ändern den Key nicht. */
  let currentMediaKey = webflowMediaKey();
  let breakpointFrame: number | undefined;
  let navbarReplayFrame: number | undefined;
  const queueNavbarReplay = () => {
    if (navbarReplayFrame !== undefined) cancelAnimationFrame(navbarReplayFrame);
    navbarReplayFrame = requestAnimationFrame(() => {
      navbarReplayFrame = undefined;
      aboutLoad.restartNavbar();
      aioLoad.restartNavbar();
      ebookLoad.restartNavbar();
      erfolgsCheckLoad.restartNavbar();
    });
  };
  ScrollTrigger.addEventListener('matchMedia', queueNavbarReplay);
  const restartAfterBreakpointChange = () => {
    const nextMediaKey = webflowMediaKey();
    if (nextMediaKey === currentMediaKey) return;
    currentMediaKey = nextMediaKey;
    reveals.restart();
    moduleScrub.restartEntrances();
    homeLoad.restart();
  };
  const queueBreakpointCheck = () => {
    if (breakpointFrame !== undefined) return;
    breakpointFrame = requestAnimationFrame(() => {
      breakpointFrame = undefined;
      restartAfterBreakpointChange();
    });
  };
  window.addEventListener('resize', queueBreakpointCheck, { passive: true });

  // Webflow prüft SCROLL_INTO_VIEW auch direkt auf orientationchange. Safari
  // liefert die endgültige clientHeight teils erst nach der CSS-Drehung; daher
  // prüfen wir nach zwei Frames und nach der stabilen 600-ms-Phase nochmals.
  const portrait = window.matchMedia('(orientation: portrait)');
  if (isAboutPage) preserveAboutContentAfterTimeline(portrait);
  preserveHomeContentOnOrientation(portrait);
  let orientationSettleTimer: number | undefined;
  portrait.addEventListener('change', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restartAfterBreakpointChange();
        refreshEnterOnce();
      });
    });
    if (orientationSettleTimer !== undefined) window.clearTimeout(orientationSettleTimer);
    orientationSettleTimer = window.setTimeout(() => {
      restartAfterBreakpointChange();
      refreshEnterOnce();
      // iOS liefert die endgültige Landscape-Höhe erst nach dem Drehen. Da
      // Touch-Resizes oben bewusst nicht automatisch refreshen, muss GSAP die
      // Hero-/ScrollTrigger-Strecken nach der stabilen Phase neu vermessen.
      ScrollTrigger.refresh();
    }, 600);
  });

  // Laufzeit-Layoutänderungen (widgets.ts: FAQ öffnen, Tab wechseln,
  // „weiterlesen", Testimonials nachladen) verschieben nachfolgende Inhalte und
  // machen die once-Reveal-Trigger darunter stale → sie würden verfrüht feuern.
  // `lp:layout-changed` lässt die Positionen neu vermessen. rAF-debounced, damit
  // ein Interaktions-Burst nur EIN refresh() auslöst. Ohne Interaktion feuert
  // der Listener nie → normales Scrollen bleibt unverändert. Zukunftssicher:
  // jeder neue Code, der die Höhe ändert, muss nur dieses Event dispatchen.
  // Nur bei aktivem Motion registriert (reduced-motion kehrt oben früh zurück →
  // das Event ist dann ein folgenloser No-op).
  let refreshQueued = false;
  window.addEventListener('lp:layout-changed', () => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      ScrollTrigger.refresh();
    });
  });
}

init();
