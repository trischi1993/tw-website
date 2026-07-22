/**
 * Korrigiert dokumentübergreifende Fragment-Navigation, nachdem Motion,
 * Schriften und Medien ihre endgültigen Layoutgrößen gesetzt haben.
 *
 * Der Browser springt bei `/#fragment` bereits während des HTML-Parsens.
 * Anschließend vergrößert ScrollTrigger auf der Startseite vorausgehende
 * Scroll-Strecken; ohne Nachjustierung liegt das Ziel dadurch gelegentlich
 * außerhalb des Viewports. Gleichseitige Anchor-Klicks bleiben nativ und
 * behalten das gewünschte Smooth-Scrolling.
 */

export {};

function initialHashTarget(): HTMLElement | null {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;

  try {
    return document.getElementById(decodeURIComponent(raw));
  } catch {
    return document.getElementById(raw);
  }
}

const target = initialHashTarget();

if (target) {
  const jumpToTarget = () => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;

    // Die Nachkorrektur soll nicht als zweite sichtbare Smooth-Animation
    // ablaufen. scroll-margin-top am Ziel bleibt via scrollIntoView erhalten.
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start', inline: 'nearest' });
    root.style.scrollBehavior = previousBehavior;
  };

  const afterLayout = () => {
    requestAnimationFrame(() => requestAnimationFrame(jumpToTarget));
  };

  afterLayout();

  if (document.readyState === 'complete') {
    afterLayout();
  } else {
    window.addEventListener('load', afterLayout, { once: true });
  }

  document.fonts?.ready.then(afterLayout);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) afterLayout();
  });
}
