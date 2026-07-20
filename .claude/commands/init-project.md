---
description: Initialisiert und baut ein neues upgreight Astro-Projekt (Skill, Sanity dormant, Seed-first)
argument-hint: Name, Domain, Sprachen, alte Webseite, Seiten, Design, Animationen, Formulare
---
Initialisiere und baue dieses Projekt mit unserem Astro-Skill (upgreight-astro-website).

Vorgehen:
1. Lies meine Projekt-Infos unten.
2. Pruefe, ob das Template schon initialisiert ist (heisst package.json noch
   "upgreight-astro-starter"?). Wenn NICHT initialisiert: fuehre einmal
   `node scripts/init.mjs --name <slug> --domain <domain>` aus. Das ersetzt die
   Platzhalter UND setzt die Git-Historie auf einen frischen Initial-Commit
   zurueck, damit dieses Projekt nicht die Template-Historie mitschleppt. Wenn
   schon initialisiert: NICHT erneut ausfuehren (sonst neuer Git-Reset).
3. Fehlt etwas Wichtiges aus der Checkliste oder ist es unklar, FRAG mich gezielt nach,
   BEVOR du scaffoldest. Lieber 3 kurze Rueckfragen als falsche Annahmen.
4. Sanity: Kunde pflegt selbst. Dormant bauen, erst nach meiner Freigabe wirklich verbinden.
5. Bau lauffaehig auf dem Seed, dann sag mir, wenn ich reviewen kann.

Checkliste (frag aktiv nach, was in meinen Infos fehlt):
- Alte Webseite: Link + Screenshots (Design-, Inhalts- und Struktur-Referenz)
- Seiten: welche und wie viele (Liste)
- Sprachen: nur DE / DE+IT / andere
- Design: Stil, Farben, Schriften, Vorbild-Seiten; Logo und Bilder vorhanden?
- Animationen: GSAP-Umfang? welche konkret (Scroll-Reveals, Hero, Hover, Parallax,
  Zaehler ...) oder dezent/keine? (Lenis-Smooth-Scroll ist bereits drin)
- Inhalte: Texte und Bilder vorhanden oder zu erstellen?
- Formulare: Kontaktformular? wohin senden? Datenschutz/Impressum (extern verlinkt
  oder eigene Seite)?
- SEO/Technisch: Domain, Weiterleitungen alter URLs, Deadline

Projekt-Infos:
$ARGUMENTS
