/* Lange Kundenstimmen stehen bereits serverseitig in derselben gekuerzten
   Geometrie wie nach der frueheren Widget-Initialisierung. Dieses kleine,
   GSAP-freie Modul aktiviert nur noch den „weiterlesen"-Button. Dadurch kann
   die Seitenhoehe beim mobilen AIO-Reload nicht erst Sekunden spaeter kippen. */

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  const button = target?.closest<HTMLButtonElement>('[data-read-more] .read-more');
  const text = button?.closest<HTMLElement>('[data-read-more]');
  if (!button || !text || text.classList.contains('is-expanded')) return;

  text.classList.add('is-expanded');
  button.setAttribute('aria-expanded', 'true');
  window.dispatchEvent(new Event('lp:layout-changed'));
});

export {};
