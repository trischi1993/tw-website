/**
 * Richtet ein Fragment nach dem Aufbau von Motion, Widgets, Schriften und
 * Medien genau einmal neu aus. Der Browser darf seine native Fragment-
 * Navigation zuvor normal abschließen; danach bleiben URL, History und die ID
 * des Ziels unangetastet.
 */

export {};

const root = document.documentElement;

function initialHashTarget(): HTMLElement | null {
  const raw = (root.dataset.initialHash ?? window.location.hash).slice(1);
  if (!raw) return null;

  try {
    return document.getElementById(decodeURIComponent(raw));
  } catch {
    return document.getElementById(raw);
  }
}

const clearInitialHashState = () => {
  delete root.dataset.initialHash;
  root.classList.remove('has-initial-hash', 'initial-hash-ready');
};

const target = initialHashTarget();

if (target && root.classList.contains('has-initial-hash')) {
  const jumpToTarget = () => {
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start', inline: 'nearest' });
    root.style.scrollBehavior = previousBehavior;
  };

  const pageLoaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((resolve) =>
        window.addEventListener('load', () => resolve(), { once: true }),
      );
  const fontsReady = document.fonts?.ready.then(
    () => undefined,
    () => undefined,
  ) ?? Promise.resolve();
  // Mobile Browser führen ihre native Fragment-Wiederherstellung teils erst
  // einige Frames nach `load` aus. Vorher dagegen zu scrollen erzeugt zwei
  // konkurrierende Zielpositionen und kann beim ersten Touch erneut springen.
  const nativeFragmentReady = new Promise<void>((resolve) =>
    window.setTimeout(resolve, 500),
  );

  Promise.all([pageLoaded, fontsReady, nativeFragmentReady]).then(() => {
    // Zuerst die für Überschrift/FAQ zurückgehaltenen Reveal-Trigger anlegen.
    // Ihre interne Neuberechnung läuft dadurch noch hinter der Blende ab.
    window.dispatchEvent(new Event('lp:initial-hash-ready'));

    requestAnimationFrame(() => {
      // Der verdeckte Sprung stößt bei einem Reload auch die noch ausstehende
      // native Fragment-Wiederherstellung an. Deren Ergebnis ist die normale
      // Browser-Ankerposition und wird anschließend nicht mehr überschrieben.
      jumpToTarget();

      window.setTimeout(() => {
        // Erst in der stabilen nativen Position die Blende öffnen. Ab hier
        // findet kein weiterer Scroll statt.
        root.classList.add('initial-hash-ready');

        // Nach dem Ausblenden der Seitenblende ist die Sonderbehandlung
        // vollständig beendet. Es bleibt kein Scroll-/Lifecycle-Listener aktiv.
        window.setTimeout(clearInitialHashState, 250);
      }, 100);
    });
  });
} else {
  clearInitialHashState();
}
