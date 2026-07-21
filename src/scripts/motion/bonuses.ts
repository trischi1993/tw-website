/* ---------------------------------------------------------------------------
   Bonusse (AIO): BEWUSST ohne Animation.

   Die IX2-Hover-Choreo a-130/a-131 zielt auf `.grid_item-link` - diese Klasse
   existiert auf KEINER Live-Seite (die Bonus-Karten sind `.layout395_card`,
   ohne data-w-id/Events). Der Hover war ein Überbleibsel der nicht migrierten
   Grid-Seiten und ist auf der Live-Site ein No-op → Karten bleiben statisch
   (1:1-Parität). Modul bleibt als verdrahteter Platzhalter bestehen.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  // bewusst leer
}
