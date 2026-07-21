/* ---------------------------------------------------------------------------
   Interessen-Wort-Marquee (Über mich): Auf der Live-Site läuft der Marquee
   als CSS-Embed-Animation (22 s linear infinite, zweite Reihe
   animation-direction: reverse) - exakt so in sections.css umgesetzt.
   Die IX2-ActionLists a-126-a-129 zielen auf `.process-step_marquee`, das im
   Interest-Banner-Markup des Exports nicht existiert → No-ops.
   Die Eintritts-Reveals der beiden Marquee-Blöcke (a-117) und des Grids
   (a-110) laufen über das generische data-anim="reveal"-Vokabular
   (motion/reveals.ts). Hier ist daher bewusst nichts zu tun.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  /* bewusst leer - siehe Kommentar oben */
}
