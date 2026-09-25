/*
 * Das kleine, abhaengigkeitsfreie Header-Bootstrap in Header.astro reagiert
 * bereits waehrend des HTML-Parsens auf den ersten Tap. Das vollstaendige
 * Menue-Modul bringt danach die GSAP-Choreografie, Rotation-Stabilisierung und
 * A11y-Logik mit.
 *
 * Das vollstaendige Menue-Modul wird auf allen Seiten sofort geladen. Nur wenn
 * der Nutzer noch waehrend des HTML-Parsens getippt hat und die native
 * Fruehanimation bereits laeuft, wartet die Uebergabe bis zu deren sichtbarem
 * Ende. Dadurch verwendet AIO nach dem Start denselben GSAP-Controller wie
 * jede andere Seite und besitzt keinen dauerhaft abweichenden Menuepfad.
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
     Oeffnungsanimation erst sichtbar fertig werden. Ohne Fruehinteraktion
     startet derselbe Menue-Controller wie auf allen anderen Seiten sofort. */
  scheduleLoad(toggle?.hasAttribute('data-menu-early-interacted') ? 780 : 0);

  document.addEventListener(
    'site:early-menu-interaction',
    () => scheduleLoad(780),
    { once: true },
  );
}

export {};
