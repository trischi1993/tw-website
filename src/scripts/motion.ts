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

type PageViewportScrollAnchor =
  | {
      kind: 'element';
      element: HTMLElement;
      ratio: number;
      viewportRatio: number;
    }
  | {
      kind: 'text';
      node: Text;
      start: number;
      end: number;
      viewportRatio: number;
      fallback: {
        element: HTMLElement;
        ratio: number;
        viewportRatio: number;
      };
    };

/** Hält beim Wechsel zwischen Hoch- und Querformat den gerade betrachteten
 * Inhalt im Viewport. Ein einmaliges Wiederherstellen reicht nicht: iOS und
 * GSAP vermessen den neuen Viewport in mehreren Phasen. Würden wir erst nach
 * der letzten Phase korrigieren, wäre genau das als verspätetes „Einrasten“
 * sichtbar. Deshalb wird derselbe Inhaltsanker bis zur nachweislich ruhigen
 * Visual-Viewport- und GSAP-Geometrie kontinuierlich wiederhergestellt. */
function preservePageContentOnOrientation(portrait: MediaQueryList): void {
  const root = document.documentElement;
  const MIN_STABILIZE_MS = 1050;
  const VIEWPORT_QUIET_MS = 220;
  const HARD_STOP_MS = 1900;

  /* `clientHeight` beschreibt auf iOS nur den Layout-Viewport. Sichtbar ist
   * jedoch der Visual Viewport, den Safari beim Drehen samt Browserleisten in
   * mehreren, teils verspäteten Stufen verschiebt und skaliert. Sämtliche
   * Ankerkoordinaten müssen deshalb aus derselben sichtbaren Geometrie stammen.
   * WebKit liefert Client-Rects relativ zum Layout-Viewport; offsetTop/-Left
   * übersetzen den sichtbaren Mittelpunkt in genau dieses Koordinatensystem. */
  const getVisibleViewport = () => {
    const visual = window.visualViewport;
    const width = visual?.width || root.clientWidth;
    const height = visual?.height || root.clientHeight;
    const left = visual?.offsetLeft || 0;
    const top = visual?.offsetTop || 0;
    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  };
  /* Stabile Layoutblöcke bewusst vor generischen Elementen prüfen. `closest()`
   * beachtet die Reihenfolge einer kombinierten Selektorliste nicht: Der alte
   * Code fing dadurch in Carousels oft ein bewegtes <figure> und in USP-Listen
   * einen einzelnen Absatz/Listeneintrag statt der zugehörigen Karte ab. Beim
   * responsiven Umbau wechselte der sichtbare Bezug anschließend und die Seite
   * rastete in zwei Stufen ein. */
  const anchorSelectors = [
    '[data-results]',
    '.services__card',
    '.reviews__card',
    '.faq__item',
    '.home-proof-card',
    '.home-proof__head',
    '.split-cta__grid',
    '.bonus__card',
    '.bonus__head',
    '.interests__item',
    '.interests__grid',
    '.marquee',
    '.final-cta__content',
    '.tl__item',
    '.tl__card',
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
  let anchor: PageViewportScrollAnchor | undefined;
  let pendingAnchor: PageViewportScrollAnchor | undefined;
  let captureFrame: number | undefined;
  let restoreFrame: number | undefined;
  let finishTimer: number | undefined;
  let hardStopTimer: number | undefined;
  let geometryObserver: ResizeObserver | undefined;
  let preciseCaptureTimer: number | undefined;
  let suppressCaptureUntil = 0;
  let timelinePortraitAnchor:
    | Extract<PageViewportScrollAnchor, { kind: 'element' }>
    | undefined;
  let timelineLandscapeUserMoved = false;
  let stabilizing = false;
  let layoutSettled = false;
  let stabilizingStartedAt = 0;
  let lastGeometryChangeAt = 0;
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
    const viewport = getVisibleViewport();
    for (const selector of anchorSelectors) {
      const candidates = Array.from(scope.querySelectorAll<HTMLElement>(selector))
        .filter((candidate) => {
          const bounds = candidate.getBoundingClientRect();
          return bounds.width > 0
            && bounds.height > 0
            && bounds.right >= viewport.left
            && bounds.left <= viewport.right
            && bounds.bottom >= viewport.top
            && bounds.top <= viewport.bottom;
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

  /** Ermittelt das konkrete Wort am Viewport-Bezugspunkt. Ein Prozentwert
   * innerhalb einer ganzen Section ist nach responsivem Textumbruch nicht mehr
   * derselbe Inhalt. Der Textknoten und Wortbereich bleiben dagegen identisch
   * und koennen nach dem Reflow pixelgenau an derselben relativen
   * Viewportposition gehalten werden. */
  const findTextAnchor = (
    hit: HTMLElement | null,
    centerX: number,
    centerY: number,
    fallback: Extract<PageViewportScrollAnchor, { kind: 'element' }>,
  ): PageViewportScrollAnchor | undefined => {
    const viewport = getVisibleViewport();
    const textSelector = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'li',
      'summary',
      'blockquote',
      'figcaption',
      'dt',
      'dd',
    ].join(',');
    const directTextContainer = hit?.closest<HTMLElement>(textSelector) ?? null;
    const localContentContainer = hit?.closest<HTMLElement>([
      'article',
      'figure',
      'details',
      '[class*="__card"]',
      '[class*="__item"]',
      '[class*="__base"]',
      '[class*="__content"]',
    ].join(',')) ?? null;

    /* Die Viewportmitte liegt auf Mobilgeräten häufig auf einem Bild, einer
     * Kartenfläche oder genau in einer Grid-Lücke. Dann war der alte
     * Wortanker leer und die Rotation hielt nur einen Prozentwert innerhalb
     * der gesamten Section fest. Nach dem responsiven Textumbruch bezeichnet
     * dieser Prozentwert einen anderen Inhalt; die spätere GSAP-Vermessung
     * wurde als sichtbares Einrasten wahrgenommen. Wir suchen deshalb zuerst
     * im unmittelbar getroffenen Text, dann im lokalen Inhaltsblock und erst
     * zuletzt im bereits als stabil erkannten Fallback-Block nach dem
     * nächstgelegenen sichtbaren Wort. */
    const containers = [
      directTextContainer,
      localContentContainer && fallback.element.contains(localContentContainer)
        ? localContentContainer
        : null,
      fallback.element.matches('main,footer') ? null : fallback.element,
    ].filter((container, index, all): container is HTMLElement =>
      Boolean(container)
      && container!.closest('main,footer') !== null
      && all.indexOf(container) === index);

    // SHOW_TEXT = 4; die Zahl vermeidet Abhaengigkeit vom globalen
    // `NodeFilter`-Konstruktor in eingeschraenkten WebViews.
    const range = document.createRange();
    type TextCandidate =
      | {
          node: Text;
          start: number;
          end: number;
          viewportRatio: number;
          distance: number;
          verticalDistance: number;
        }
      | undefined;

    const nearestWordIn = (container: HTMLElement): TextCandidate => {
      const walker = document.createTreeWalker(container, 4);
      let best: TextCandidate;
      let current = walker.nextNode();
      while (current) {
        const node = current as Text;
        const value = node.data;
        const words = value.matchAll(/\S+/g);
        for (const word of words) {
          const start = word.index ?? 0;
          const end = start + word[0].length;
          range.setStart(node, start);
          range.setEnd(node, end);
          for (const bounds of Array.from(range.getClientRects())) {
            if (bounds.width <= 0 || bounds.height <= 0) continue;
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
            const distance = Math.hypot(dx, dy * 2);
            if (!best || distance < best.distance) {
              best = {
                node,
                start,
                end,
                viewportRatio: Math.min(1, Math.max(0, (
                  bounds.top + bounds.height / 2 - viewport.top
                ) / viewport.height)),
                distance,
                verticalDistance: dy,
              };
            }
          }
        }
        current = walker.nextNode();
      }
      return best;
    };

    let best: TextCandidate;
    for (const container of containers) {
      const candidate = nearestWordIn(container);
      if (!candidate) continue;
      best = candidate;
      // Ein lokaler Treffer ist semantisch präziser als ein zufällig gleich
      // nahes Wort aus dem gesamten Abschnitt. Nur wenn im lokalen Block kein
      // Wort nahe genug liegt, wird der breitere Fallback durchsucht.
      if (candidate.verticalDistance <= Math.max(64, viewport.height * 0.12)) break;
    }

    // Nur einen tatsaechlich nahe am Messpunkt liegenden Text verwenden. In
    // grossen Leerflaechen bleibt der konkrete Karten-/Section-Anker korrekt.
    // Eine kurze, linksbuendige Ueberschrift kann die gesamte Zeilenbox
    // bedecken, obwohl ihr Wort weit links von der horizontalen Viewportmitte
    // steht. Entscheidend ist deshalb die passende Textzeile (Y), nicht der
    // horizontale Abstand innerhalb desselben getroffenen Textelements.
    if (!best || best.verticalDistance > Math.max(64, viewport.height * 0.12)) return undefined;
    return {
      kind: 'text',
      node: best.node,
      start: best.start,
      end: best.end,
      viewportRatio: best.viewportRatio,
      fallback: {
        element: fallback.element,
        ratio: fallback.ratio,
        viewportRatio: fallback.viewportRatio,
      },
    };
  };

  const anchorElement = (saved: PageViewportScrollAnchor): HTMLElement | null => {
    if (saved.kind === 'element') return saved.element;
    const textParent = saved.node.parentElement;
    return textParent?.isConnected ? textParent : saved.fallback.element;
  };

  const anchorIsConnected = (saved: PageViewportScrollAnchor | undefined): saved is PageViewportScrollAnchor =>
    Boolean(saved && (saved.kind === 'element'
      ? saved.element.isConnected
      : saved.node.isConnected || saved.fallback.element.isConnected));

  const capture = (preciseImmediately = false) => {
    captureFrame = undefined;
    if (stabilizing) return;

    const viewport = getVisibleViewport();
    const centerX = viewport.centerX;
    const centerY = viewport.centerY;
    const hit = document.elementFromPoint(centerX, centerY) as HTMLElement | null;
    const element = findAnchor(hit, centerX, centerY);
    if (!element || element === document.body || element === root) return;

    const bounds = element.getBoundingClientRect();
    if (bounds.height <= 0) return;

    const elementAnchor: Extract<PageViewportScrollAnchor, { kind: 'element' }> = {
      kind: 'element',
      element,
      ratio: Math.min(1, Math.max(0, (centerY - bounds.top) / bounds.height)),
      viewportRatio: Math.min(1, Math.max(0, (
        centerY - viewport.top
      ) / viewport.height)),
    };
    anchor = elementAnchor;

    // Die Wortmessung ist absichtlich leicht entprellt: waehrend eines
    // aktiven Touch-Scrolls bleibt capture() damit billig; sobald der Inhalt
    // kurz ruht, wird der praezise semantische Bezug aktualisiert.
    const capturePreciseText = () => {
      preciseCaptureTimer = undefined;
      if (stabilizing) return;
      const currentViewport = getVisibleViewport();
      const currentX = currentViewport.centerX;
      const currentY = currentViewport.centerY;
      const currentHit = document.elementFromPoint(currentX, currentY) as HTMLElement | null;
      const currentElement = findAnchor(currentHit, currentX, currentY);
      if (!currentElement || currentElement !== element || !element.isConnected) return;
      const precise = findTextAnchor(currentHit, currentX, currentY, elementAnchor);
      if (precise) anchor = precise;
    };
    if (preciseCaptureTimer !== undefined) window.clearTimeout(preciseCaptureTimer);
    if (preciseImmediately) capturePreciseText();
    else preciseCaptureTimer = window.setTimeout(capturePreciseText, 90);
  };

  const queueCapture = () => {
    if (captureFrame !== undefined || stabilizing || performance.now() < suppressCaptureUntil) return;
    captureFrame = requestAnimationFrame(() => capture());
  };

  const restore = (saved: PageViewportScrollAnchor): boolean => {
    let currentFocusY: number;
    let targetFocusY: number;
    const viewport = getVisibleViewport();

    if (saved.kind === 'text' && saved.node.isConnected) {
      const length = saved.node.length;
      const start = Math.min(saved.start, length);
      const end = Math.min(Math.max(start, saved.end), length);
      if (end <= start) return restore({ kind: 'element', ...saved.fallback });
      const range = document.createRange();
      range.setStart(saved.node, start);
      range.setEnd(saved.node, end);
      const bounds = range.getBoundingClientRect();
      if (bounds.height <= 0) return restore({ kind: 'element', ...saved.fallback });
      currentFocusY = bounds.top + bounds.height / 2;
      targetFocusY = viewport.top + viewport.height * saved.viewportRatio;
    } else {
      const elementAnchor = saved.kind === 'element' ? saved : saved.fallback;
      if (!elementAnchor.element.isConnected) return false;
      const bounds = elementAnchor.element.getBoundingClientRect();
      if (bounds.height <= 0) return false;
      currentFocusY = bounds.top + bounds.height * elementAnchor.ratio;
      targetFocusY = viewport.top + viewport.height * elementAnchor.viewportRatio;
    }

    const correction = currentFocusY - targetFocusY;
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
    const settledAnchor = pendingAnchor;
    if (captureFrame !== undefined) cancelAnimationFrame(captureFrame);
    if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
    if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    if (hardStopTimer !== undefined) window.clearTimeout(hardStopTimer);
    captureFrame = undefined;
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
    // Erst jetzt ist die responsive Safari-Geometrie wirklich stabil. Bis zu
    // diesem Punkt bleiben bereits sichtbare Reveal-Texte explizit filterfrei,
    // damit beim Neuumbrechen keine einzelne Zeile aus einem alten Blur-Layer
    // aufblinkt.
    reveals.releaseOrientationHold();
    // Solange der Nutzer nicht scrollt, bleibt exakt derselbe semantische
    // Bezug auch fuer ein direktes Zurueckdrehen aktiv. Eine Neumessung an der
    // geometrischen Viewportmitte koennte im anders umbrochenen Querformat ein
    // benachbartes Wort waehlen und beim Rueckweg einen kleinen Versatz
    // erzeugen. Echte Scrollbewegungen aktualisieren `anchor` ohnehin sofort.
    if (anchorIsConnected(settledAnchor)) {
      anchor = settledAnchor;
      // Das scrollTo() der letzten Korrektur kann sein Scroll-Event erst nach
      // diesem Callback zustellen. Dieses programmatische Event darf den eben
      // erhaltenen Wortanker nicht sofort wieder durch den Viewportmittelpunkt
      // ersetzen. Eine echte Eingabe hebt die kurze Sperre direkt auf.
      suppressCaptureUntil = performance.now() + 120;
    }
    else requestAnimationFrame(() => capture(true));
  };

  const restorePending = (): boolean => {
    const saved = pendingAnchor;
    if (!saved || !restore(saved)) {
      finishStabilizing();
      return false;
    }
    return true;
  };

  /* WebKit kann Visual-Viewport-Werte im resize-Callback noch aus der
   * vorherigen Rotationsstufe liefern. Eine fortlaufende rAF-Kontrolle hält
   * denselben sichtbaren Inhalt auch über diese verspäteten Werte hinweg,
   * ohne auf ein bestimmtes Safari-Event angewiesen zu sein. */
  const stabilizeFrame = () => {
    restoreFrame = undefined;
    if (!stabilizing || !restorePending()) return;
    restoreFrame = requestAnimationFrame(stabilizeFrame);
  };

  const ensureStabilizationFrame = () => {
    if (!stabilizing || restoreFrame !== undefined) return;
    restoreFrame = requestAnimationFrame(stabilizeFrame);
  };

  const scheduleFinish = () => {
    if (!stabilizing || !layoutSettled) return;
    if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    const now = performance.now();
    const earliestFinish = Math.max(
      stabilizingStartedAt + MIN_STABILIZE_MS,
      lastGeometryChangeAt + VIEWPORT_QUIET_MS,
    );
    // Erst beenden, wenn sowohl der finale GSAP-Refresh erfolgt ist als auch
    // der echte Safari-Viewport lange genug unverändert blieb. Die feste
    // 180-ms-Frist war auf realen iPhones zu kurz und ließ eine spätere
    // Browserleisten-/Visual-Viewport-Stufe sichtbar durchrutschen.
    finishTimer = window.setTimeout(() => {
      if (!stabilizing || !layoutSettled) return;
      if (performance.now() + 1 < earliestFinish) {
        scheduleFinish();
        return;
      }
      if (!restorePending()) return;
      finishStabilizing();
    }, Math.max(0, earliestFinish - now));
  };

  const handleGeometryChange = () => {
    if (!stabilizing) return;
    lastGeometryChangeAt = performance.now();
    // ResizeObserver, VisualViewport und ScrollTrigger melden nach der neuen
    // Layoutberechnung, aber noch vor dem Paint. Direktes Wiederherstellen in
    // diesem Callback verhindert den ersten Zwischenframe; die laufende
    // rAF-Kontrolle fängt zusätzlich WebKits verspätete Messwerte ab.
    if (!restorePending()) return;
    ensureStabilizationFrame();
    scheduleFinish();
  };

  const handleScroll = () => {
    if (stabilizing) {
      // GSAPs responsiver Neuaufbau kann die Window-Position verschieben,
      // ohne dabei eine weitere messbare Groessenaenderung auszuloesen. Das
      // Scroll-Event kommt noch vor dem Paint und stellt den gespeicherten
      // Inhaltsbezug sofort wieder her. Echte Nutzereingaben beenden die
      // Stabilisierung bereits ueber touchstart/pointerdown/wheel.
      if (restorePending()) ensureStabilizationFrame();
      return;
    }
    queueCapture();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('load', queueCapture, { once: true });
  window.addEventListener('lp:layout-changed', queueCapture);
  window.addEventListener('touchstart', () => {
    if (timelinePortraitAnchor && !portrait.matches) timelineLandscapeUserMoved = true;
    if (stabilizing) finishStabilizing();
    suppressCaptureUntil = 0;
  }, { passive: true });
  window.addEventListener('pointerdown', () => {
    if (timelinePortraitAnchor && !portrait.matches) timelineLandscapeUserMoved = true;
    if (stabilizing) finishStabilizing();
    suppressCaptureUntil = 0;
  }, { passive: true });
  window.addEventListener('wheel', () => {
    if (timelinePortraitAnchor && !portrait.matches) timelineLandscapeUserMoved = true;
    if (stabilizing) finishStabilizing();
    suppressCaptureUntil = 0;
  }, { passive: true });
  capture(true);

  // Window- und Visual-Viewport-Aenderungen gemeinsam beobachten. Auf iOS kann
  // sich offsetTop beim Ein-/Ausblenden der Browserleisten ändern, ohne dass
  // ein weiteres window.resize folgt.
  window.addEventListener('resize', handleGeometryChange, { passive: true });
  window.visualViewport?.addEventListener('resize', handleGeometryChange, { passive: true });
  window.visualViewport?.addEventListener('scroll', handleGeometryChange, { passive: true });
  ScrollTrigger.addEventListener('matchMedia', handleGeometryChange);
  ScrollTrigger.addEventListener('refresh', () => {
    handleGeometryChange();
  });
  window.addEventListener('lp:orientation-settled', () => {
    if (!stabilizing) {
      capture(true);
      return;
    }
    layoutSettled = true;
    if (!restorePending()) return;
    ensureStabilizationFrame();
    scheduleFinish();
  });

  portrait.addEventListener('change', () => {
    const isPortrait = portrait.matches;
    if (isPortrait === wasPortrait) return;
    wasPortrait = isPortrait;

    pendingAnchor = anchor;
    if (!anchorIsConnected(pendingAnchor)) return;
    if (preciseCaptureTimer !== undefined) {
      window.clearTimeout(preciseCaptureTimer);
      preciseCaptureTimer = undefined;
    }
    const timelineItem = anchorElement(pendingAnchor)?.closest<HTMLElement>('.tl__item');
    if (timelineItem && !isPortrait) {
      // Tiny-Portrait und die gepinnte Querformat-Timeline bilden denselben
      // Werdegang vollkommen verschieden ab. Beim Hinweg hält GSAP selbst die
      // sichtbare Station korrekt; eine vertikale Restore-Korrektur würde nach
      // SplitText genau hier erst den Stationswechsel verursachen. Nach dem
      // finalen Refresh erfasst `orientation-settled` die echte Landscape-
      // Station als Bezug für den Rückweg.
      const fallback = pendingAnchor.kind === 'element'
        ? pendingAnchor
        : { kind: 'element' as const, ...pendingAnchor.fallback };
      timelinePortraitAnchor = fallback.element.closest('.tl__item') === timelineItem
        ? fallback
        : {
            kind: 'element',
            element: timelineItem,
            ratio: 0.5,
            viewportRatio: 0.5,
          };
      timelineLandscapeUserMoved = false;
      pendingAnchor = undefined;
      anchor = undefined;
      return;
    }
    if (timelineItem && isPortrait) {
      // Beim Abbau des gepinnten Landscape-Triggers setzt GSAP den Window-
      // Scroller kurz auf 0. Die konkrete Station bleibt jedoch im DOM. Ihre
      // Mitte ist der stabile semantische Bezug für die vertikale Mobile-Liste.
      pendingAnchor = timelinePortraitAnchor
        && !timelineLandscapeUserMoved
        && timelinePortraitAnchor.element === timelineItem
        ? timelinePortraitAnchor
        : {
            kind: 'element',
            element: timelineItem,
            ratio: 0.5,
            viewportRatio: 0.5,
          };
      timelinePortraitAnchor = undefined;
      timelineLandscapeUserMoved = false;
    } else if (isPortrait) {
      timelinePortraitAnchor = undefined;
      timelineLandscapeUserMoved = false;
    }
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
    stabilizingStartedAt = performance.now();
    lastGeometryChangeAt = stabilizingStartedAt;
    root.style.scrollBehavior = 'auto';
    root.style.overflowAnchor = 'none';

    // Responsive Textumbrueche und neu aufgebaute ScrollTrigger-Strecken
    // veraendern teils erst nach dem eigentlichen window.resize die Hoehe des
    // Dokuments. Ein ResizeObserver erfasst genau diese Layoutstufe, ohne den
    // Scroller wie der alte rAF-Loop permanent anzufassen.
    if (typeof ResizeObserver === 'function') {
      geometryObserver = new ResizeObserver(handleGeometryChange);
      geometryObserver.observe(document.body);
      const observedAnchor = anchorElement(pendingAnchor);
      if (observedAnchor) geometryObserver.observe(observedAnchor);
      const anchorSection = observedAnchor?.closest<HTMLElement>('section');
      if (anchorSection && anchorSection !== observedAnchor) {
        geometryObserver.observe(anchorSection);
      }
    }

    // Das MediaQueryList-Event läuft bereits nach dem CSS-Umschalten. Die
    // synchrone erste Korrektur verhindert deshalb schon den ersten sichtbaren
    // Zwischenzustand; die Event-Korrekturen fangen die spaeteren
    // iOS-/GSAP-Stufen ab.
    restore(pendingAnchor);
    ensureStabilizationFrame();
    // Sicherheitsnetz, falls ein Browser kein finales Viewport-/Refresh-Event
    // meldet. Der normale Abschluss kommt frueher ueber orientation-settled.
    hardStopTimer = window.setTimeout(() => {
      restorePending();
      finishStabilizing();
    }, HARD_STOP_MS);
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

export function init(): void {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.hasAttribute('data-aio-restore-aborted')
  ) return;

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
  reveals.init();
  homeLoad.init(mm);
  homeHero.init(mm);
  results.init(mm);
  banner.init(mm);
  gallery.init(mm);
  faqHover.init(mm);
  aioLoad.init(mm);
  ebookLoad.init(mm);
  moduleScrub.init(mm);
  bonuses.init();
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
  preservePageContentOnOrientation(portrait);
  let orientationSettleTimer: number | undefined;
  portrait.addEventListener('change', () => {
    // Native Filteranimationen koennen in Mobile Safari beim Wechsel der
    // Viewport-Geometrie fragmentweise abgebrochen werden. Vor dem ersten
    // Paint des neuen Formats alle gerade laufenden Reveals gemeinsam in den
    // sichtbaren Endzustand ueberfuehren; fertige Reveals bleiben unveraendert.
    reveals.settleForOrientationChange();
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

  // Ein eventuell bereits aktiver mobiler AIO-Reveal-Entry kann seine
  // provisorische Rotationssicherung jetzt an die zentrale Motion-Steuerung
  // uebergeben. Die Reveal-Module selbst sind idempotent und starten nicht neu.
  window.dispatchEvent(new Event('lp:full-motion-ready'));
}

/* Auf kleinen AIO-Viewports trennt der Deferred-Controller bewusst Download
   und Auswertung von der DOM-/ScrollTrigger-Initialisierung. Beginnt waehrend
   des Imports eine neue Touch-Bewegung, ruft er init() erst nach echter
   Scrollruhe auf. Alle anderen Seiten behalten den bisherigen Side-Effect. */
if (!document.documentElement.classList.contains('aio-mobile-motion')) init();
