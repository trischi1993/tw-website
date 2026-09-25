import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger } from './util';

gsap.registerPlugin(SplitText);

/* ---------------------------------------------------------------------------
   Zeilen-Textanimation - 1:1-Port des Webflow-Custom-Scripts (Home, Page
   Settings, "[js-line-animation]"): SplitText in Zeilen, jede Zeile fährt aus
   einer Maske von yPercent 100 → 0. Im Original nur an ZWEI Elementen:
   Hero-H1 (data-delay="1") und Value-Statement-Text (data-stagger="0.5").
   Timing wie im Original: ease power2.out, stagger linear, speed 0.7,
   ScrollTrigger start "top bottom" / end "bottom bottom", play-once,
   data-replay !== "false" → Restart bei erneutem Eintritt.

   WICHTIG (Resize): Wie das Original wird NUR bei geänderter Fenster-BREITE
   neu gesplittet (Höhenänderungen - z. B. die Mobile-URL-Leiste - ignoriert).
   Kein GSAP-`autoSplit`: dessen laufende Re-Splits ließen die Masken-Zeilen
   nach dem Ziehen überlappen (verformter Hero, blieb bis zum Reload). Beim
   Re-Split killen wir Timeline + ScrollTrigger und `revert()` das SplitText
   vollständig auf das Original-Markup, bevor neu gesplittet wird → saubere
   Zeilen bei jeder Breite. Ein kurzer Debounce bündelt das Ziehen.
   --------------------------------------------------------------------------- */

// Kurzer Layout-Puffer nach DOMContentLoaded. Im Original 700 ms (Font-Puffer);
// da wir zusätzlich auf fonts.ready warten (finale Umbrüche stehen dann fest),
// reicht ein kleiner Rest - die Zeilen-Reveals starten dadurch sichtbar früher.
const DELAY_AFTER_DOM_MS = 150;
// Nach dem letzten Resize-Event warten, bevor neu gesplittet wird (bündelt das
// Ziehen; verhindert Flackern/Re-Reveal auf jedem Zwischenschritt).
const RESIZE_DEBOUNCE_MS = 200;
// Der lange Statement-Absatz erzeugt auf kleinen Displays deutlich mehr
// SplitText-Zeilen als der Hero. iOS Safari muss beim Scrollen sonst alle
// Transform-Tweens auf dem Haupt-Thread nachfuehren. Die Web Animations API
// kann die reine Transform-Animation direkt auf dem Compositor abspielen.
const MOBILE_STATEMENT = '(max-width: 767px)';
const POWER2_OUT_CSS = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

interface NativeLineAnim {
  line: HTMLElement;
  animation: Animation;
}

interface LineAnim {
  el: HTMLElement;
  split?: SplitText;
  tl?: gsap.core.Timeline;
  trigger?: ReturnType<typeof ScrollTrigger.create>;
  nativeLines?: NativeLineAnim[];
}

function buildNativeMobile(
  entry: LineAnim,
  lines: HTMLElement[],
  speed: number,
  delay: number,
  amount: number,
  replay: boolean,
): void {
  const lastIndex = Math.max(1, lines.length - 1);
  const startTransform = 'translate3d(0, 100%, 0)';
  const endTransform = 'translate3d(0, 0, 0)';
  let hasPlayed = false;

  // Bis zum Trigger in der Zeilenmaske verstecken, aber noch keine Layer fuer
  // den weit unterhalb des Hero liegenden Absatz reservieren.
  lines.forEach((line) => {
    line.style.transform = startTransform;
  });

  const play = () => {
    entry.nativeLines?.forEach(({ animation }) => animation.cancel());
    entry.nativeLines = lines.map((line, index) => {
      line.style.willChange = 'transform';
      line.style.backfaceVisibility = 'hidden';
      const animation = line.animate(
        [{ transform: startTransform }, { transform: endTransform }],
        {
          duration: speed * 1000,
          // Der bestehende 0,2-s-Delay gibt Safari Zeit, die Layer vor dem
          // ersten bewegten Frame vorzubereiten.
          delay: (delay + (amount * index) / lastIndex) * 1000,
          easing: POWER2_OUT_CSS,
          fill: 'both',
        },
      );
      animation.onfinish = () => {
        // Den Endzustand ohne dauerhaft aktive Animation/Compositor-Layer halten.
        line.style.transform = endTransform;
        line.style.removeProperty('will-change');
        line.style.removeProperty('backface-visibility');
        animation.cancel();
      };

      return { line, animation };
    });
  };

  entry.trigger = ScrollTrigger.create({
    trigger: entry.el,
    start: 'top bottom',
    end: 'bottom bottom',
    onEnter: () => {
      if (replay || !hasPlayed) {
        hasPlayed = true;
        play();
      }
    },
  });
}

function build(entry: LineAnim): void {
  const el = entry.el;
  const speed = parseFloat(el.dataset.speed ?? '') || 0.7;
  const delay = parseFloat(el.dataset.delay ?? '') || 0;
  const amount = parseFloat(el.dataset.stagger ?? '') || 0.2;
  const replay = el.dataset.replay !== 'false';

  entry.split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    // SplitText setzt sonst per aria="auto" ein aria-label auf das Element -
    // auf einem <p> ist das laut ARIA verboten (Lighthouse aria-prohibited-attr).
    // aria:"none" laesst die (zeilenweise) Original-Reihenfolge fuer SR bestehen.
    aria: 'none',
  });

  const lines = entry.split.lines as HTMLElement[];

  // Nur der lange mobile Statement-Absatz braucht den nativen Compositor-Pfad.
  // Der kurze Hero und groessere Breakpoints behalten das GSAP-Original.
  if (
    el.classList.contains('value-stmt__text') &&
    window.matchMedia(MOBILE_STATEMENT).matches &&
    typeof lines[0]?.animate === 'function'
  ) {
    buildNativeMobile(entry, lines, speed, delay, amount, replay);
    // Erst sichtbar schalten, nachdem jede neue Zeile ihren verdeckten
    // Ausgangszustand besitzt. Beim responsiven Re-Split kann Chrome sonst
    // den von SplitText kurz wiederhergestellten Rohtext zeichnen.
    gsap.set(el, { autoAlpha: 1 });
    return;
  }

  // Den Startzustand synchron VOR dem Sichtbarschalten setzen. `fromTo()`
  // kann seinen From-State bis zum ersten Render aufschieben; genau dieser
  // Zwischenraum wurde bei Chromes mehrstufigem Orientation-Reflow sichtbar.
  gsap.set(lines, { yPercent: 100 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top bottom',
      end: 'bottom bottom',
      toggleActions: 'play none none none',
      onEnter: () => {
        if (replay) tl.restart();
      },
    },
  });
  // WICHTIG: KEIN `ease` im stagger-Objekt. GSAP erzwingt sonst die
  // Verteil-Ease auch als Per-Zeilen-Ease → jede Zeile fährt LINEAR mit
  // konstantem Tempo hoch und stoppt abrupt (fühlt sich wie „Reinschlagen"
  // an). Ohne stagger.ease greift die Tween-`ease` (power2.out) pro Zeile →
  // jede Zeile läuft sanft aus. Die Verteilung der Startzeiten bleibt gleich
  // (Default = gleichmäßig über `amount`). Das ist auch die vom Webflow-Autor
  // ursprünglich gemeinte Wirkung (Kommentar „Power2.easeOut" im Original,
  // der dort wegen dieses GSAP-Verhaltens nie ankam).
  tl.to(lines, {
    yPercent: 0,
    duration: speed,
    delay,
    ease: 'power2.out',
    stagger: { amount },
  });
  entry.tl = tl;
  gsap.set(el, { autoAlpha: 1 });
}

function rebuild(entry: LineAnim): void {
  // SplitText.revert() stellt fuer einen Moment den ungeteilten Originaltext
  // her. Den Parent vorher ausblenden und erst wieder freigeben, nachdem die
  // neuen Masken samt y=100-Startzustand synchron aufgebaut sind.
  gsap.set(entry.el, { autoAlpha: 0 });
  entry.trigger?.kill();
  entry.nativeLines?.forEach(({ animation }) => animation.cancel());
  entry.tl?.scrollTrigger?.kill();
  entry.tl?.kill();
  entry.split?.revert();
  entry.trigger = undefined;
  entry.nativeLines = undefined;
  entry.tl = undefined;
  build(entry);
}

export function init(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-anim="lines"]'));
  if (!els.length) return;
  // Bis zum Split unsichtbar (nur per JS - ohne JS bleibt der Text stehen).
  gsap.set(els, { autoAlpha: 0 });
  // Ab hier hält das Inline-autoAlpha den Zustand; die CSS-Pre-Paint-Regel
  // (global.css, html.has-motion [data-anim="lines"]) per [data-revealed]
  // deaktivieren, damit sie nach dem Reveal nicht erneut greift.
  els.forEach((el) => el.setAttribute('data-revealed', ''));

  const entries: LineAnim[] = els.map((el) => ({ el }));

  const domReady = new Promise<void>((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  }).then(() => new Promise<void>((resolve) => setTimeout(resolve, DELAY_AFTER_DOM_MS)));

  const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

  Promise.all([domReady, fontsReady]).then(() => {
    entries.forEach(build);

    // Nur auf Breitenänderungen neu splitten (wie das Original).
    let lastWidth = window.innerWidth;
    let debounce: number | undefined;
    const portrait = window.matchMedia('(orientation: portrait)');
    const rebuildAll = () => entries.forEach(rebuild);
    const homeHeroEntry = entries.find((entry) => entry.el.classList.contains('hhero__h1'));
    const needsChromeHomeTransaction = Boolean(
      homeHeroEntry
      && /\b(?:HeadlessChrome|Chrome|Chromium|CriOS)\//.test(window.navigator.userAgent),
    );

    /* Der bisherige Pfad bleibt auf Safari und allen anderen Seiten bewusst
     * unveraendert. Nur Chrome/Chromium (inklusive CriOS auf dem iPhone) kann
     * die drei Rotationssignale in jener Reihenfolge liefern, die beim
     * Startseiten-H1 den doppelten beziehungsweise verdeckten Lauf erzeugt. */
    if (!needsChromeHomeTransaction) {
      let orientationHoldActive = false;
      let orientationHoldTimer: number | undefined;

      window.addEventListener('orientationchange', () => {
        orientationHoldActive = true;
        if (orientationHoldTimer !== undefined) window.clearTimeout(orientationHoldTimer);
        gsap.set(els, { autoAlpha: 0 });

        orientationHoldTimer = window.setTimeout(() => {
          if (!orientationHoldActive) return;
          orientationHoldActive = false;
          orientationHoldTimer = undefined;
          gsap.set(els, { autoAlpha: 1 });
        }, 1200);
      }, { passive: true });

      portrait.addEventListener('change', () => {
        window.clearTimeout(debounce);
        debounce = undefined;
        lastWidth = window.innerWidth;
        rebuildAll();
        orientationHoldActive = false;
        if (orientationHoldTimer !== undefined) window.clearTimeout(orientationHoldTimer);
        orientationHoldTimer = undefined;
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        window.clearTimeout(debounce);
        debounce = window.setTimeout(rebuildAll, RESIZE_DEBOUNCE_MS);
      });
      return;
    }
    if (!homeHeroEntry) return;

    let lastHandledPortrait = portrait.matches;
    let orientationActive = false;
    let orientationRebuilt = false;
    let orientationStartWidth = lastWidth;
    let orientationFrameOne: number | undefined;
    let orientationFrameTwo: number | undefined;
    let orientationFallbackTimer: number | undefined;
    let orientationFinishTimer: number | undefined;

    const clearOrientationFrames = () => {
      if (orientationFrameOne !== undefined) window.cancelAnimationFrame(orientationFrameOne);
      if (orientationFrameTwo !== undefined) window.cancelAnimationFrame(orientationFrameTwo);
      orientationFrameOne = undefined;
      orientationFrameTwo = undefined;
    };

    const endOrientationTransaction = () => {
      clearOrientationFrames();
      if (orientationFallbackTimer !== undefined) window.clearTimeout(orientationFallbackTimer);
      if (orientationFinishTimer !== undefined) window.clearTimeout(orientationFinishTimer);
      orientationFallbackTimer = undefined;
      orientationFinishTimer = undefined;
      orientationActive = false;
      orientationRebuilt = false;
    };

    const finishOrientationRebuild = () => {
      if (!orientationActive || orientationRebuilt) return;
      clearOrientationFrames();
      window.clearTimeout(debounce);
      debounce = undefined;
      lastWidth = window.innerWidth;
      lastHandledPortrait = portrait.matches;
      rebuildAll();
      orientationRebuilt = true;
      if (orientationFallbackTimer !== undefined) window.clearTimeout(orientationFallbackTimer);
      orientationFallbackTimer = undefined;

      /* Spaete Resize-/orientationchange-Signale derselben Drehung duerfen die
       * bereits laufende ca. 1,2-s-Zeilenanimation nicht erneut aufbauen. */
      orientationFinishTimer = window.setTimeout(endOrientationTransaction, 1400);
    };

    const queueOrientationRebuild = () => {
      if (!orientationActive || orientationRebuilt) return;
      clearOrientationFrames();
      orientationFrameOne = window.requestAnimationFrame(() => {
        orientationFrameOne = undefined;
        orientationFrameTwo = window.requestAnimationFrame(() => {
          orientationFrameTwo = undefined;
          // Erst der MQL-Wechsel garantiert, dass die neue CSS-Geometrie gilt.
          if (portrait.matches !== lastHandledPortrait) finishOrientationRebuild();
        });
      });
    };

    const armOrientationFallback = () => {
      if (orientationFallbackTimer !== undefined) window.clearTimeout(orientationFallbackTimer);
      orientationFallbackTimer = window.setTimeout(() => {
        if (!orientationActive || orientationRebuilt) return;
        if (
          portrait.matches !== lastHandledPortrait
          || window.innerWidth !== orientationStartWidth
        ) {
          finishOrientationRebuild();
          return;
        }

        // Seltenes orientationchange ohne echten Formatwechsel: nichts neu
        // starten, den vorsorglich gehaltenen Hero lediglich wieder freigeben.
        gsap.set(homeHeroEntry.el, { autoAlpha: 1 });
        endOrientationTransaction();
      }, 700);
    };

    const beginOrientationTransaction = (earlySignal = false) => {
      const orientationChanged = portrait.matches !== lastHandledPortrait;

      if (!orientationActive) {
        if (!orientationChanged && !earlySignal) return;
        orientationActive = true;
        orientationRebuilt = false;
        orientationStartWidth = lastWidth;
        gsap.set(homeHeroEntry.el, { autoAlpha: 0 });
        armOrientationFallback();
      } else if (orientationRebuilt) {
        // Auch ein sehr schnelles Zurueckdrehen ist eine neue Transaktion.
        if (!orientationChanged) return;
        if (orientationFinishTimer !== undefined) window.clearTimeout(orientationFinishTimer);
        orientationFinishTimer = undefined;
        orientationRebuilt = false;
        orientationStartWidth = lastWidth;
        gsap.set(homeHeroEntry.el, { autoAlpha: 0 });
        armOrientationFallback();
      }

      queueOrientationRebuild();
    };

    /* Chrome kann orientationchange, MediaQuery-change und resize in
     * unterschiedlicher Reihenfolge melden. Alle drei Signale laufen deshalb
     * in dieselbe idempotente Transaktion: frueh halten, genau einmal neu
     * splitten, spaete Duplikate ignorieren. */
    window.addEventListener(
      'orientationchange',
      () => beginOrientationTransaction(true),
      { passive: true },
    );

    /* Ein Gerätewechsel ist kein stufenloses Resize: CSS und Textspalte
     * springen in einem Schritt auf die neue Geometrie. Der bisherige
     * 200-ms-Desktop-Debounce ließ bis dahin noch die alten SplitText-Masken
     * stehen. Besonders das lange Startseiten-Statement behielt dadurch kurz
     * seine Hochformat-Zeilenhöhe; beim verspäteten Re-Split wurden Abschnitt
     * und gesamter Folgeinhalt dann sichtbar nach oben gezogen. Das
     * Orientation-Media-Event läuft bereits mit der neuen CSS-Geometrie und
     * baut die Zeilen deshalb sofort im selben Wechsel neu auf. */
    portrait.addEventListener('change', () => {
      beginOrientationTransaction();
    });

    window.addEventListener('resize', () => {
      if (orientationActive) {
        if (orientationRebuilt) lastWidth = window.innerWidth;
        else queueOrientationRebuild();
        return;
      }
      if (portrait.matches !== lastHandledPortrait) {
        beginOrientationTransaction();
        return;
      }
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(rebuildAll, RESIZE_DEBOUNCE_MS);
    });
  });
}
