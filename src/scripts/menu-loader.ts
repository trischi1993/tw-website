/*
 * Das kleine, abhaengigkeitsfreie Header-Bootstrap in Header.astro reagiert
 * bereits waehrend des HTML-Parsens auf den ersten Tap. Das vollstaendige
 * Menue-Modul bringt danach die GSAP-Choreografie, Rotation-Stabilisierung und
 * A11y-Logik mit.
 *
 * Auf der sehr langen mobilen AIO-Seite darf dieses schwere Modul beim echten
 * Erstaufruf nicht gleichzeitig mit der sichtbaren Header-/Hero-Choreografie
 * geparst werden: Mobile Safari haelt sonst den Hauptthread kurz an und der
 * erste Tap wirkt, als sei der Menuebutton noch nicht bereit. Nur dort wird
 * das Nachladen deshalb bis nach der Startchoreografie verschoben. Die Optik
 * und die Menueanimation selbst bleiben unveraendert.
 */

const root = document.documentElement;
const toggle = document.querySelector<HTMLElement>('[data-nav-toggle]');
const isMobileAio =
  root.classList.contains('is-aio-route') &&
  window.matchMedia('(max-width: 991px), (hover: none) and (pointer: coarse)').matches;

let loadPromise: Promise<unknown> | undefined;
let loadTimer: number | undefined;

const loadMenu = () => {
  if (!loadPromise) loadPromise = import('./menu.ts');
  return loadPromise;
};

if (!isMobileAio) {
  void loadMenu();
} else {
  const scheduleLoad = (delay: number) => {
    if (loadPromise) return;
    if (loadTimer !== undefined) window.clearTimeout(loadTimer);
    loadTimer = window.setTimeout(() => {
      loadTimer = undefined;
      void loadMenu();
    }, delay);
  };

  /* Wurde schon waehrend des Parsens getippt, darf die native
     Oeffnungsanimation erst sichtbar fertig werden. Andernfalls liegt der
     normale Fallback knapp hinter der 1,5-s-AIO-Headerchoreografie. */
  scheduleLoad(toggle?.hasAttribute('data-menu-early-interacted') ? 780 : 1650);

  document.addEventListener(
    'site:early-menu-interaction',
    () => scheduleLoad(780),
    { once: true },
  );
}

export {};
