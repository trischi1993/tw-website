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

  gsap.set(el, { autoAlpha: 1 });
  const lines = entry.split.lines as HTMLElement[];

  // Nur der lange mobile Statement-Absatz braucht den nativen Compositor-Pfad.
  // Der kurze Hero und groessere Breakpoints behalten das GSAP-Original.
  if (
    el.classList.contains('value-stmt__text') &&
    window.matchMedia(MOBILE_STATEMENT).matches &&
    typeof lines[0]?.animate === 'function'
  ) {
    buildNativeMobile(entry, lines, speed, delay, amount, replay);
    return;
  }

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
  tl.fromTo(
    lines,
    { yPercent: 100 },
    { yPercent: 0, duration: speed, delay, ease: 'power2.out', stagger: { amount } },
  );
  entry.tl = tl;
}

function rebuild(entry: LineAnim): void {
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
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => entries.forEach(rebuild), RESIZE_DEBOUNCE_MS);
    });
  });
}
