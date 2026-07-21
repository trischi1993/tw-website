# Animations-Spec — Tristan Weithaler (Webflow → Astro/GSAP), v2

**Stand 2026-07-21 (Session 3): Komplett-Neudekodierung.** Die v1 dieser Datei
enthielt zwei Kernfehler, die zu einer falschen Erst-Implementierung geführt
haben — sie ist ersetzt. Verbindliche Datenquellen liegen jetzt daneben:

- **`animations-ix2-decoded.txt`** — der vollständige, lesbar aufgelöste
  IX2-Datensatz (alle für die Live-Seiten relevanten ActionLists mit Events,
  Triggern, mq, Keyframes, Delays, Dauern, Easings, Farbwerten), thematisch
  geclustert (HOME-LOAD, HOME-HERO-SCROLL, HOME-RESULTS, HOME-WORK,
  HOME-SECTIONS, ABOUT, AIO, FAQ, MENU-NAVBAR, FOOTER, BUTTONS-GLOW, COOKIE).
- **`animations-ix3-timeline.json`** — die IX3-Interaction (Webflow-natives
  GSAP) der Über-mich-Timeline: `[interactions, timelines]` roh aus
  `webflow.js` extrahiert.
- **`animations-implementation-rules.md`** — die beim Neuaufbau verwendeten
  Semantik-Festlegungen (Easing-Map, Breakpoints, IX2/IX3-Ausführungsmodell,
  Hook-Vokabular, Datei-Ownership).

## Korrekturen gegenüber v1 (warum die Erst-Implementierung falsch war)

1. **IX2-Trigger sind mehrheitlich ELEMENT-gebunden** (`data-w-id` im HTML ↔
   `target.id` im Datensatz), nicht klassenbasiert. v1 hatte die `data-w-id`s
   für tot erklärt und darum ganze Animationsgruppen übersehen bzw. erfunden.
2. **IX3 existiert**: Die Über-mich-Timeline ist eine Webflow-IX3-Interaction
   (in `webflow.js`: `Webflow.require("ix3") … register([...])`) mit exakten
   Keyframes für 9 Stationen (Liste x 0→-800vw, Karte 24vw→100vw, SplitText-
   Stagger für Station 6/7, Letter-Flüge Station 5). Scrub 0.8 über den
   1200vh-Track, `tiny` (≤479) deaktiviert. GSAP mappt `progress()` über die
   Timeline-Eigenlänge (≈0.24) — die Positionswerte verteilen sich also über
   die GESAMTE Scrollstrecke.
3. **Leere Action-Targets `{}` sind tote Verweise** (gelöschte Webflow-Styles):
   Die IX2-Runtime (`getAffectedElements`) liefert dafür `[]` → No-op. Dadurch
   entfallen u. a.: FAQ-Slide von links (nur der `.faq_top`-Fade ist echt),
   die komplette `.splide__slide`-Hover-Anim, a-143, die Gegenrichtung des
   Interessen-Marquees (a-128/129).
4. **Auf keiner Live-Seite vorhandene Selektoren** → ebenfalls tot: `.heading-2`
   (a-106), `.link-block`-3D-Tilt (a-18), `.splide__slide` (a-22/23).
5. **Load-Choreografien**: Home = PAGE_FINISH (`window.load`, a-105 inkl.
   Navbar-Logo-Slides ±140 % und Hero-Whipe-Kollaps), Über-mich = PAGE_START
   (a-125, Portrait-Whipe = HÖHEN-Kollaps 100 %→0, kein x-Slide), AIO =
   PAGE_START (a-142, Vimeo-Wrapper-Fade bei 1300 ms). Legal/404: keine.
6. **Wichtigste Einzel-Korrekturen**: Home-Hero-Scrub = `content-right`-Breite
   40 %→100 % @0–60 % (mq main), kein Opacity-Wipe · „Zahlen & Fakten" =
   Karten fliegen sequenziell nach OBEN raus (rotierend, exakte Keyframes,
   getrennte Desktop/Mobile-Listen a-139/a-140), kein Fächer, keine
   Titel-Gegenläufe · „Bekannt aus"/AIO-Säulen = MAUS-Parallax (Track ±22 %,
   Items ∓40 px, mq main) statt Scroll-Scrub · Modul-Banner (AIO) = Scroll-
   Scrub x 0→-20rem (a-71) · Reviews-Banner-Scrub: top 10→-12 %, bottom
   -6→+11 % @0–95 % (a-120) · Fullscreen-Menü inkl. Desktop-Burger mit
   kompletter IX2-Choreo (a-26/58 Desktop, a-121/122 ≤991) · Footer-Reveal
   nur main+medium (a-87, Stagger-Choreo) + Geschwister-Dim-Hover (a-123/124)
   · Lottie-Socials: Hover-Play 0→99.8 % in 600 ms, kein Autoplay (a-78) ·
   Line-Textanimation (`js-line-animation`) existiert NUR an Hero-H1
   (delay 1 s) und Value-Statement-Text (stagger 0.5) auf Home.

## Easing-Map (verifiziert an den Runtime-Definitionen in webflow.js)

| Webflow (IX2) | GSAP |
|---|---|
| `''` (leer) | `none` (linear) |
| `ease` | CustomEase `0.25,0.1,0.25,1` (`wfEase`) |
| `easeInOut` | CustomEase `0.42,0,0.58,1` (`wfEaseInOut`) |
| `outSine` | `sine.out` |
| `outQuart` | `power3.out` (Quart = power3) |
| `inOutQuart` | `power3.inOut` |
| `outQuint` | `power4.out` |

IX3-Ease-Indizes (Array in webflow.js): `0=none, 1=power1.in, 2=power1.out,
3=power1.inOut, …` (vollständige Liste in animations-implementation-rules.md).
IX2-Dauern/Delays in Millisekunden; `js-line-animation`-Werte in Sekunden.

## Umsetzung im Repo

Zentraler Einstieg `src/scripts/motion.ts` (reduced-motion-Gate,
`html.has-motion`) mit Feature-Modulen unter `src/scripts/motion/*`
(util, lines, reveals, home-load, home-hero, results, banner, gallery,
faq-hover, aio-load, module, bonuses, about-load, timeline, interests,
footer, buttons, glow). Funktionale Interaktionen (Menü, FAQ-Accordion,
Modals, Consent) bleiben in `menu.ts`/`widgets.ts`/`consent.ts` und sind
auch unter `prefers-reduced-motion` bedienbar.

Weiterhin gültig aus v1: keine Seiten-Transition, kein Lenis/Typekit/jQuery
(im Export tot bzw. inaktiv), Finsweet-Cookie/CMS-Load durch eigene schlanke
Implementierungen ersetzt.
