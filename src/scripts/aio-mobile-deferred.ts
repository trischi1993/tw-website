/*
 * Bedarfsgerechtes AIO-Startup fuer kleine Touch-Viewports.
 *
 * Die sichtbare Header-/Hero-Choreografie und die fruehen Scroll-Reveals sind
 * bereits in zwei kleinen nativen Modulen aktiv. Die grossen, weit unterhalb
 * liegenden Pakete werden deshalb nicht mehr zu einem festen Zeitpunkt
 * gemeinsam ausgewertet, sondern mehrere Viewports vor ihrem ersten echten
 * Verbraucher. Eine serielle Queue gibt zwischen den Paketen an Browser und
 * Eingabe zurueck; waehrend einer Menuebewegung startet kein neues Paket.
 */

type DeferredTask = {
  run: () => Promise<unknown>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

const root = document.documentElement;
const toggle = document.querySelector<HTMLElement>('[data-nav-toggle]');
const header = document.querySelector<HTMLElement>('[data-site-header]');
const pending: DeferredTask[] = [];
let menuBusy = toggle?.getAttribute('aria-expanded') === 'true';
let running = false;
let firstFrame: number | undefined;
let secondFrame: number | undefined;
let activeMenuPointerId: number | undefined;
let touchBusy = false;
let scrollBusy = false;
let scrollQuietTimer: number | undefined;

const SCROLL_QUIET_MS = 180;

const cancelScheduledStart = () => {
  if (firstFrame !== undefined) cancelAnimationFrame(firstFrame);
  if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
  firstFrame = undefined;
  secondFrame = undefined;
};

const scheduleNext = () => {
  if (
    running ||
    menuBusy ||
    touchBusy ||
    scrollBusy ||
    !pending.length ||
    firstFrame !== undefined
  ) return;

  /* Zwei Frames sind keine Wartezeit fuer die Funktion, sondern eine
     kooperative Paint-Grenze: bereits anstehende Touch-/Pointer-Eingaben und
     der aktuelle Scrollframe erhalten Vorrang, bevor genau ein Import startet. */
  firstFrame = requestAnimationFrame(() => {
    firstFrame = undefined;
    if (running || menuBusy || touchBusy || scrollBusy || !pending.length) return;
    secondFrame = requestAnimationFrame(() => {
      secondFrame = undefined;
      if (running || menuBusy || touchBusy || scrollBusy || !pending.length) return;

      const task = pending.shift();
      if (!task) return;
      running = true;
      if (root.hasAttribute('data-aio-restore-aborted')) {
        running = false;
        task.resolve();
        window.setTimeout(scheduleNext, 0);
        return;
      }
      void task.run().then(task.resolve, task.reject).finally(() => {
        running = false;
        window.setTimeout(scheduleNext, 0);
      });
    });
  });
};

const createLoader = (name: string, load: () => Promise<unknown>) => {
  let promise: Promise<void> | undefined;
  return () => {
    if (promise) return promise;
    promise = new Promise<void>((resolve, reject) => {
      pending.push({
        run: async () => {
          if (root.hasAttribute('data-aio-restore-aborted')) return;
          await load();
          if (root.hasAttribute('data-aio-restore-aborted')) return;
          root.dataset[`aio${name}Ready`] = '1';
        },
        resolve,
        reject,
      });
      scheduleNext();
    });
    return promise;
  };
};

/* Ein gestarteter Dynamic Import ist nicht abbrechbar. Beginnt waehrend des
   Downloads eine neue Geste, darf das danach folgende DOM-/ScrollTrigger-Init
   trotzdem nicht in diese Bewegung fallen. Zwei ruhige Paints nach dem
   letzten Scroll-/Touch-Signal bilden deshalb eine zweite, getrennte Schranke. */
const waitForInteractiveIdle = (): Promise<void> => new Promise((resolve) => {
  const check = () => {
    if (root.hasAttribute('data-aio-restore-aborted')) {
      resolve();
      return;
    }
    if (menuBusy || touchBusy || scrollBusy) {
      window.setTimeout(check, 50);
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (menuBusy || touchBusy || scrollBusy) check();
        else resolve();
      });
    });
  };
  check();
});

let motionPromise: Promise<void> | undefined;
const loadMotion = () => {
  if (motionPromise) return motionPromise;
  motionPromise = new Promise<void>((resolve, reject) => {
    let module: typeof import('./motion.ts') | undefined;
    pending.push({
      /* Nur Download/Auswertung belegt den seriellen Loader. Die anschliessende
         Ruhepruefung darf Results und Widgets nicht hinter Motion festhalten,
         wenn der Nutzer ohne Pause bereits tiefer scrollt. */
      run: async () => {
        module = await import('./motion.ts');
      },
      resolve: () => {
        void (async () => {
          if (root.hasAttribute('data-aio-restore-aborted')) {
            resolve();
            return;
          }
          await waitForInteractiveIdle();
          if (root.hasAttribute('data-aio-restore-aborted')) {
            resolve();
            return;
          }
          module?.init();
          root.dataset.aioMotionReady = '1';
          resolve();
        })().catch(reject);
      },
      reject,
    });
    scheduleNext();
  });
  return motionPromise;
};
const loadResults = createLoader(
  'Results',
  () => import('./aio-results-interactions.ts'),
);
const loadWidgets = createLoader('Widgets', () => import('./widgets.ts'));

const setMenuBusy = (busy: boolean) => {
  menuBusy = busy;
  if (busy) cancelScheduledStart();
  else scheduleNext();
};

/* Dynamic Imports werden ausgewertet, sobald ihr Netzwerk-Request endet. Das
   grosse Motion-Paket darf deshalb niemals mitten in einer Touch-Geste oder
   in Safaris/Chromes Momentum-Scroll starten: genau das erzeugte den sichtbaren
   Haken zwischen Programm und Bonusse. Die kleinen nativen AIO-Reveals laufen
   waehrenddessen unveraendert weiter; nach 180 ms echter Scrollruhe ist bis zum
   ersten tiefen Spezialziel noch reichlich Vorlauf. */
const setTouchBusy = (busy: boolean) => {
  touchBusy = busy;
  if (busy) cancelScheduledStart();
  else scheduleNext();
};

const markScrollBusy = () => {
  scrollBusy = true;
  cancelScheduledStart();
  if (scrollQuietTimer !== undefined) window.clearTimeout(scrollQuietTimer);
  scrollQuietTimer = window.setTimeout(() => {
    scrollQuietTimer = undefined;
    scrollBusy = false;
    scheduleNext();
  }, SCROLL_QUIET_MS);
};

window.addEventListener('scroll', markScrollBusy, { passive: true });
document.addEventListener('touchstart', () => setTouchBusy(true), {
  capture: true,
  passive: true,
});
document.addEventListener('touchend', () => setTouchBusy(false), {
  capture: true,
  passive: true,
});
document.addEventListener('touchcancel', () => setTouchBusy(false), {
  capture: true,
  passive: true,
});

/* Capture laeuft vor dem Toggle-Handler und schliesst damit auch das kleine
   Zeitfenster zwischen Pointerdown und dem semantischen Menue-Event. */
document.addEventListener('pointerdown', (event) => {
  const isPrimaryButton = event.pointerType !== 'mouse' || event.button === 0;
  if (
    event.isPrimary !== false &&
    isPrimaryButton &&
    (event.target as Element | null)?.closest('[data-nav-toggle]')
  ) {
    activeMenuPointerId = event.pointerId;
    setMenuBusy(true);
  }
}, { capture: true, passive: true });
document.addEventListener('pointerup', (event) => {
  if (event.pointerId !== activeMenuPointerId) return;
  activeMenuPointerId = undefined;
  /* click folgt im selben Eingabezyklus auf pointerup. Erst im naechsten
     Frame loesen wir einen abgebrochenen Maus-/Trackpad-Tap; ein regulaeres
     Oeffnen hat bis dahin aria-expanded gesetzt. Beim Schliessen bleibt die
     Sperre bis zum echten Animationsende aktiv. */
  requestAnimationFrame(() => {
    const transitionActive =
      toggle?.getAttribute('aria-expanded') === 'true' ||
      header?.classList.contains('is-menu-open') ||
      header?.classList.contains('is-menu-closing');
    if (!transitionActive) setMenuBusy(false);
  });
}, { capture: true, passive: true });
document.addEventListener('touchstart', (event) => {
  if ((event.target as Element | null)?.closest('[data-nav-toggle]')) setMenuBusy(true);
}, { capture: true, passive: true });
document.addEventListener('pointercancel', (event) => {
  if (event.pointerId !== activeMenuPointerId) return;
  activeMenuPointerId = undefined;
  const transitionActive =
    toggle?.getAttribute('aria-expanded') === 'true' ||
    header?.classList.contains('is-menu-open') ||
    header?.classList.contains('is-menu-closing');
  if (!transitionActive) setMenuBusy(false);
}, { capture: true, passive: true });
document.addEventListener('touchcancel', () => {
  const transitionActive =
    toggle?.getAttribute('aria-expanded') === 'true' ||
    header?.classList.contains('is-menu-open') ||
    header?.classList.contains('is-menu-closing');
  if (!transitionActive) setMenuBusy(false);
}, { capture: true, passive: true });
window.addEventListener('tw:mobile-menu-open', () => setMenuBusy(true));
window.addEventListener('tw:mobile-menu-closed', () => setMenuBusy(false));
window.addEventListener('aio:restore-aborted', () => {
  cancelScheduledStart();
  if (scrollQuietTimer !== undefined) window.clearTimeout(scrollQuietTimer);
  scrollQuietTimer = undefined;
  pending.splice(0).forEach((task) => task.resolve());
});

function loadNear(
  selector: string,
  leadViewports: number,
  load: () => Promise<void>,
): void {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  let observer: IntersectionObserver | undefined;
  let resizeFrame: number | undefined;
  let started = false;

  const start = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    window.removeEventListener('scroll', fallbackCheck);
    window.removeEventListener('resize', scheduleObserverRefresh);
    window.removeEventListener('resize', fallbackCheck);
    void load().catch(() => {
      /* Die Seite bleibt bei einem einzelnen Chunk-/Netzfehler bedienbar und
         erzeugt keine globale unhandledrejection. Hash- und Restore-Pfade
         erhalten dasselbe abgelehnte Promise und wechseln dort kontrolliert
         in ihren bereits vorhandenen statischen Fallback. */
      root.dataset.aioDeferredLoadFailed = '1';
    });
  };

  const hasReachedLoadRange = () => {
    const bounds = target.getBoundingClientRect();
    const lead = document.documentElement.clientHeight * leadViewports;
    /* Auch ein bereits oberhalb liegendes Ziel gilt als erreicht. Das ist bei
       einem tiefen Reload wichtig: Ein normaler IntersectionObserver wuerde
       ein komplett uebersprungenes Element sonst nie mehr melden. */
    return bounds.top <= window.innerHeight + lead;
  };

  const fallbackCheck = () => {
    resizeFrame = undefined;
    if (hasReachedLoadRange()) start();
  };

  const scheduleObserverRefresh = () => {
    if (started || resizeFrame !== undefined) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = undefined;
      if (typeof IntersectionObserver === 'undefined') {
        fallbackCheck();
        return;
      }
      if (hasReachedLoadRange()) {
        start();
        return;
      }
      observer?.disconnect();
      const lead = Math.ceil(document.documentElement.clientHeight * leadViewports);
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) start();
        },
        { rootMargin: `${lead}px 0px`, threshold: 0 },
      );
      observer.observe(target);
    });
  };

  if (typeof IntersectionObserver !== 'undefined') {
    scheduleObserverRefresh();
    window.addEventListener('resize', scheduleObserverRefresh, { passive: true });
  } else {
    window.addEventListener('scroll', fallbackCheck, { passive: true });
    window.addEventListener('resize', fallbackCheck, { passive: true });
    fallbackCheck();
  }
}

/* Das Spezial-Motion-Ziel ist der erste AIO-Bereich, den die kleinen nativen
   Reveals nicht bereits vollstaendig abdecken. Vier Viewports Vorlauf laden
   das Bundle noch vor Programmende, aber niemals waehrend des Hero-Starts. */
loadNear('[data-anim="aio-growth-system"]', 4, loadMotion);
loadNear('[data-before-after]', 3, loadResults);
loadNear('[data-faq-item], [data-tabs], [data-load-more]', 3, loadWidgets);

const restoredY = Number(root.dataset.aioRestoreY);
const needsAtPosition = (position: number, selector: string, leadViewports: number) => {
  if (!Number.isFinite(position) || position < 0) return false;
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return false;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  return targetTop <= position + window.innerHeight * (leadViewports + 1);
};

const restoredTasks: Promise<void>[] = [];
if (restoredY > 0 && needsAtPosition(restoredY, '[data-anim="aio-growth-system"]', 4)) {
  restoredTasks.push(loadMotion());
}
if (restoredY > 0 && needsAtPosition(restoredY, '[data-before-after]', 3)) {
  restoredTasks.push(loadResults());
}
if (
  restoredY > 0 &&
  needsAtPosition(restoredY, '[data-faq-item], [data-tabs], [data-load-more]', 3)
) {
  restoredTasks.push(loadWidgets());
}

export const aioRestoredViewportReady: Promise<unknown> = Promise.all(restoredTasks);
if (restoredTasks.length) root.setAttribute('data-aio-restore-initializing', '');

/* Bei einer Fragmentnavigation liegt das Ziel moeglicherweise bereits tief in
   der Seite. Die vorhandene Seitenblende darf erst nach den dafuer relevanten
   Layout-Initialisierungen freigeben; ohne Fragment bleiben die Pakete lazy. */
const rawHash = window.location.hash.slice(1);
let hashTarget: HTMLElement | null = null;
if (rawHash) {
  try {
    hashTarget = document.getElementById(decodeURIComponent(rawHash));
  } catch {
    hashTarget = document.getElementById(rawHash);
  }
}
const hashPosition = hashTarget
  ? hashTarget.getBoundingClientRect().top + window.scrollY
  : -1;
const hashTasks: Promise<void>[] = [];
if (needsAtPosition(hashPosition, '[data-anim="aio-growth-system"]', 4)) {
  hashTasks.push(loadMotion());
}
if (needsAtPosition(hashPosition, '[data-before-after]', 3)) hashTasks.push(loadResults());
if (needsAtPosition(hashPosition, '[data-faq-item], [data-tabs], [data-load-more]', 3)) {
  hashTasks.push(loadWidgets());
}

export const aioDeferredHashReady: Promise<unknown> = Promise.all(hashTasks);

export {};
