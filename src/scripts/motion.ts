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
 * sichtbar. Deshalb wird derselbe Inhaltsanker bei den tatsaechlichen
 * Resize-, Visual-Viewport- und GSAP-Refresh-Stufen wiederhergestellt. */
function preservePageContentOnOrientation(portrait: MediaQueryList): void {
  const root = document.documentElement;
  /* Stabile Layoutblöcke bewusst vor generischen Elementen prüfen. `closest()`
   * beachtet die Reihenfolge einer kombinierten Selektorliste nicht: Der alte
   * Code fing dadurch in Carousels oft ein bewegtes <figure> und in USP-Listen
   * einen einzelnen Absatz/Listeneintrag statt der zugehörigen Karte ab. Beim
   * responsiven Umbau wechselte der sichtbare Bezug anschließend und die Seite
   * rastete in zwei Stufen ein. */
  const anchorSelectors = [
    '[data-results]',
    '.home-proof-card',
    '.home-proof__head',
    '.split-cta__grid',
    '.aio-results__outcomes',
    '.aio-results__card',
    '.aio-programme__group',
    '.usp__item',
    '.ebook-benefit',
    '.ebook-bundle-card',
    '[data-module-title]',
    '.success-check__hero',
    '.success-check__start-card',
    '[data-check-stage]',
    '.prose > *',
    'article',
    'details',
  ];
  const anchorScopeSelector = 'section,footer,main';
  let anchor: ViewportScrollAnchor | undefined;
  let pendingAnchor: ViewportScrollAnchor | undefined;
  let captureFrame: number | undefined;
  let restoreFrame: number | undefined;
  let finishTimer: number | undefined;
  let hardStopTimer: number | undefined;
  let geometryObserver: ResizeObserver | undefined;
  let stabilizing = false;
  let layoutSettled = false;
  let previousScrollBehavior = '';
  let previousOverflowAnchor = '';
  let wasPortrait = portrait.matches;

  const findAnchor = (
    hit: HTMLElement | null,
    centerX: number,
    centerY: number,
  ): HTMLElement | null => {
    if (!hit) return null;
    for (const selector of anchorSelectors) {
      const candidate = hit.closest<HTMLElement>(selector);
      if (candidate) return candidate;
    }

    /* In zweispaltigen Rastern kann die Viewportmitte exakt in der Luecke
     * liegen. Dann waere `closest()` direkt bei der ganzen Section gelandet.
     * Stattdessen den naechsten sichtbaren stabilen Block innerhalb dieser
     * Section waehlen, damit beim Rueckdrehen derselbe Inhalt erhalten bleibt. */
    const scope = hit.closest<HTMLElement>(anchorScopeSelector);
    if (!scope) return null;
    for (const selector of anchorSelectors) {
      const candidates = Array.from(scope.querySelectorAll<HTMLElement>(selector))
        .filter((candidate) => {
          const bounds = candidate.getBoundingClientRect();
          return bounds.width > 0
            && bounds.height > 0
            && bounds.right >= 0
            && bounds.left <= root.clientWidth
            && bounds.bottom >= 0
            && bounds.top <= root.clientHeight;
        });
      if (!candidates.length) continue;
      return candidates.reduce((closest, candidate) => {
        const distance = (element: HTMLElement) => {
          const bounds = element.getBoundingClientRect();
          const dx = centerX < bounds.left
            ? bounds.left - centerX
            : centerX > bounds.right
              ? centerX - bounds.right
              : 0;
          const dy = centerY < bounds.top
            ? bounds.top - centerY
            : centerY > bounds.bottom
              ? centerY - bounds.bottom
              : 0;
          return Math.hypot(dx, dy);
        };
        return distance(candidate) < distance(closest) ? candidate : closest;
      });
    }
    return scope;
  };

  const capture = () => {
    captureFrame = undefined;
    if (stabilizing) return;

    const centerX = root.clientWidth / 2;
    const centerY = root.clientHeight / 2;
    const hit = document.elementFromPoint(centerX, centerY) as HTMLElement | null;
    const element = findAnchor(hit, centerX, centerY);
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
    if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
    if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    if (hardStopTimer !== undefined) window.clearTimeout(hardStopTimer);
    restoreFrame = undefined;
    finishTimer = undefined;
    hardStopTimer = undefined;
    geometryObserver?.disconnect();
    geometryObserver = undefined;
    stabilizing = false;
    layoutSettled = false;
    pendingAnchor = undefined;
    root.style.scrollBehavior = previousScrollBehavior;
    root.style.overflowAnchor = previousOverflowAnchor;
    requestAnimationFrame(capture);
  };

  const restorePending = () => {
    restoreFrame = undefined;
    const saved = pendingAnchor;
    if (!saved || !restore(saved)) {
      finishStabilizing();
    }
  };

  const queueRestore = () => {
    if (!stabilizing || restoreFrame !== undefined) return;
    restoreFrame = requestAnimationFrame(restorePending);
  };

  const scheduleFinish = () => {
    if (!stabilizing || !layoutSettled) return;
    if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    // Erst beenden, wenn nach dem finalen GSAP-Refresh und der letzten
    // Visual-Viewport-Aenderung kurz Ruhe eingekehrt ist. So werden auch die
    // zwei iOS-Rotationsphasen erfasst, ohne permanent scrollTo auszufuehren.
    finishTimer = window.setTimeout(() => {
      restorePending();
      finishStabilizing();
    }, 180);
  };

  const handleGeometryChange = () => {
    if (!stabilizing) return;
    if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
    restoreFrame = undefined;
    // ResizeObserver, VisualViewport und ScrollTrigger melden nach der neuen
    // Layoutberechnung, aber noch vor dem Paint. Direktes Wiederherstellen in
    // diesem Callback verhindert den einzelnen Zwischenframe, der bei einer
    // zusaetzlichen rAF-Verzoegerung noch sichtbar werden konnte.
    restorePending();
    scheduleFinish();
  };

  const handleScroll = () => {
    if (stabilizing) {
      // GSAPs responsiver Neuaufbau kann die Window-Position verschieben,
      // ohne dabei eine weitere messbare Groessenaenderung auszuloesen. Das
      // Scroll-Event kommt noch vor dem Paint und stellt den gespeicherten
      // Inhaltsbezug sofort wieder her. Echte Nutzereingaben beenden die
      // Stabilisierung bereits ueber touchstart/pointerdown/wheel.
      handleGeometryChange();
      return;
    }
    queueCapture();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Reale Layoutstufen korrigieren, nicht pauschal jeden Frame. Resize- und
  // VisualViewport-Events laufen vor dem Paint; die direkte Korrektur bleibt
  // damit im selben Rendering-Zyklus und erzeugt keine sichtbare Dauerfahrt.
  window.addEventListener('resize', handleGeometryChange, { passive: true });
  window.visualViewport?.addEventListener('resize', handleGeometryChange, { passive: true });
  ScrollTrigger.addEventListener('matchMedia', handleGeometryChange);
  ScrollTrigger.addEventListener('refresh', () => {
    handleGeometryChange();
  });
  window.addEventListener('lp:orientation-settled', () => {
    if (!stabilizing) return;
    layoutSettled = true;
    queueRestore();
    scheduleFinish();
  });

  portrait.addEventListener('change', () => {
    const isPortrait = portrait.matches;
    if (isPortrait === wasPortrait) return;
    wasPortrait = isPortrait;

    pendingAnchor = anchor;
    if (!pendingAnchor?.element.isConnected) return;
    if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
    if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    if (hardStopTimer !== undefined) window.clearTimeout(hardStopTimer);
    geometryObserver?.disconnect();
    geometryObserver = undefined;
    if (!stabilizing) {
      previousScrollBehavior = root.style.scrollBehavior;
      previousOverflowAnchor = root.style.overflowAnchor;
    }
    stabilizing = true;
    layoutSettled = false;
    root.style.scrollBehavior = 'auto';
    root.style.overflowAnchor = 'none';

    // Responsive Textumbrueche und neu aufgebaute ScrollTrigger-Strecken
    // veraendern teils erst nach dem eigentlichen window.resize die Hoehe des
    // Dokuments. Ein ResizeObserver erfasst genau diese Layoutstufe, ohne den
    // Scroller wie der alte rAF-Loop permanent anzufassen.
    if (typeof ResizeObserver === 'function') {
      geometryObserver = new ResizeObserver(handleGeometryChange);
      geometryObserver.observe(document.body);
      geometryObserver.observe(pendingAnchor.element);
      const anchorSection = pendingAnchor.element.closest<HTMLElement>('section');
      if (anchorSection && anchorSection !== pendingAnchor.element) {
        geometryObserver.observe(anchorSection);
      }
    }

    // Das MediaQueryList-Event läuft bereits nach dem CSS-Umschalten. Die
    // synchrone erste Korrektur verhindert deshalb schon den ersten sichtbaren
    // Zwischenzustand; die Event-Korrekturen fangen die spaeteren
    // iOS-/GSAP-Stufen ab.
    restore(pendingAnchor);
    queueRestore();
    // Sicherheitsnetz, falls ein Browser kein finales Viewport-/Refresh-Event
    // meldet. Der normale Abschluss kommt frueher ueber orientation-settled.
    hardStopTimer = window.setTimeout(() => {
      restorePending();
      finishStabilizing();
    }, 1600);
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
      window.dispatchEvent(new Event('lp:orientation-settled'));
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
