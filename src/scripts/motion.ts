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

type ViewportScrollAnchor = {
  element: HTMLElement;
  ratio: number;
};

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

/** Hält beim Wechsel zwischen Hoch- und Querformat den gerade betrachteten
 * Inhalt im Viewport. Ein einmaliges Wiederherstellen reicht nicht: iOS und
 * GSAP vermessen den neuen Viewport in mehreren Phasen. Würden wir erst nach
 * der letzten Phase korrigieren, wäre genau das als verspätetes „Einrasten“
 * sichtbar. Deshalb wird derselbe Inhaltsanker bis zum Ende der Drehung in
 * jedem Frame stabil gehalten. */
function preservePageContentOnOrientation(portrait: MediaQueryList): void {
  const root = document.documentElement;
  const anchorSelector = [
    '.home-proof-card',
    '.home-proof__head',
    '.split-cta__grid',
    '.aio-results__card',
    '.aio-programme__group',
    '.ebook-benefit',
    '.ebook-bundle-card',
    '[data-module-title]',
    'article',
    'figure',
    'details',
    'li',
    'h1',
    'h2',
    'h3',
    'p',
    'section',
    'footer',
    'main',
  ].join(',');
  let anchor: ViewportScrollAnchor | undefined;
  let pendingAnchor: ViewportScrollAnchor | undefined;
  let captureFrame: number | undefined;
  let stabilizationFrame: number | undefined;
  let stabilizingUntil = 0;
  let stabilizing = false;
  let previousScrollBehavior = '';
  let previousOverflowAnchor = '';
  let wasPortrait = portrait.matches;

  const capture = () => {
    captureFrame = undefined;
    if (stabilizing) return;

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
    if (captureFrame !== undefined || stabilizing) return;
    captureFrame = requestAnimationFrame(capture);
  };

  const restore = (saved: ViewportScrollAnchor): boolean => {
    if (!saved.element.isConnected) return false;

    const bounds = saved.element.getBoundingClientRect();
    if (bounds.height <= 0) return false;

    const currentFocusY = bounds.top + bounds.height * saved.ratio;
    const correction = currentFocusY - root.clientHeight / 2;
    if (Math.abs(correction) >= 0.5) {
      // `scroll-behavior: smooth` kann während der responsiven GSAP-
      // Initialisierung erneut gesetzt werden. Die explizite Instant-Option
      // verhindert, dass sich mehrere Frame-Korrekturen als sichtbare Fahrt
      // beziehungsweise abschließendes Einrasten aufstauen.
      window.scrollTo({
        top: Math.max(0, window.scrollY + correction),
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
      ScrollTrigger.update();
    }
    return true;
  };

  const finishStabilizing = () => {
    if (stabilizationFrame !== undefined) cancelAnimationFrame(stabilizationFrame);
    stabilizationFrame = undefined;
    stabilizing = false;
    pendingAnchor = undefined;
    root.style.scrollBehavior = previousScrollBehavior;
    root.style.overflowAnchor = previousOverflowAnchor;
    requestAnimationFrame(capture);
  };

  const stabilize = (now: number) => {
    stabilizationFrame = undefined;
    const saved = pendingAnchor;
    if (!saved || !restore(saved) || now >= stabilizingUntil) {
      finishStabilizing();
      return;
    }
    stabilizationFrame = requestAnimationFrame(stabilize);
  };

  window.addEventListener('scroll', queueCapture, { passive: true });
  window.addEventListener('load', queueCapture, { once: true });
  window.addEventListener('lp:layout-changed', queueCapture);
  window.addEventListener('touchstart', () => {
    if (stabilizing) finishStabilizing();
  }, { passive: true });
  window.addEventListener('pointerdown', () => {
    if (stabilizing) finishStabilizing();
  }, { passive: true });
  window.addEventListener('wheel', () => {
    if (stabilizing) finishStabilizing();
  }, { passive: true });
  capture();

  // Ein Refresh kann innerhalb derselben Drehphase eine weitere Layoutstufe
  // auslösen. Der laufende Frame-Loop übernimmt die Korrektur noch vor dem
  // nächsten stabilen Bild.
  ScrollTrigger.addEventListener('refresh', () => {
    if (!stabilizing || stabilizationFrame !== undefined) return;
    stabilizationFrame = requestAnimationFrame(stabilize);
  });

  portrait.addEventListener('change', () => {
    const isPortrait = portrait.matches;
    if (isPortrait === wasPortrait) return;
    wasPortrait = isPortrait;

    pendingAnchor = anchor;
    if (!pendingAnchor?.element.isConnected) return;
    if (stabilizationFrame !== undefined) cancelAnimationFrame(stabilizationFrame);
    if (!stabilizing) {
      previousScrollBehavior = root.style.scrollBehavior;
      previousOverflowAnchor = root.style.overflowAnchor;
    }
    stabilizing = true;
    stabilizingUntil = performance.now() + 900;
    root.style.scrollBehavior = 'auto';
    root.style.overflowAnchor = 'none';

    // Das MediaQueryList-Event läuft bereits nach dem CSS-Umschalten. Die
    // synchrone erste Korrektur verhindert deshalb schon den ersten sichtbaren
    // Zwischenzustand; der Loop fängt die späteren iOS-/GSAP-Stufen ab.
    restore(pendingAnchor);
    stabilizationFrame = requestAnimationFrame(stabilize);
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

  /* Bereits abgespielte Entrance- und PAGE_LOAD-Animationen bleiben bei einem
     Breakpoint-Wechsel sichtbar. Ein kompletter IX2-Neustart würde Überschrift,
     Karten und Navbar während der Drehung kurz auf opacity 0 setzen und damit
     als Einrasten auffallen. Noch ausstehende onEnterOnce-Trigger beobachten
     resize/orientationchange bereits selbst; die Zusatzprüfung deckt die zwei
     gestaffelten iOS-Viewport-Phasen ab. */
  const portrait = window.matchMedia('(orientation: portrait)');
  if (isAboutPage) preserveAboutContentAfterTimeline(portrait);
  else preservePageContentOnOrientation(portrait);
  let orientationSettleTimer: number | undefined;
  portrait.addEventListener('change', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        refreshEnterOnce();
      });
    });
    if (orientationSettleTimer !== undefined) window.clearTimeout(orientationSettleTimer);
    orientationSettleTimer = window.setTimeout(() => {
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
