# Spec — Seite „ALL-IN-ONE Coaching" (`all-in-one-coaching`)

Quelle: `tristan-webflow-code/all-in-one-coaching.html` (Zeilen 557–2261 = `<main>`).
CSS: `css/tristan93.webflow.css`, `css/webflow.css`. Live: https://tristanweithaler.com/all-in-one-coaching

**Diese Spec deckt NUR den Hauptinhalt + das seitenspezifische Formular `wf-form-aiocoaching-Anfrage` ab.**
Header, Footer, globales CTA-Modal (`cta-modal` / `wf-form-Anfrage`), Cookie-Banner → anderer Agent.
Wichtig: Die Seite enthält im DOM ZWEI Modals — siehe Abschnitt 19/20.

---

## 0. Seiten-Meta & globale Grundlagen

- **`<title>`**: `ALL-IN-ONE Social Media Coaching | Tristan Weithaler`
- **meta description**: „Mein ALL-IN-ONE Social Media Coaching ist das Komplettpaket für Selbständige und Unternehmen. Dort lernst du die Grundlagen von Social Media, klare Strategien für mehr Reichweite, Follower und Kunden sowie professionelle Content-Erstellung für nachhaltiges Wachstum."
- **og:image**: `.../68b947ba4d3150399c835e99_tristan3.avif` (im Export: `images/68b947ba4d3150399c835e99_tristan3.avif`)
- **og:url**: `https://tristanweithaler.com/all-in-one-coaching`
- **Struktur**: `<main class="main-wrapper">` umschließt alles.

### Design-Tokens (aus `:root`, aufgelöst)
| Token | Wert |
|---|---|
| Hintergrund primär (Seite) | `#0c0c0c` (`--base-color-brand--black-brand`) |
| Hintergrund sekundär (Karten/Formfelder) | `#1d1d1d` (`--grey-blue-dark`) |
| Hintergrund tertiär | `#4d5258` (`--grey-blue`) |
| Text primär | `whitesmoke` (#f5f5f5) |
| Text tertiär | `#d3d3d3` (`--grey-lighter`) |
| Text sekundär | `#737373` (`--grey-light`) |
| **Brand-Gold (Akzent)** | `#806429` (`--base-color-brand--secondary`) |
| Gold-alt | `#5e4931` |
| Brand-Creme | `#d8d3cc` (`--base-color-brand--main`) |
| Rahmen sekundär (Linien) | `#1d1d1d` |
| Rahmen Formfelder | `#808389` (`--grey-blue-light`) |
| Fehler-Rot | `#b42318`, Fehler-BG `#fef3f2` |

### Typografie-Basis
- **Font: Poppins** (durchgängig; lokal `fonts/Poppins-*.ttf`, zusätzlich Typekit-Kit `vqw1kwc` geladen — nur Poppins referenziert). Body: `1rem / line-height 1.55 / weight 300`.
- rem-Basis = 16px (kein html font-size Override).

| Klasse | font-size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| `.heading-style-h1` | 4.65rem | 300 | 1.1 | -0.03em |
| `.heading-style-h2` | 2.875rem | 400 | 1.2 | -0.02em |
| `.heading-style-h3` | 2.25rem | 500 | 1.175 | -0.01em |
| `.heading-style-h4` | 2rem | 500 | 1.1875 | 0 |
| `.hero-value-display-text` | 4.25rem | 300 | 1.3 | -0.01em |
| `.text-size-medium` | 1.125rem | (300) | 1.55 | – |
| `.text-size-regular` | 1rem | (300) | 1.55 | – |
| `.text-size-small` | 0.875rem | – | – | – |

### Container-/Spacing-Utilities (aufgelöst, mit Breakpoints)
- **Webflow-Breakpoints**: Basis (Desktop >991), `max-width:991px` (Tablet), `max-width:767px` (Mobile-L), `max-width:479px` (Mobile-P).
- `.padding-global`: padding-left/right **5%**.
- `.container-large`: max-width **80rem**; `.container-medium`: **64rem**; `.container-small`: **48rem**. Alle zentriert (`margin: auto`).
- `.padding-section-large`: 7rem T/B → 991: 6rem → 767: 4rem.
- `.padding-section-medium`: 5 → 4 → 3rem.
- `.padding-section-small`: 3rem → (767) 2rem.
- `.padding-section-xxlarge`: 11 → 10 → 6rem.
- `.padding-xlarge`: 4rem → 3rem → 2rem.
- Spacer (padding-top): `-small` 1.5rem(→767:1.25) · `-large` 3(→2.5→2) · `-xlarge` 4(→3.5→2.5) · `-xxlarge` 5(→4.5→3).
- Margin (allseitig): `-large` 3(→2.5→1.5) · `-xxlarge` 5(→4→3).
- Max-Breiten: `.max-width-medium` 35rem · `.max-width-large` 37rem · `.max-width-xlarge` 64rem.

### Global geladene Libraries (unten im Body)
jQuery 3.5.1 · `webflow.js` (IX2) · GSAP 3.15 + SplitText + ScrollTrigger (Website-CDN) · Splitting.js 1.0.6 (Head) · Lenis 0.2.28 (Smooth-Scroll) · GSAP 3.11.4 (CDNJS, doppelt) · Vimeo Player API · Choices.js 11.2.3 · Finsweet: scrolldisable, cmsload, cookie-consent (opt-in). **Für Migration: auf einheitliches GSAP konsolidieren (Task #7).**

---

## 1. Section „Hero" — `section_hero` (`<header>`, Z. 558–651)

**Zweck**: Above-the-fold Einstieg: Headline, Beschreibung, Bewerbungs-CTA + Hochkant-Video im iPhone-Mockup.
**Name-Vorschlag**: `AioHero`.

### Text (wörtlich)
- **H1** (`.heading-style-h1`): `ALL-IN-ONE Social Media Coaching`
- **Absatz** (`.text-size-medium.text-color-tertiary`, mit `<br><br>`-Absätzen):
  > Das Komplettpaket für Selbstständige und Unternehmen - 1:1 oder im Team.
  >
  > Das All-in-One Coaching ist ein ausgeklügeltes Programm aus Videolektionen und persönlicher 1:1 Begleitung.
  >
  > Schritt für Schritt wirst du durch den gesamten Prozess geführt, von den Grundlagen über Strategien für Reichweite, Follower und Kunden bis hin zur professionellen Content-Erstellung.
  >
  > Damit lernst du, deine Social Media Präsenz eigenständig und unabhängig erfolgreich aufzubauen.
- **CTA-Button-Text**: `Für's Coaching bewerben` (öffnet aiocoaching-Modal, s. §19)

### Layout
- `.hero_padding-section`: flex, zentriert, **min-height: 100svh**, padding 7rem T/B (991: 6rem; **767: min-height auto, 8rem T/B**; 479: unten 4rem).
- `.hero_component`: **CSS-Grid 2 Spalten `1fr 1fr`**, column-gap **9rem**, row-gap 4rem, `align-items:center`.
  - 991: `1.5fr 1fr`, gap 3rem.
  - 767: `1.5fr 1fr`, gap 1rem.
  - **479: 1 Spalte** (`1fr`), gap 3rem (Text über Video).
- `.hero_content` (linke Spalte): max-width **29rem** (991: none; 479: 20rem).
  - Reihenfolge: `.margin-bottom.margin-small`(H1) → Absatz → `.margin-top.margin-large`(Button).
- `.hero_video-wrapper` (rechte Spalte): **aspect-ratio 1 / 2.04** (Hochformat), width **18rem**, zentriert, `position:relative`.
  - 991: 16rem · 767: 10rem · 479: 70% (linksbündig).

### Medien & Video (WICHTIG)
- **iPhone-Mockup-Rahmen** (`.hero_iphone-mockup`, `<img>`): `images/Mockup-Handy-Video_1.avif`, `z-index:20`, `pointer-events:none`, absolut — liegt als Rahmen ÜBER dem Video.
- **Vimeo-Embed** (`.hero_video-embed-wrapper`, border-radius 3rem / 767: 2.3rem, `overflow:clip`, absolut inset 0, width `calc(100% - .5rem)`):
  - `<iframe id="video-1" src="https://player.vimeo.com/video/1164742630?muted=1&autoplay=1&autopause=0&controls=0&loop=1&app_id=58479">`, `allow="autoplay; fullscreen; picture-in-picture; clipboard-write"`, absolut 100%×100%, `title="all-in-one-coaching-video"`.
  - **Soll-Verhalten**: startet **automatisch, stummgeschaltet, ohne Controls, in Endlosschleife**, Hochformat, hinter dem iPhone-Rahmen.
  - `.hero_video-bg-overlay` (leer) + `.hero_bg-wrapper::before`: **radialer Gold-Blur hinter dem Handy** — Ellipse 70%×80%, `background: var(--secondary)` (#806429), `blur(6rem)`, rotiert 20°, zentriert, `z-index:-1`.
  - **Consent-Gating (Migration)**: Vimeo lädt erst nach Cookie-Zustimmung. Sichtbares Soll bis Consent: Poster/Standbild im Mockup + Hinweis/Play. Nach Consent: obiges Autoplay-Verhalten. (Kein eigenes Poster-Asset im Markup — Standbild ggf. aus erstem Frame oder eigenes Bild nötig → **Unklarheit U3**.)
- **Video-Buttons** (`.hero_video-btn-wrapper`, unten zentriert, z-index 10, gap .75rem, padding-bottom 1.5rem):
  - `[data-action="toggle-mute"]` mit zwei SVG-Icons (`.mute-icon` / `.unmute-icon` togglen).
  - `[data-action="replay"]` mit Replay-SVG (`.play-icon.is-replay-video`).

### Interaktionen / JS (Vimeo, Z. 2856–2898)
- `new Vimeo.Player(document.getElementById('video-1'))`.
- **toggle-mute**: 1. Klick → `setCurrentTime(0)`, `setMuted(false)`, `play()` (Video startet mit Ton von vorn); danach Klicks toggeln nur mute. `updateIcons()` blendet je nach mute-Status das passende Icon ein.
- **replay**: `setCurrentTime(0)`, `setMuted(false)`, `play()`.
- **Migration**: Vimeo-Player-API muss nach Consent initialisiert werden; Mute/Replay-UI beibehalten.

### Animations-Marker (nur auflisten)
- H1 `data-w-id="56410783-8135-fdb8-edf3-6927d6ccad17"`, Absatz `…ad19`, Button-Group `…ad20` (IX2 / SplitText Einblendung).
- Video-Wrapper `data-w-id="a95ada53-b6a9-e32d-52fa-5276507d2e91"`.

### Sanity-Vorschlag
Felder: `h1` (string), `intro` (portable text / Textarea mit Absätzen), `ctaLabel` (string, default „Für's Coaching bewerben"), `vimeoId` (string, default `1164742630`), `mockupImage` (image), `posterImage` (image, für Consent-State).

---

## 2. Section „Intro / 6 Säulen" — `section_intro-aio` (Z. 652–718)

**Zweck**: Überschrift „ALL-IN-ONE" + horizontale Bild-Galerie der 6 Programmbausteine.
**Name-Vorschlag**: `AioPillarsScroller`.

### Text
- **H2** (`.heading-style-h2`, zentriert): `ALL-IN-ONE`
- 6 Items, jeweils H3 mit Klasse `.home-work_work-title.screenreader-only` (**visuell verborgen**, nur a11y). Reihenfolge + Bild:
  1. `Videolektionen` → `images/Videolektionen---Mockup.avif`
  2. `1:1 Coaching` → `images/Coaching---Mockup.avif`
  3. `Praxis vor Ort` → `images/Praxis---Mockup.avif`
  4. `Workbook` → `images/Workbook---Mockup.avif`
  5. `KI Assistent` → `images/KI-Assistent---Mockup.avif`
  6. `Extras` → `images/Extras---Mockup.avif`

### Layout
- `.intro-aio_section-padding`: padding-top 6rem, bottom 1rem (991: 5rem; 767: 4rem).
- Überschrift in `.container-medium`, `.text-align-center`, in `.overflow-hidden` (für Reveal).
- `.intro-aio_component`: flex-column, **height 28rem** (991: 18rem `overflow:scroll`; 767: 20rem; 479: 16rem), `overflow:hidden`, relativ. Davor `.spacer-xlarge`, danach `.spacer-large`.
- `.intro-aio_scroll-wrapper`: flex row, **width 180%**, max-width 182rem, height 100% (767: `width:auto`, links 5%, gap 5vw, `justify-content:flex-start`).
- `.intro-aio_item`: Karte, **width 30%**, margin 0 1%, `border-radius:1rem`, `overflow:hidden`, `cursor:default` (767: **70vw** breit, kein Margin). Jede Karte hat `.is-2`…`.is-6` Modifier (evtl. Offset/Timing).
- `.home_work_image` füllt Karte (`object-fit:cover`, absolut inset 0).
- Items sind `<a href="#">` — **kein echtes Ziel** (dekorativ; in Migration `href` entfernen oder als reine div).

### Interaktionen / Animation
- Container `data-w-id="5586bace-0568-71aa-20bf-877d7bbfde7a"` (IX2). Item-Titel `…de9c`, `…dea3` markiert. H2 `…de77`.
- **Soll**: langsam horizontal scrollende / seitlich einlaufende Bilderreihe (Wrapper 180% breit, per IX2 x-verschoben). Auf ≤991 wird nativ scrollbar. → **Unklarheit U1**: genaue Auto-Scroll-Bewegung (Loop/Marquee vs. einmalige Einblendung) nicht aus CSS ableitbar; live prüfen. Für Migration als sanfter horizontaler Marquee/Parallax umsetzen.

### Sanity-Vorschlag
Array `pillars[]` mit `{ title, image }` (6 Items, editierbar). Section-Heading `ALL-IN-ONE` als String.

---

## 3.–12. Modul-Blöcke (5×) — Muster „Process-Step + 1:1-Coaching"

Die Seite zeigt **5 Module**, jedes bestehend aus ZWEI aufeinanderfolgenden Sections:
**(A)** `section_process-step` (Modulinhalt) und **(B)** `section_layout38` (1:1-Coaching mit selbstgehostetem Hintergrundvideo). Alle 10 Sections liegen in einem gemeinsamen `<div class="overflow-hidden">` (Z. 719–1617), das auch „Deine Resultate" und „Das Besondere" umschließt.

### Muster A — Modul (`section_process-step`)
**Name-Vorschlag**: `AioModule`.

**Struktur & Layout**:
- `.process-step-section-padding`: **padding-top 11rem** (991: 10rem; 767: 6rem), bottom 0 (767: 1.5rem).
- **Titelzeile** `.process-step_title-wrapper` (flex, `space-between`, margin-bottom 4rem, `overflow:hidden`): links `<h2 class="process-step_title-text hero-value-display-text">Modul</h2>` (margin-top -1.2rem; 767: 0) — Mitte `.process-step_line-wrapper` mit `.process-step_title-line` (1px Linie `#1d1d1d`, animiert von `translateX(-101%)`) — rechts `.process-step_title-number-text hero-value-display-text` = **Modulnummer** (479: font-size 35px).
- **Marquee-Banner** `.process-step_banner` (width 100vw, `overflow:hidden`) → `.process-step_banner-wrapper.text-color-gray500` (Farbe `#d3d3d3`, width 200vw) → `.process-step_marquee` (flex, padding 1rem T/B) mit **17×** `.process-step_banner-text` (`font-size 1.325rem`, `white-space:nowrap`; 767: 1.125rem). Endlos-Laufband (IX2, `data-w-id="a7e0d1c7-017e-6d0e-e373-3c57ae830d0e"` auf allen Bannern identisch).
- **Content** `.process-step_content` (`padding-top .padding-xlarge`, in `.container-large`): flex row, gap 2rem (991: 1rem; **767: column**).
  - **Links** `.process-step_left-content` (max-width 26rem; 767: 100%): `.process-ph-contain > h2.heading-style-h3` (Modultitel) + `.spacer-small` + `<ul class="process-step_list" role="list">` mit `<li class="process-step_list-item">` (Standard-`<ul>`: `padding-left:40px`, **disc-Bullets**, margin-bottom 10px).
  - **Rechts** `.process-step_right-content` (**margin-top 18%** desktop; 991: 24%; 767: 0): `.process-step_image-wrapper` (width 19rem × height 22rem; 991: 17rem; 767: 17×17rem) mit `.process-step_img-bg` (**Gold-Quadrat #806429, 14×14rem, `rotate(12deg)`**) + Bild `.process-step_make-main-image` (absolut zentriert; Modifier `.is-small` = max-width 90%, `.is-ratio-3-2` = aspect 3/2).

**Animations-Marker A**: Section-`data-w-id` (je Modul, s. Tabelle) · Titel-Wrapper-`data-w-id` · `.process-step_list` `data-w-id` mit **Initial-Style `opacity:0; filter:blur(5px); transform:translateY(1rem)`** · rechtes Content-`data-w-id` mit gleichem Initial-Style · Titel-Linie Initial `translateX(-101%)`.

### Muster B — 1:1 Coaching (`section_layout38 text-color-white`)
**Name-Vorschlag**: `AioCoachingVideo`.

**Struktur & Layout**:
- Text-Layer `.layout38_component` (`z-index:1`) in `.padding-global.padding-section-small` › `.container-large` › `.layout38_padding-vertical` (**padding-top 24vh**, bottom 7rem; 991/767: 6rem/4rem) › `.max-width-medium` (35rem; Modul 5: `.max-width-xlarge` 64rem):
  - `<h2 class="heading-style-h2">1:1 Coaching</h2>` + `.spacer-small` + `<p class="text-size-regular">` (Modul-5-Text zusätzlich `.max-width-large` 37rem).
- **Hintergrund** `.layout38_background-image-wrapper` (absolut inset 0, `z-index:0`):
  - `.image-overlay-layer`: **dunkles Overlay** `linear-gradient(#0c0c0ccc, #0c0c0ccc)` (~80% Deckung schwarz), z-index 99980.
  - **Selbstgehostetes Hintergrundvideo** `.layout38_background-image.w-background-video` mit `<video autoplay loop muted playsinline data-object-fit="cover">`, `object-fit:cover`, absolut 100%×100%, `z-index:-1`. Zwei `<source>`: **mp4 zuerst, dann webm** (Reihenfolge so im Export). Poster via `data-poster-url`/`style background-image`.
- **Maskierung**: Zusätzliche `<style>` (Z. 819) setzt auf `.section_layout38` eine **`mask-image` linear-gradient** (oben transparent → ab 45% deckend; 991: ab 30%) — Video/Section **blendet oben weich ein**.

**Interaktion**: reines Autoplay-Loop-Deko-Video, muted, keine Controls, keine Hover-Logik. **Consent-Gating**: selbstgehostet, kein Drittserver → **kein Consent nötig** (im Gegensatz zu Vimeo im Hero).

### Variablen-Tabelle der 5 Module

| Modul | Nr. | Banner-Text (17×) | Modultitel (H3) | Listenpunkte | Bild (process-step) | 1:1-Text (layout38) | Hintergrundvideo (mp4 + webm + poster) | Section data-w-id |
|---|---|---|---|---|---|---|---|---|
| 1 | `01` | Videolektionen | `SOCIAL MEDIA FUNDAMENT` | Werte, Vision & Mindset · Social Media Ziele definieren · Zielgruppenanalyse & Positionierung · Account Einstellungen & Optimierung · Corporate Identity & Branding · Social Media Tools & Apps | `images/Coaching-1_1.avif` (alt „Modul 1: Social Media Fundament") | „Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären, deine Positionierung reflektieren und ein stabiles Fundament schaffen." | `videos/modul1-final_mp4.mp4`, `videos/modul1-final_webm.webm`, poster `videos/modul1-final_poster.0000000.jpg` | `ddbb220e-1725-1c3e-69e3-3d631bf2577e` |
| 2 | `02` | Videolektionen | `SOCIAL MEDIA STRATEGIEN` | Den Algorithmus verstehen lernen · Nischen-Research & Trendanalyse · Aufbau: Content-Funnel Strategie · Erfolgsfaktoren viraler Postings · Authentisches Storytelling · Community Management | `images/Coaching-2_1.avif` (alt „Modul 2: Social Media Strategien") | „…deine Strategie schärfen und ich gezieltes Feedback für die Umsetzung gebe." (Prefix identisch: „Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären, …") | `videos/modul2-final_mp4.mp4` + `_webm.webm` + `_poster.0000000.jpg` | `89cf7653-9d57-f032-d134-11244131875d` |
| 3 | `03` | Videolektionen | `ERFOLGSMESSUNG & OPTIMIERUNG` | Account Insights lesen lernen · KPIs (Kennzahlen) interpretieren · Erfolgsmuster identifizieren · Postings analysieren · Strategie optimieren | `images/Coaching-3_1.avif` (alt „Modul 3: Social Media Erfolgsmessung & Optimierung") | „…deine Ergebnisse analysieren und deine Strategie gezielt optimieren." | `videos/modul3-final_mp4.mp4` + `_webm.webm` + `_poster.0000000.jpg` | `03e9e7bd-2c27-89af-11df-7f4d48c77e4c` |
| 4 | `04` | Videolektionen | `MONETARISIERUNG & FALLSTUDIEN` | Monetarisierungsmöglichkeiten · Aufbau: Monetarisierungs-Funnel · Kundengewinnungsprozess · Die 10K/Monat-Formel · Fallstudien meiner Projekte | `images/Coaching-4_2.avif` (alt „Modul 4: Social Media Monetarisierung & Fallstudien") | „…und dein Angebot sowie die Monetarisierung gezielt feinjustiert werden." | `videos/modul4-final_mp4.mp4` + `_webm.webm` + `_poster.0000000.jpg` | `7a2a631c-4331-00da-dd6c-4fefa2b7c005` (hier `<div>` statt `<section>`) |
| 5 | `05` | **Praxis vor Ort** | `CONTENT PRODUKTION` | Optimale Handy-Einstellungen · Körperhaltung für Content Produktion · Gemeinsame Content Produktion · Videoschnitt & Bearbeitung · Post-Beschreibung verfassen · Finale Einstellungen fürs Posting | `images/Coaching-4_1.avif` (`.is-small.is-ratio-3-2`, alt leer) | **abweichend**: „Dieses Modul ist ein praktisches 1:1 Coaching vor Ort (ca. 4 Stunden), in dem ich dir zeige, wie du hochwertigen Content einfach mit dem Handy produzierst und bearbeitest." (max-width-xlarge/large) | `videos/modul5-final_mp4.mp4` + `_webm.webm` + `_poster.0000000.jpg` | `a66eda93-02c8-de76-ae12-d2b565975748` |

> Hinweis: Modul 4 ist im Export als `<div>` (nicht `<section>`) ausgezeichnet und hat kein `data-w-id` auf der Liste (Modul 4 & 5 Listen ohne Blur-Init-Style) — in Migration einheitlich als Section + einheitliche Animation.

### Sanity-Vorschlag (Module)
Array `modules[]`: `{ number (string), bannerLabel (string), title (string), bullets (string[]), image (image + alt), coachingHeading (default „1:1 Coaching"), coachingText (text), video: { mp4 (file), webm (file), poster (image) } }`. „1:1 Coaching" Heading + Text pro Modul editierbar; Video als selbstgehostete Assets.

---

## 13. Section „Bonusse" — `section_layout395` (Z. 1365–1445)

**Zweck**: 3 Bonus-Karten + CTA. **Name-Vorschlag**: `AioBonuses`.

### Text
- **H2** (zentriert, `.max-width-large.align-center`): `Deine Bonusse`
- `.spacer-small`, Absatz `.text-size-regular`: `Wertvolle Ressourcen unterstützen dich bei der Umsetzung der jeweiligen Module`
- 3 Karten (`.layout395_card`), je `.tag.is-text.text-color-brand-secondary` (Gold) + H3 (`.heading-style-h4`) + Absatz:
  1. Tag `Bonus 1` · **Workbook** · „Ein strukturiertes Workbook mit Aufgaben und Leitfragen, um alle Inhalte direkt auf dein eigenes Projekt anzuwenden." · Bild `images/Workbook---BONUS.avif`
  2. Tag `Bonus 2` · **KI-Assistent** · „Dein persönlicher KI-Assistent, trainiert auf meiner Wissensbasis, der dir bei Fragen und Aufgaben jederzeit weiterhilft." · Bild `images/KI-Asisstent---BONUS.avif`
  3. Tag `Bonus 3` · **Weitere Extras** · „Zusätzliche Vorlagen, Guides und Ressourcen, die dich bei Content, Struktur und Umsetzung im Alltag unterstützen." · Bild `images/Extras-2---BONUS.avif`
- CTA-Button (`.button-group.is-center`): `Für's Coaching bewerben` → aiocoaching-Modal.

### Layout
- `.padding-global > .container-large > .padding-section-large`.
- `.layout395_grid-list` (row-gap 2rem) → `.layout395_row`: **Grid 3 Spalten `1fr 1fr 1fr`**, gap 2rem (**991: 1 Spalte**; 767: 1 Spalte, gap 1.5rem). Davor `.spacer-xxlarge`, dahinter `.spacer-large`.
- `.layout395_card`: `border 1px #1d1d1d`, `border-radius 1rem`, flex-column, `overflow:hidden`.
  - `.layout395_card-image-wrapper` (volle Breite) → Bild `.layout395_card-image` **aspect-ratio 1**, `object-fit:cover`.
  - `.layout395_card-content`: padding 2rem (767: 1.5rem), flex-column `space-between`. Innen `.layout395_card-content-top` mit tag → `.spacer-xxsmall` → H3 → `.spacer-xsmall` → Absatz.
- `.tag.is-text`: transparent, inline-block, font-size .875rem, weight 600, Gold.

### Sanity-Vorschlag
Section-Heading + Intro; Array `bonuses[]`: `{ tag, title, text, image }` (3 Items). CTA-Label.

---

## 14. Section „Deine Resultate" — `section_process-step` Variante (Z. 1446–1543)

**Zweck**: Ergebnis-Versprechen als Liste (process-step-Layout ohne Modulnummer/Marquee-Loop).
**Name-Vorschlag**: `AioResults`.

### Text
- Titelzeile: `<h2 class="process-step_title-text hero-value-display-text">Deine Resultate</h2>` + Linie + Marquee-Banner (letzter Banner-Text `.text-color-brand-secondary` = **Gold** „Resultate"). Banner-Wörter: „Resultate" (mehrfach).
- **H3** (`.heading-style-h3`): `Nach dem Coaching-Programm wirst du...`
- `<ul class="process-step_list is-no-wrap-above-mobile-landscape">` (`white-space:nowrap` ab Tablet, 767: normal):
  1. Die Social-Media-Grundlagen sicher beherrschen.
  2. Deine Zielgruppe kennen und gezielt ansprechen.
  3. Strategien für Reichweite, Follower und Kunden umsetzen.
  4. Daten richtig analysieren und zur Optimierung nutzen.
  5. Wissen, wie man über Social Media Geld verdient.
  6. Hochwertigen, leistungsstarken Content erstellen.
- **Bild** rechts `.process-step_make-main-image.is-small.is-ratio-3-2`: `images/Gestresst-und-unglücklich-2_1.avif` (srcset 500w/1280w, `sizes=100vw`, alt leer) auf Gold-Quadrat-BG.

### Layout
- `.padding-section-medium` außen (statt process-step-section-padding). Sonst identisch zum Modul-Muster A (Titelzeile, Banner, `.process-step_content` 2-spaltig → 767 column).

### Animations-Marker
Section `data-w-id="da2e447b-9fa2-ae7a-adee-c29dd0bd68c0"`, Titel-Wrapper `…68c4`, Liste `9243ebd4-f1fa-1033-59a9-b2f7bdbd3dd9` (Init blur/opacity 0), Bild-Content `…692e`.

### Sanity-Vorschlag
`resultsTitle` (default „Deine Resultate"), `resultsHeading`, `resultsBullets[]`, `resultsImage`.

---

## 15. Section „Das Besondere" — `section_home-list` (Z. 1544–1616)

**Zweck**: 6 USPs des Programms als 2-spaltige Liste mit Trennlinien. **Name-Vorschlag**: `AioUSPList`.

### Text
- **H2** (zentriert, `.max-width-large.align-center`, in `.margin-bottom.margin-xxlarge`): `Das Besondere an diesem Coaching-Programm`
- 6 `.home-list_item`, jedes: Gold-Punkt-SVG (`circle fill #686868`, 6×6px) + `.home-list_text` (Fett-Start via `<strong>`):
  1. **Ein Jahr Zugang** zum Online-Portal mit allen Modulen, über 40 Videolektionen und Ressourcen in deinem eigenen Lerntempo.
  2. **Strukturiertes Schritt-für-Schritt Programm** vom Fundament bis zur Monetarisierung deiner Social-Media-Präsenz.
  3. **Persönliche 1:1 Coachings** nach jedem Modul ergänzt durch eine Praxis-Session vor Ort für maximale individuelle Betreuung.
  4. **Integrierter KI-Assistent**, trainiert auf meiner Wissensbasis, der dir 24/7 bei Fragen und Workbook-Aufgaben zur Verfügung steht.
  5. **Exklusives Insider-Wissen** aus über acht Jahren praktischer Erfahrung im Aufbau erfolgreicher Social Media Accounts.
  6. **Stetige Updates und neue Inhalte** erweitern das Online-Portal kontinuierlich und sind während deines Zugangs vollständig inklusive.

### Layout
- `.padding-global > .container-large > .padding-section-large`.
- `.home-list_grid`: **Grid 2 Spalten `1fr 1fr`**, column-gap **6rem**, row-gap 0 (767: col-gap 1.5rem; **479: 1 Spalte**).
- `.home-list_item`: flex-column, relativ; `.home-list_text-wrapper` (flex row, gap 1rem, margin 2.5rem T/B; 479: 1.5rem) mit Icon (`.home-list_icon-embed` 1rem, margin-top .75rem) + Text.
- `.home-list_text`: **font-size 1.5rem** (479: 1.375rem), Farbe `#d3d3d3`. `<strong>` innerhalb = Hervorhebung.
- `.home-line`: **1px Trennlinie #1d1d1d** am unteren Rand jedes Items (animiert per IX2).

### Animations-Marker
H2 `data-w-id="1b7309c1-ff8f-fe86-35e0-8a9b62132efd"`; jede `.home-line` eigenes `data-w-id` (…2f07, …2f0f, …2f17, …2f1f, …2f27, …2f2f) — Linien fahren beim Scrollen ein.

### Sanity-Vorschlag
`uspHeading`, `usps[]`: `{ textRich }` mit Fett-Markup (portable text, damit `<strong>` editierbar bleibt).

---

## 16. Section „Reviews / Testimonials" — `section_reviews` (Z. 1618–1776, CMS)

**Zweck**: Kundenstimmen aus CMS, 5-Sterne, „Mehr laden". **Name-Vorschlag**: `AioTestimonials`.

### Text / Struktur
- **Banner-Heading** (2 Zeilen, `.banner-heading-wrapper`): oben `.banner-heading-top` **weiß**, unten `.banner-heading-bottom` in `#1d1d1d` (dunkel, versetzt rechtsbündig) — beide Text: `Nette Worte von aktuellen Kunden`. Font-size **7.5rem** (991: 4rem; 479: 3rem), weight 300, line-height .8, `white-space:nowrap`.
- **CMS-Collection** „Testimonials" (44 Items, `w-dyn-list`, Finsweet cmsload `load-under`, stagger 250):
  - je Item `.reviews_content` (border 1px #1d1d1d, radius 1rem, padding 2.5rem/767:1.5rem): **5× fixes Stern-SVG** (Gold `.text-color-brand-secondary`) → `.reviews_text` (Testimonial-Text, `#d3d3d3`, 1.125rem/767:1rem) → `.reviews_client`: rundes Autor-Bild (`.reviews_customer-image` 3rem, `border-radius:100%`) + Name (`.text-weight-semibold`) + Rolle (`.text-size-small.text-color-secondary`).
  - **Rating ist statisch 5 Sterne** (nicht aus CMS).
- **Pagination** „`Mehr Testimonials laden`" (`.reviews_load-more`, `data-w-id="f6082040-…3ebd"`). Leerzustand: „No items found."

### CMS-Bezug (`Testimonials`-Collection, 44 Items)
Felder: `Name / Autor`, `Testimonial` (Text), `Tätigkeit / Rolle / Beruf`, `Autor Bild`, `Reihenfolge auf der Webseite`. Sortierung nach „Reihenfolge". (Gleiche Collection wie Home/Über-mich → global.)

### Interaktion (Read-More, Z. 1655–1690)
Inline-Script kürzt `.reviews_text` **> 216 Zeichen** auf 216 + „…" + `weiterlesen`-Link (`.read-more`, unterstrichen; Hover weiß) der Resttext einblendet. Läuft bei Load und 500ms nach „Mehr laden". `.reviews_component` hat `hyphens:auto` (de).

### Layout
- `.padding-section-large`. `.reviews_component`/`.reviews_collection-list`: **Grid 3 Spalten** (min 15rem) → **991: 2 Spalten** → 767: 1 Spalte, gap 2rem.

### Sanity-Vorschlag
Testimonials als eigene Collection/Dokumenttyp `testimonial` `{ author, role, text, image, order }`. Section-Heading „Nette Worte…" + Anzahl initial sichtbar (z. B. 9) + „Mehr laden". Rating fix 5 (kein Feld). **Empfehlung**: 5-Sterne-Optik beibehalten, aber ggf. `rating` optional.

---

## 17. Section „Final CTA" — `section_final-cta` (Z. 1777–1811)

**Zweck**: Abschluss-Aufruf zur Bewerbung. **Name-Vorschlag**: `AioFinalCta`.

### Text (in `.max-width-large`)
- **H2** (Init blur/opacity 0, `data-w-id="c4c43092-f142-d989-121f-7ff2ef53ba54"`): `Investiere in dich und deine Vision und bewirb dich jetzt (limitierte Plätze)`
- `.spacer-small`, Absatz `.text-size-regular.text-color-tertiary`: „Hinweis: Solltest du während oder nach dem ALL-IN-ONE Coaching Programm zusätzlichen Bedarf an individueller Begleitung haben, können weitere 1:1 Coachings jederzeit flexibel hinzugebucht werden."
- `.spacer-medium`, Button `Für's Coaching bewerben` → aiocoaching-Modal.

### Layout
`.padding-global > .container-large > .padding-section-large > .max-width-large`. Button in `.button-group` (linksbündig).

### Sanity-Vorschlag
`finalCtaHeading`, `finalCtaNote`, `finalCtaLabel`.

---

## 18. Section „FAQ" — `section_faq` (Z. 2098–2260)

**Zweck**: 8 Fragen als Akkordeon. **Name-Vorschlag**: `AioFaq`.

### Text
- **H2** (`.heading-style-h2`, in `.max-width-large`, `data-w-id="5186fb50-…92c9"`): `FAQs`
- 8 `.faq_item` (alle mit identischem `data-w-id="cf877d6e-6126-36f8-6590-62a62c621a27"` → IX2-Accordion). Fragen + Antworten (Antworten enthalten `<br>`-Zeilenumbrüche; hier als Absätze):

1. **Für wen ist das ALL-IN-ONE Coaching Programm geeignet?**
   Für alle, die Social Media ganzheitlich verstehen und eigenständig erfolgreich aufbauen möchten. / Geeignet für Selbstständige, Unternehmen, Social Media Manager, Influencer und Content Creator sowie für alle, die es noch werden möchten – unabhängig von Branche oder Themengebiet. / Das Programm ist sowohl für Anfänger als auch für Fortgeschrittene geeignet, da die Inhalte Modul für Modul aufeinander aufbauen und der Schwierigkeitsgrad Schritt für Schritt steigt.

2. **Ist das ALL-IN-ONE Coaching ein Gruppenprogramm oder komplett 1:1?**
   Das ALL-IN-ONE Coaching ist kein Gruppenprogramm, sondern eine exklusive und tiefgehende 1:1 Begleitung. Du erhältst meine volle Aufmerksamkeit und individuelles Feedback statt standardisierter Gruppen-Calls. Genau das ist einer der größten Vorteile gegenüber klassischen Programmen. / Unternehmen können das Programm optional gemeinsam im Team absolvieren.

3. **Wie lange habe ich Zugang zum ALL-IN-ONE Coaching Programm?**
   Du erhältst ein Jahr Zugang zum gesamten Programm inklusive aller Ressourcen wie dem KI-Assistenten. / Alle Videolektionen und Workbook-Aufgaben kannst du somit in deinem eigenen Tempo durcharbeiten und die 1:1 Coachings flexibel nach jedem Modul vereinbaren. / Während dieses Zeitraums stehen dir zudem alle Updates und neu hinzukommenden Inhalte ohne zusätzliche Kosten zur Verfügung.

4. **Kann ich während oder nach dem Programm weitere 1:1 Coachings dazubuchen?**
   Ja. Im ALL-IN-ONE Coaching Programm sind insgesamt 4 × 2 Stunden 1:1 Videocoachings sowie 1 × Praxis-Session vor Ort (ca. 4 Stunden) bereits inklusive. / Bei Bedarf können jederzeit weitere 1:1 Coachings während oder nach dem Programm flexibel hinzugebucht werden. Diese zusätzlichen Sessions werden separat berechnet.

5. **Behandelst du im Programm nur Instagram oder auch andere Plattformen?**
   Der Fokus liegt klar auf Instagram, da hier die besten Möglichkeiten für organische Reichweite und nachhaltige Monetarisierung bestehen. / Die vermittelten Strategien und Methoden lassen sich jedoch problemlos auch auf Plattformen wie Facebook, TikTok oder YouTube Shorts übertragen.

6. **Behandelst du im Programm auch bezahlte Werbeanzeigen?**
   Der Schwerpunkt liegt auf dem organischen Social Media Aufbau, da dies ganz klar mein Expertenbereich ist. / Bezahlte Werbeanzeigen werden ergänzend angesprochen, stehen jedoch nicht im Mittelpunkt des Programms.

7. **Was kostet das ALL-IN-ONE Coaching Programm?**
   Das ALL-IN-ONE Coaching ist ein intensiv begleitetes Premium-Programm. / Die genaue Investition besprechen wir transparent im persönlichen Erstgespräch nach deiner Bewerbung, da wir zunächst prüfen, ob das Programm optimal zu dir oder deinem Unternehmen passt.

8. **Wie läuft der Bewerbungsprozess ab?**
   Du bewirbst dich über das Formular auf der Website. / Ich prüfe deine Bewerbung persönlich und lade dich bei Passung zu einem kostenlosen Erstgespräch per Videocall ein. / In diesem Gespräch finden wir gemeinsam heraus, ob das ALL-IN-ONE Coaching Programm optimal zu dir oder deinem Unternehmen passt und ab wann freie Plätze verfügbar sind.

### Layout / Optik
- `.padding-global > .container-large > .padding-section-large`. H2 in `.margin-bottom.margin-large`.
- `.faq_item`: flex-column, `overflow:hidden`, relativ.
  - `.faq_top` (`cursor:pointer`, flex `space-between`, **min-height 6.5rem**, 991: padding .5rem): Frage `.faq_question-text` (**1.75rem**, Farbe `#d3d3d3`, letter-spacing -.025em; 991/767: 1.5rem; 479: 1.4rem) + `.faq_plus-icon-wrapper` (**weißes Quadrat 3.5rem, radius .5rem**; 767: 2.5rem) mit horizontaler + vertikaler Linie (`#424242`) = Plus, das beim Öffnen zum Minus rotiert.
  - `.home-line` (1px Trennlinie) zwischen top und bottom.
  - `.faq_bottom` (BG `#1d1d1d`) mit `.faq_answer-wrapper` (max-width 53rem, padding **3.75rem 6rem**; 767: 3rem; 479: 1.75rem; Farbe `#e5e5e5`), Antworttext `.text-size-medium`. `.faq_whipe` = Wisch-Overlay der Animation.

### Interaktion
Standard Webflow-Accordion (IX2 über `data-w-id`): Klick auf `.faq_top` toggelt `.faq_bottom` Höhe (0 ↔ auto) + Plus↔Minus (vertikale Linie skaliert/rotiert). **Migration**: als zugängliches `<details>`/Button-Accordion mit GSAP-Höhenanimation nachbauen; nur eines offen (Standard: alle zu).

### Sanity-Vorschlag
`faqs[]`: `{ question, answerRich }` (answer als portable text wegen Zeilenumbrüchen). Section-Heading „FAQs".

---

## 19. Seitenspezifisches Formular „aiocoaching-Anfrage" (Modal) — MEINE ZUSTÄNDIGKEIT

**DOM**: `<div class="aiocoaching-modal">` (Z. 1812–1877). Formular `id="wf-form-aiocoaching-Anfrage" name="wf-form-aiocoaching-Anfrage" data-name="aiocoaching-Anfrage" method="get" class="aiocoaching-modal-form"`.
**Name-Vorschlag**: `AioApplyModal`.

### WICHTIG — Abgrenzung
Dieses Formular ist die **einfache Bewerbung** (KEINE Choices.js-Selects, KEINE bedingte Radio-Logik). Alle CTA-Buttons dieser Seite (`btn-action="aiocoaching-modal-open"`, 4×: Hero, Bonusse, Final-CTA + 1 im Header-Bereich) öffnen DIESES Modal. Die komplexe Variante (Radios/Choices.js/CMS-Services) gehört zum **globalen** `cta-modal` — siehe §20.

### Öffnungs-Trigger
- Buttons mit Attribut `btn-action="aiocoaching-modal-open"`.
- Öffnen-JS (Z. 2802–2853): Klick → `modal.style.display='block'`, nach 10ms `opacity='1'` (Fade-in 0.3s).
- **Schließen**: (a) ESC-Taste, (b) Klick auf `.aiocoaching-modal-scroll-container` (Backdrop), (c) `.aiocoaching-modal-close`-Button → `opacity='0'`, nach 500ms `display='none'`.
- `data-lenis-prevent` + Finsweet `fs-scrolldisable-element="when-visible"` (Body-Scroll-Lock während offen).

### Felder (in Reihenfolge)
| # | Label | name | type | id | Pflicht | Placeholder |
|---|---|---|---|---|---|---|
| 1 | Name | `Name` | text | `Name-2` | **ja** | „Max Mustermann" |
| 2 | E-Mail-Adresse | `E-Mail-Adresse` | email | `E-Mail-Adresse-3` | **ja** | „max@mustermann.com" |
| 3 | Berufsbezeichnung oder Unternehmen | `Berufsbezeichnung-Oder-Unternehmen` | text | `Berufsbezeichnung-Oder-Unternehmen-3` | nein | „CEO bei Muster GmbH" |
| 4 | Social Media Link (falls vorhanden) | `Social-Media-Link-Falls-Vorhanden` | text | `Social-Media-Link-Falls-Vorhanden-3` | nein | „@Instagram…" |
| 5 | Weitere Informationen | `Weitere-Infos` | textarea (maxlength 5000, min-height 11.25rem) | `Weitere-Infos-3` | nein | „Erzähl mir gerne mehr von dir, deinem Projekt bzw. Unternehmen…" |
| 6 | GDPR-Checkbox | `GDPR` | checkbox | `GDPR` | **ja** | Label: „Ich akzeptiere die " + Link **Datenschutzerklärung** (`datenschutz.html`) |

- Alle Text-Inputs: `maxlength=256`, Klasse `.modal-input` (BG `#1d1d1d`, border 1px `#808389`, radius .5rem, min-height 2.75rem, padding .5rem .75rem, Placeholder-Farbe `#737373`).
- **Submit**: `<input type="submit" value="Senden" data-wait="Bitte warten...">` in Gold-Glow-Button (`.button-submit`, `.modal-button-wrapper` rechtsbündig, margin-top 2rem).

### Kopf / Erfolg / Fehler
- **Heading** (`.modal-heading`, 2.5rem/991:1.75/767:1.5, weight 700): `Bewerbung ALL-IN-ONE Coaching`
- **Erfolg** (`.w-form-done` `.aiocoaching-modal-success-message`): H4 „**Vielen Dank!**" + `.aiocoaching-success-text`: „Ich melde mich in Kürze bei dir. Bitte überprüfe auch deinen Spam-Ordner, falls meine Nachricht dort gelandet ist."
- **Fehler** (`.w-form-fail` `.modal-error-message`, BG `#fef3f2`, radius .5rem): `.modal-error-text` (Farbe `#b42318`): „Ups! Etwas ist schief gelaufen - bitte versuche es nochmal."

### Modal-Layout
- `.aiocoaching-modal`: fixed, inset 0, `z-index 610`, `backdrop-filter: blur(1.5rem)`, opacity 0→1 transition .3s, `display:none` default.
- `.aiocoaching-modal-overlay`: `#12131666` (halbtransparent), z-index 510.
- `.aiocoaching-modal-scroll-container`: fixed, flex-column, `padding-top 10vh`, padding 5% seitl., `overflow:auto`, z-index 560.
- `.aiocoaching-modal-container`: max-width **35rem**, zentriert.
- `.aiocoaching-modal-content-wrapper`: BG `#0c0c0c`, `border-radius 1.5rem`, padding **12% 10%** (479: 15% 5% 20%), `overflow:clip`.
- `.aiocoaching-modal-close`: transparent, absolut oben-rechts (margin 1.5rem; 767:1rem; 479:.75rem), `transform: rotate(45deg)` (Plus→X), 1.5rem Icon.
- Felder: `.modal-field` margin-top 1.5rem; Label `.modal-field-label` margin-bottom .5rem, weight 400.

### Interaktion / Validierung (Migration)
- Original nutzt Webflow-Formsystem (`method=get`, Webflow-Submit). **Migration → Task #8: Form.Taxi-Platzhalter.** Success/Fail-States (`.w-form-done`/`.w-form-fail`) müssen erhalten bleiben; deutsche Fehlermeldungen wie oben.
- GDPR-Pflicht + native `required` auf Name/E-Mail. (Die eigene sichtbare-Fehlermeldungs-Logik `renderFieldErrors` gilt NUR für `wf-form-Anfrage`/cta-modal, s. §20 — für aiocoaching-Form gibt es sie im Export NICHT; bei Migration einheitliche Validierungs-UX für beide sinnvoll.)

### Sanity-Vorschlag
Meist statisch. Editierbar: `modalHeading`, `submitLabel`, `successHeading`, `successText`, `errorText`, `privacyUrl`, `formEndpoint` (Form.Taxi). Feldlabels/Placeholders optional als Settings.

---

## 20. Globales CTA-Modal `cta-modal` (im DOM vorhanden, NICHT von mir) — nur Kontext

Die Seite enthält **zusätzlich** `<div class="cta-modal">` (Z. 1878–2097) mit Formular `id="wf-form-Anfrage"` `class="cta-modal-form"` — das **komplexe** Formular mit:
- Radios `Service-Typ` (ALL-IN-ONE Coaching / Spezifische Coachings) → bedingte Felder,
- Radios `Unternehmens-Typ` (Personal Brand / Startup),
- 2 Choices.js-Multiselects (`#select-multiple-personal-brand`, `#select-multiple-unternehmen`) gefüllt aus **CMS „Services"** (kategorisiert: „Personal Brands & Selbständige" vs. „Startups & Unternehmen"),
- Inline-JS (Z. 2404–2730): Choices.js-Init + bedingte Anzeige + eigene Fehlermeldungen + `Coaching-Bereiche` Hidden-Field-Sync.
- Trigger `btn-action="cta-modal-open"` (auf DIESER Seite in Footer-Bereich Z. 2336/2392) + `?openModal=true` URL-Param.
- Heading „Coaching anfragen"; Success/Fail-Texte analog.

→ **Gehört dem globalen Agent** (`spec-global`). Hier nur erwähnt, damit klar ist: choices.js/bedingte Logik ist NICHT Teil des aiocoaching-Formulars. Bei Migration entscheiden, ob `cta-modal` auf der AIO-Seite überhaupt gebraucht wird (Trigger sitzen im globalen Footer/Chrome).

---

## 21. CMS-Bezüge (Zusammenfassung)
- **Testimonials** (44 Items) → §16 Reviews. Felder: Autor, Testimonial, Rolle/Beruf, Autor-Bild, Reihenfolge. (Global über mehrere Seiten genutzt.)
- **Services** (19 Items, Kat. „Personal Brands & Selbständige" / „Startups & Unternehmen") → nur im **globalen cta-modal** (§20), NICHT im aiocoaching-Formular.

## 22. Offene Unklarheiten
- **U1 (intro-aio)**: Genaue Auto-Scroll-Mechanik der 6-Bild-Reihe (Endlos-Marquee vs. einmaliges Einlaufen, Geschwindigkeit/Richtung) ist aus CSS nicht ableitbar — Live-Verhalten prüfen und als sanften horizontalen Loop nachbauen.
- **U2 (Marquee-Banner)**: Laufrichtung/Tempo der 17×-Wort-Banner in Modulen (IX2) — Live prüfen; als kontinuierliches Laufband umsetzen.
- **U3 (Hero-Vimeo-Poster)**: Kein dediziertes Poster-Asset im Markup. Für Consent-Placeholder eigenes Standbild nötig (z. B. erster Frame). Klären, welches Bild.
- **U4 (Video-Doppeldateien)**: In `videos/` gibt es je Modul `modulX-final.mp4` UND `modulX-final_mp4.mp4` (+ `_webm.webm`). Markup referenziert die `_mp4.mp4`/`_webm.webm`-Variante. Die `modulX-final.mp4` ohne Suffix sind vermutlich Originale/Duplikate → für Migration nur die referenzierten nutzen.
- **U5 (Validierungs-UX)**: aiocoaching-Formular hat im Export KEINE eigene Inline-Fehlermeldungs-Logik (nur cta-modal). Für konsistente UX empfiehlt sich, dieselbe deutsche Fehlermeldungs-Logik auch aufs aiocoaching-Formular anzuwenden.
