# Spec — Über mich (`ueber-mich.html` → Astro)

Quelle: `tristan-webflow-code/ueber-mich.html`, CSS `css/tristan93.webflow.css` (+ `webflow.css`, `normalize.css`).
Live: https://tristanweithaler.com/ueber-mich
Breakpoints: Basis = Desktop; danach `max-width: 991px` (Tablet), `767px` (Mobile Landscape), `479px` (Mobile Portrait).

Scope hier: **nur der Hauptinhalt** in `<main class="main-wrapper">`. Header/Navbar, Menü-Overlay, Cookie-Banner, CTA-Modal (`.cta-modal`) und Footer sind ausgeklammert (anderer Agent). Der Glow-/Gradient-Button (`.button-glow` / `.gradient-btn`) ist geteiltes Chrome — hier nur pro Instanz die Beschriftung + Ziel-URL notiert.

## Seiten-Meta
- `<title>`: `Tristan Weithaler - Über mich`
- `meta description` / `og:description` / `twitter:description`: „Erfahre mehr über mich, meinen Werdegang und meine Projekte – und wie ich dich dabei unterstütze, deine individuellen Ziele über Social Media zu erreichen."
- `og:title` / `twitter:title`: `Tristan Weithaler - Über mich`
- `og:image` / `twitter:image`: Titelbild (Hero) → CDN `…/689c5e7d0c4893393c624bf2_Titelbild-40.jpg`. In Astro lokales Asset `Titelbild-40_1.avif` als OG-Bild (bzw. JPG-Variante) verwenden.
- `twitter:card`: `summary_large_image`
- `canonical`: `https://tristanweithaler.com/ueber-mich`
- `lang="de"`

## Globale Tokens (nur die auf dieser Seite genutzten)
| Token | Wert |
|---|---|
| Hintergrund Seite (`--background-color--background-primary`) | `#0c0c0c` |
| Text primär (`--text-color--text-primary`, whitesmoke) | `#f5f5f5` |
| Text tertiär (`--text-color--text-tertiary`) | `#d3d3d3` |
| Text sekundär (`--text-color--text-secondary`) | `#737373` |
| Weiß (`--white`) | `#ffffff` |
| Gold (`--base-color-brand--secondary`) | `#806429` |
| Orange-1 (Interest-Icons) | `#b39478` |
| Bild-Overlay Timeline | `rgba(0,0,0,0.7)` (`#000000b3`) |

- Body: `font-family: Poppins, Tahoma, sans-serif; font-weight: 300; font-size: 1rem; line-height: 1.55;` Farbe `#f5f5f5` auf `#0c0c0c`.
- Basis-Typo-Klassen (Desktop):
  - `heading-style-h1`: 4.65rem / 300 / lh 1.1 / ls -0.03em (≤767px → 3rem)
  - `h2` (Element, alle Section-Überschriften): 2.875rem / 400 / lh 1.2 / ls -0.02em — **responsive: ≤767px → 2.25rem (ls 0), ≤479px → 2rem**
  - `heading-style-h5`: 1.5rem / 700 / lh 1.3 / ls 0.01em (≤767px → 1.325rem)
  - `text-size-medium`: 1.125rem — `text-size-small`: 0.875rem — `text-size-regular`: 1rem
- Layout-Container (durchgehend):
  - `padding-global`: `padding-left/right: 5%`
  - `container-large`: `width:100%; max-width:80rem; margin-inline:auto`
  - Spacer-Divs (leere `<div>`, nur `padding-top`): `spacer-xsmall`=1rem, `spacer-xlarge`=4rem, `spacer-xxlarge`=5rem
  - Margin-Wrapper (Webflow-Pattern: äußeres `div.margin-bottom.margin-X` mit `margin-*: 0` außer der genannten Seite): `margin-xsmall`=.5rem, `margin-small`=1rem, `margin-medium`=2rem, `margin-large`=3rem, `margin-xxlarge`=5rem. `padding-section-medium`=5rem T/B, `padding-section-large`=7rem T/B, `padding-huge`=6rem (hier via `padding-top`-Modifier nur oben).

Empfehlung Astro: diese Utility-Namen NICHT 1:1 kopieren; als semantische Section-Komponenten mit denselben rem-Werten nachbauen. Werte unten sind die maßgeblichen.

---

## Section 1 — Hero („Hallo! Ich bin Tristan.")
**Element:** `<header class="section_hero">` · **Astro-Name-Vorschlag:** `AboutHero`
**Zweck:** Persönliche Vorstellung + Foto + Social-Links.

### Text (wörtlich)
- H1: `Hallo! Ich bin Tristan.`
- Absatz: `Ich komme aus einem kleinen Dorf in Südtirol und habe vor einigen Jahren meinen sicheren Bürojob gegen kreative Freiheit eingetauscht – mit dem Ziel, aus dem Hamsterrad auszubrechen, meine eigenen Visionen zu verwirklichen und mir ein freieres Leben aufzubauen. Ohne Studienabschluss, aber mit viel Hands-on-Mentalität und Praxiserfahrung habe ich in den letzten 8 Jahren mehrere erfolgreiche Social-Media-Accounts aufgebaut und mich zu Südtirols erstem Social Media Business Coach entwickelt.`
- 2 Social-Links (nur Icons, kein Text): Instagram `https://www.instagram.com/tristan.weithaler/`, LinkedIn `https://www.linkedin.com/in/tristan-weithaler-1b9972171/` (beide `target="_blank"`).

### Layout / Struktur
```
header.section_hero
 └ .padding-global (5%)
   └ .container-large (max 80rem)
     └ .hero_padding-section        flex, center/center, min-height:100svh, padding 7rem T/B
       └ grid .hero_component       2 Spalten 1fr 1fr, col-gap 9rem, row-gap 4rem, align-items:center
         ├ .hero_content            max-width:29rem
         │  ├ .margin-bottom.margin-small (mb 1rem) → H1.heading-style-h1
         │  ├ p.text-size-medium.text-color-tertiary
         │  └ .margin-top.margin-large (mt 3rem)
         │     └ .hero_button-group  flex, gap 1.5rem  → 2× a.hero_social-link (SVG-Icons)
         └ .hero_image-wrapper       padding-left:3vw; padding-right:5vw; relative
            ├ img.hero_image         aspect-ratio 2/3; width/height 100%; object-fit:cover; overflow:clip
            └ .home-hero_content-whipe  absolute inset 0; bg #0c0c0c  (Wipe-/Reveal-Overlay)
```
`hero_social-link`: hat keine eigene CSS-Regel im Stylesheet (nur Inline-Block-Link); Icons `icon-embed-custom1` (Instagram) und `icon-embed-xsmall` (LinkedIn), `currentColor`. Empfehlung: quadratische Klick-Fläche ~1.5–2rem, Farbe erbt Text.

### Typografie je Element
- H1: 4.65rem / 300 / lh 1.1 / ls -0.03em / `#f5f5f5`
- Absatz: 1.125rem / 300 / lh 1.55 / `#d3d3d3`

### Bild
- Datei: `images/Titelbild-40_1.avif` · `loading="eager"` · alt = **leer** (Sanity: alt ergänzen, z. B. „Tristan Weithaler Portrait")
- srcset im Export: 500w/800w (beide `Titelbild-40_1Titelbild-40.avif`) + 1080w (`Titelbild-40_1.avif`); `sizes="(max-width: 1080px) 100vw, 1080px"`. In Astro: `<Image>` mit dem `.avif` als Quelle, Seitenverhältnis 2:3 erzwingen.
- object-fit: cover; radius: 0.

### Responsive
- **≤991px** `hero_component`: cols `1.5fr 1fr`, gap 3rem, `min-height:auto`; `hero_content` max-width:none; `hero_padding-section` padding 6rem T/B.
- **≤767px** cols `1.5fr 1fr`, gap 1rem; `hero_padding-section` padding 8rem T/B, min-height auto; H1 → 3rem; `text-size-medium` → 1rem.
- **≤479px** cols `1fr` (Bild unter Text), gap 3rem; `hero_content` max-width 20rem; `hero_padding-section` padding-bottom 4rem; `hero_button-group` width 100%.

### Farben/Flächen
- Section-Hintergrund: Seiten-Schwarz `#0c0c0c` (kein eigener BG). Keine Verläufe.

### Animations-Marker (nur auflisten)
- H1: `data-w-id="56410783-8135-fdb8-edf3-6927d6ccad17"`
- Absatz: `data-w-id="56410783-8135-fdb8-edf3-6927d6ccad19"`
- Bild-Reveal-Element: `.home-hero_content-whipe` (Overlay wird per Webflow-IX weggewischt).
- Kein Inline-`opacity`/`transform` auf diesen Elementen (Startzustand kommt aus der Webflow-Interaction, nicht aus dem head-`<style>`).

### Sanity-Vorschlag (editierbare Felder)
`heading` (H1), `intro` (Rich-Text/Absatz), `portrait` (Bild + alt), `socials[]` (Plattform, URL). Social-Links sind evtl. global (mit Footer teilen).

---

## Section 2 — Werdegang-Timeline (horizontaler Scroll)
**Element:** `<section class="section_about-timeline">` · **Astro-Name-Vorschlag:** `AboutTimeline`
**Zweck:** Beruflicher Werdegang als gepinnte, horizontal scrollende Timeline mit 9 Stationen (Jahr + Titel + Beschreibung + Bild).

### Überschrift
- Struktur: `.padding-global > .container-large > .padding-top.padding-huge (padding-top:6rem) > .margin-bottom.margin-small (mb 1rem) > h2`
- H2 (wörtlich): `Über mich und meinen beruflichen Werdegang…`
- Typo: 2.875rem / 400 / lh 1.2 / ls -0.02em / `#f5f5f5`.

### Timeline-Mechanik (Desktop/Tablet)
```
.about-timeline_height              width:100%; height:1200vh   ← Scroll-Strecke, erzeugt Pin-Dauer
 └ .about-timeline_sticky-wrapper   position:sticky; top:0; height:100vh; flex center; overflow:clip
   └ .about-timeline_track          100%/100%; flex center; relative
     └ .about-timeline_item.card-about   width:45vw; height:55vh; overflow:clip   ← sichtbares „Fenster"
       └ .about-timeline_list       display:flex (row); width:900vw; height:100%; align-items:center
          └ 9× .about-timeline_item (je 100%/100%, overflow:hidden, relative)
             ├ .about-timeline_content   position:absolute; z-index:1; flex; gap 2rem; center
             │   ├ .about-timeline_left-content.is-N  flex-column; align-items:flex-end; max-width:34vw; overflow:hidden
             │   │    ├ p.about-timeline_display-text  (Jahr)
             │   │    └ p.about-timeline_title-text (.is-small)  (Titel)
             │   └ .about-timeline_right-content.is-N  flex-column; align-items:flex-end; max-width:24rem; overflow:hidden
             │        └ .event-scroll-about-ph (w-richtext)  (Beschreibung, color #d3d3d3)
             └ .about-timeline_image-wrapper  100%/100%; relative
                  ├ img.about-timeline_img    100%/100%; object-fit:cover; relative
                  └ .about-timeline_img-overlay  absolute inset:0; bg rgba(0,0,0,0.7)
```
- `about-timeline_list` ist mit `width:900vw` (9 Stationen) horizontal; wird beim Scrollen nach links verschoben (GSAP/Webflow-IX), während `sticky-wrapper` gepinnt bleibt.
- Text sitzt in `.about-timeline_content` **absolut** über dem jeweiligen Bild; `card-about` (45vw×55vh) ist der Bildausschnitt.

### Typografie
- `about-timeline_display-text` (Jahr): `#ffffff`, 7rem, lh 1.1, ls -0.06em, padding-inline .5rem.
- `about-timeline_title-text` (Titel): `#ffffff`, text-align:right, 1.75rem / 500 / lh 1.1, padding-bottom 3px, padding-left .5rem, padding-right .75rem.
  - Variante `.is-small`: 1.5em (relativ), margin-right .35em.
- Beschreibung `event-scroll-about-ph` p: erbt Body (1rem/300/lh 1.55), Farbe `#d3d3d3`. Inline-Links (`<a>`) in Gold/Text — im Export ohne eigene Farbe (erbt), `target="_blank"`.

### Die 9 Stationen (wörtlich)
Reihenfolge = DOM-Reihenfolge (links→rechts im Scroll). `left-content is-N` / `right-content is-N` in Klammern (Positions-/Reveal-Index, nicht dekodieren).

| # | Jahr | Titel (mit Zeilenumbruch) | Bild (images/) | Beschreibung |
|---|---|---|---|---|
| 1 | 1993 | Meine Wurzeln | `Tristan-mit-Kuh_1.avif` | Aufgewachsen in einem kleinen Kuhdorf in den Südtiroler Bergen, verbrachte ich ab meinem 8. Lebensjahr die Sommerferien auf einem Bauernhof. Dort hütete ich Kühe, packte bei der Arbeit mit an und lernte früh, Verantwortung zu übernehmen. |
| 2 | 2013 | Schule & Karriere | `Projekteinkäufer-für-Apple.avif` | Nach der Matura in Wirtschaft und Touristik begann ich bei einer international tätigen Ladenbaufirma zu arbeiten. Dort leitete ich sieben Jahre lang den Projekteinkauf für Apple und sammelte wertvolle Erfahrungen in verschiedensten Bereichen. |
| 3 | 2017 | Der Anfang `<br>` auf Social Media | `Webseite-050_1.avif` | Parallel zu meinem Job absolvierte ich die Fitnesstrainer-Ausbildung in München und entdeckte erstmals das Potenzial von Social Media. Ich fing an zu posten, um meine Leidenschaft sichtbar zu machen und daraus meinen Beruf als Fitnesscoach aufzubauen. |
| 4 | 2018 | Meine erste Marke | `Gsund-und-Guat-1_1.avif` | Als jüngster Sohn unseres Familienbetriebs, der Konditorei Weithaler, gründete ich „Gsund und Guat". Die Idee verband Tradition mit Innovation und führte zu pflanzlichen Müsliriegeln, die heute in Geschäften, Hotels und online erhältlich sind: [www.gsundundguat.it](https://www.gsundundguat.it) (`target="_blank"`). |
| 5 | 2020 | Social Media Manager *(title `.is-small`)* | `Social-Media-Manager.avif` | Die Erkenntnis, welch wertvolles Werkzeug Social Media heute ist, motivierte mich dazu, Social-Media-Auftritte auch für andere aufzubauen. Durch Ausbildungen und praktische Erfahrungen entwickelte ich Strategien und Content-Skills, die sich bei all meinen Kunden bewährten. |
| 6 | 2021 | 200.000 Follower | `3-Zinnen-Südtirol_1.avif` | Ich baute einen der größten und erfolgreichsten Instagram-Accounts in Südtirol auf – „Southtyrolian" mit 200.000 Followern. Die Vision war es, die Wirtschaft und den Tourismus in der Region positiv zu beeinflussen. Ende 2023 zog ich mich aus dem Projekt zurück. |
| 7 | 2022 | 120.000 Follower *(title `.is-small`)* | `Mindful-Stays_1.avif` | Gemeinsam mit meiner Freundin führe ich einen der größten Instagram-Accounts für achtsame Unterkünfte - „Mindful Stays" mit 120.000 Followern. Unsere Vision: besondere Unterkünfte sichtbarer machen und bewusstes Reisen fördern: [www.mindful-stays.com](https://www.mindful-stays.com) (`target="_blank"`). |
| 8 | 2024 | Social Media `<br>` Business Coach *(title `.is-small`)* | `Social-Media-Business-Coach_1.avif` | Als Südtirols erster Social Media Business Coach teile ich heute mein Wissen und meine Erfahrungen in Form von Coachings. Dabei unterstütze ich Selbständige und Betriebe, ihre Visionen und Ziele erfolgreich über Social Media aufzubauen. |
| 9 | 2025 | Die Instagram `<br>` Erfolgsformel *(title `.is-small`)* | `E-Book-2_1.avif` | Da ich nicht alle persönlich coachen kann, schrieb ich mein E-Book „Die Instagram Erfolgsformel". Es ist kompakt, leicht verständlich und für jeden leistbar – eine klare Anleitung für alle, die mit Instagram etwas erreichen wollen: [ebook.tristanweithaler.com](https://ebook.tristanweithaler.com/) (`target="_blank"`). |

Hinweise zu Bildern:
- Alle `img.about-timeline_img.is-2` (Station 1 hat zusätzlich `is-1`, ohne visuellen Unterschied außer `background-image:none`). Alle `loading="lazy"`, alt = **leer** (Sanity: alt je Station).
- Export-srcsets sind teils inkonsistent (z. B. Station 5: kleine Breiten zeigen `Southtyrolian.avif`, 2048w `Social-Media-Manager.avif`; Station 2 hat `-p-500…-p-2000.jpg` JPG-Fallbacks). Für die Migration je Station **eine** Quelldatei (Spalte „Bild") nehmen und Astro `<Image>` die Größen generieren lassen.
- object-fit: cover; kein Radius. Overlay `rgba(0,0,0,0.7)` liegt über jedem Bild (dunkelt es ab, damit weißer Text lesbar ist).

### Responsive
- **≤767px**: `display-text` 5rem; `title-text` 1.25rem (`.is-small` 1.125em); `right-content` max-width 21rem; `content` gap 1.5rem. (Mechanik bleibt horizontal.)
- **≤479px (Mobile Portrait): Timeline kollabiert zu vertikaler Liste** — und die Scroll-Animation wird per JS deaktiviert (s. u.):
  - `about-timeline_height`: height auto; `sticky-wrapper`: position:relative, top:auto, height:auto; `about-timeline_list`: flex-direction:column, width:auto, height:500vh; `item.card-about`: width:100%, height:auto.
  - `content`: flex-direction:column, center; `left-content`: align-items:flex-start, width:90%, max-width:none; `display-text`: 4rem, padding-left:0; `title-text`: text-align:left, 1.125rem, padding-left:0; `icaro-titles-contain`: flex-direction row-reverse; `right-content`: width:90%; `div-hide`: align-items flex-start.

### Animations-Marker (nur auflisten, nicht dekodieren)
- **head-`<style>` Initialzustand** (bis Webflow-IX `w-mod-ix3` lädt → `visibility:hidden !important`): `.about-timeline_list, .about-timeline_item.card-about, .about-timeline_image-wrapper`, sowie `[data-timeline="1-description"]`, `[data-timeline="1-year"]`, `[data-timeline="1-text"]`, `[data-timeline="2-content-left"]`, `[data-timeline="2-description"]`, `[data-timeline="3-content-left"]`, `[data-timeline="3-description"]`, `[data-timeline="4-year"]`, `[data-timeline="4-text"]`, `[data-timeline="4-description"]`, `[data-timeline="5-letter-1..4"]`, `[data-timeline="5-text"]`, `[data-timeline="5-description"]`, `[data-timeline="6-year"]`, `[data-timeline="6-text"]`, `[data-timeline="6-description"]`, `[data-timeline="7-content-left"]`, `[data-timeline="7-description"]`, `[data-timeline="8-year"]`, `[data-timeline="8-text"]`, `[data-timeline="8-description"]`, `[data-timeline="9-content-left"]`, `[data-timeline="9-description"]`.
- **`data-timeline`-Attribute** an Jahren/Titeln/Beschreibungen: Muster `"{N}-content-left"`, `"{N}-year"`, `"{N}-text"`, `"{N}-description"` für N=1..9. Station 5 (Jahr „2020") ist zusätzlich in Einzelbuchstaben zerlegt: `<span data-timeline="5-letter-1">2</span>` … `5-letter-4` (Klassen `_2019-2/_2019-0/_2019-1/_2019-9`) — Per-Buchstabe-Animation. Stationen 5 & 9 nutzen `.icaro-titles-contain`.
- **Reveal-Masken**: `.overflow-hidden` (Station 1) bzw. `.div-hide` (Stationen 3/4/5/6/9) um Jahr/Titel; `.no-hide` hebt `overflow` wieder auf (Stationen 5/9).
- **Engine**: geladen werden GSAP 3.11.4, Lenis (Smooth-Scroll), außerdem im head GSAP 3.15 + SplitText + ScrollTrigger. Der sichtbare Horizontal-Scroll-Pin läuft über Webflow-IX (`data-w-id` an den `menu`/globalen Elementen) + GSAP.
- **Custom-JS (wichtig für Migration)**: Ein Inline-Script deaktiviert die Timeline-Animation **nur auf Mobile Portrait**: prüft `isMobilePortrait()`, setzt `.section_about-timeline.is-disabled`, killt ScrollTrigger/GSAP-Tweens innerhalb der Section und injiziert CSS, das `.about-timeline_left-content/.right-content/.about-timeline_image/[data-timeline]/.event-scroll-about-ph` wieder sichtbar & statisch macht. → In Astro nachbilden: unter 479px keine Pin-/Horizontal-Animation, stattdessen simple vertikale Liste.

### Sanity-Vorschlag
`timeline` als Array von Objekten: `{ year (string), title (string, erlaubt Zeilenumbruch/`<br>`→ eigenes Feld oder `\n`), description (Rich-Text mit Links), image (Bild + alt), titleSmall (bool, für `.is-small`) }`. Section-Heading (H2) als eigenes Feld.

---

## Section 3 — Interessen-Banner + Marquee
**Element:** `<section class="section_interest-banner" data-w-id="74bb5add-6598-5702-d4c6-d1ac3e3d41ea">` · **Astro-Name-Vorschlag:** `AboutInterests`
**Zweck:** Persönliche Interessen — 2 hervorgehobene Interessen (Icon + Titel + Text) plus zwei endlos laufende Text-Marquees mit Schlagwörtern.

### Teil A — Interessen-Grid
- Struktur: `.padding-section-large (7rem T/B) > .spacer-xxlarge (pt 5rem) > .padding-global > .container-large > .margin-bottom.margin-xxlarge (mb 5rem) > grid .interest-banner_component`
- `interest-banner_component`: grid 2 Spalten `1fr 1fr`, col-gap 5rem, row-gap 4rem, `align-items:start`.
  - **Links** `.interest-banner_content-left`: H2 (wörtlich): `Falls ich dich noch nicht gelangweilt habe, erzähle ich dir gerne, was ich sonst noch so mag` — Typo 2.875rem/400/lh1.2/ls -0.02em/`#f5f5f5`.
  - **Rechts** `.interest-banner_content-right` (padding-top .5rem):
    - `.margin-bottom.margin-medium` (mb 2rem) → p.text-size-medium.text-color-tertiary: `Ich verbringe die meiste Zeit mit diesen beiden Dingen:` (1.125rem/`#d3d3d3`).
    - grid `.interest-banner_item-list` (gap 1.5rem, pt/pb .5rem) mit 2 Items:
      - `.interest-banner_item` = flex; `.interest-banner_item-icon-wrapper` (Farbe `#b39478`, margin-right 1rem, `icon-embed-small` SVG, currentColor) + `.interest-banner_item-text-wrapper`:
        - Item 1: `.margin-bottom.margin-xsmall` → h3.heading-style-h5 `Reisen`; p.text-size-small.text-color-secondary: `Ich liebe es, neue Orte und Kulturen zu entdecken und meinen Horizont zu erweitern.` (Icon: Lupe/Karte-SVG.)
        - Item 2: h3.heading-style-h5 `Weiterbildung`; p.text-size-small.text-color-secondary: `Ich lebe nach den beiden Mottos: „Man lernt nie aus“ und „Übung macht den Meister“.` (Icon: Monitor/TV-SVG.)
    - h3-Typo: 1.5rem/700/lh1.3/ls0.01em/`#f5f5f5`. Item-Text-Typo: 0.875rem/`#737373`; (Basisregel `text-size-small.text-color-secondary { min-height:3.1em }`).

### Teil B — Marquees (`.interests_component`)
- Zwei horizontale Endlos-Laufbänder:
  - **Reihe 1** `.interests_content-wrapper` (`data-w-id="4ff1c3ab-b01a-b6ec-0786-1f73497073af"`) enthält 2× `.interests_content.scroll` (identisch dupliziert für nahtlose Schleife). Wörter je: `Fitness`, `Startups`, `Freunde`, `Reisen`, `Vegetarismus`, `Spiritualität`, `Business`, `Netzwerken`.
  - `.spacer-xsmall` (pt 1rem).
  - **Reihe 2** `.interests_content-wrapper` (`data-w-id="87a01474-77c1-7d50-3f4d-feb3aae042f8"`) enthält 2× `.interests_content.scroll.reverse`. Wörter je: `Qi Gong`, `Querdenken`, `Wandern`, `Spiritualität`, `Lesen`, `Zeichnen`, `Nachhaltigkeit`.
- Wort-Element: `.interests_text-wrapper > .process-step_banner-text`.
  - `process-step_banner-text`: 1.325rem, ls 0.01em, `white-space:nowrap`.
  - `interests_text-wrapper`: `filter: brightness(1000%) saturate(0%)` → erzwingt **weiß**; `margin-inline:2rem`; height 2.25rem; pointer-events:none.
  - `interests_content`: flex row, `justify-content:space-around`, min-width 100%, flex:none.
  - `interests_content-wrapper`: overflow:clip + `mask-image: linear-gradient(to right, transparent 0%, #000 10% 90%, transparent 100%)` (weiche Kanten links/rechts).
- **CSS-Animation (keine Webflow-IX)** — inline im Section-Embed:
  ```css
  @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }
  .scroll { animation: scroll 22s linear infinite; }
  .reverse { animation-direction: reverse; }
  ```
  → Reihe 1 läuft nach links, Reihe 2 (reverse) nach rechts, je 22s linear, endlos. In Astro 1:1 als CSS-Marquee übernehmen (kein GSAP nötig).

### Farben/Flächen
- Section-Hintergrund: Seiten-Schwarz `#0c0c0c`. Icons Orange `#b39478`. Marquee-Text weiß. Keine Verläufe.

### Responsive
- **≤991px**: `interest-banner_component` gap 3rem/2rem; `interest-banner_item-list` → 1 Spalte; `interests_text-wrapper` height 2rem, margin-inline 1.5rem.
- **≤767px**: `interest-banner_component` → 1 Spalte, gap 1.25rem; `content-right` padding-top 0; `process-step_banner-text` → 1.125rem; `interests_text-wrapper` height 1.75rem, margin-inline 1rem; `heading-style-h5` → 1.325rem; `text-size-medium` → 1rem.
- **≤479px**: `interest-banner_component` & `item-list` 1 Spalte; `interests_text-wrapper` margin-inline .5rem.

### Animations-Marker (nur auflisten)
- Section: `data-w-id="74bb5add-6598-5702-d4c6-d1ac3e3d41ea"`.
- Interessen-Grid `div.interest-banner_component`: `data-w-id="c75a8f83-fa7c-75da-adaa-1cb60b519076"` — Inline-Startstil: `opacity:0; filter:blur(5px); transform:translate3d(0,1rem,0) scale3d(1,1,1) …` (Scroll-in Reveal).
- Marquee-Reihe 1: `data-w-id="4ff1c3ab-b01a-b6ec-0786-1f73497073af"` — gleicher Inline-Startstil (opacity0/blur/translateY).
- Marquee-Reihe 2: `data-w-id="87a01474-77c1-7d50-3f4d-feb3aae042f8"` — gleicher Inline-Startstil.
- Grid-Item-IDs (nur Grid-Placement, keine Animation): `w-node-…907f` / `…9088`.

### Sanity-Vorschlag
`interests.heading` (H2), `interests.introLine` (Absatz), `highlights[]` `{ icon (Auswahl/SVG-Key), title, text }` (2 Stück), `marqueeRow1[]` (Wort-Liste), `marqueeRow2[]` (Wort-Liste). Marquee-Speed (22s) als Konstante im Code.

---

## Section 4 — Abschluss-CTA („Genug von mir. Jetzt bist du dran")
**Element:** `<section class="section_final-cta">` · **Astro-Name-Vorschlag:** `AboutFinalCta`
**Zweck:** Handlungsaufforderung — Erstgespräch buchen.

### Text (wörtlich)
- H2: `Genug von mir. Jetzt bist du dran`
- Absatz: `Erzähl mir von dir, deinen Zielen und Visionen. Vielleicht kann ich dir schon bald dabei helfen, sie groß zu machen!`
- Button-Label: `Kostenloses Erstgespräch buchen`

### Layout / Struktur
```
section.section_final-cta
 └ .padding-global > .container-large
   └ .padding-section-medium (5rem T/B)
     └ .max-width-xsmall (max 25rem)     ← linksbündig, schmale Spalte
        ├ .margin-bottom.margin-small (mb 1rem) → H2
        ├ p.text-size-medium.text-color-tertiary
        └ .margin-top.margin-medium (mt 2rem)
           └ .button-group → a.button-glow  (Glow-Gradient-Button, geteiltes Chrome)
 └ .spacer-xlarge (pt 4rem)   ← nach der Section
```
- Button-Ziel: `href="https://calendly.com/tristanweithaler/30min"`, `target="_blank"`, `rel="nofollow"`. **Wichtig:** dieser CTA öffnet **nicht** das Coaching-Modal, sondern verlinkt direkt zu Calendly (anders als der `0 € Angebot`-Button im Header). `btn-action=""` ist leer. Button enthält 2 Pfeil-Icons (`images/white-arrow-topright-vector.svg`) für den Hover-Slide.
- Typo: H2 2.875rem/400/lh1.2/ls-0.02em/`#f5f5f5`; Absatz 1.125rem/`#d3d3d3`.

### Farben/Flächen
- Section-Hintergrund: Seiten-Schwarz `#0c0c0c`. Button = geteilte `.gradient-btn`-Optik (Gold-Conic/Linear-Verläufe + Grain-SVG-Noise; Detail beim Chrome-Agent).

### Responsive
- `max-width-xsmall` bleibt 25rem. `padding-section-medium`: ≤991px 4rem, ≤767px 3rem T/B. H2 folgt `h2`-Element: ≤767px → 2.25rem, ≤479px → 2rem. `text-size-medium` ≤767px → 1rem.

### Animations-Marker (nur auflisten)
- H2: `data-w-id="83390632-6bba-942d-376b-9b10d2497af1"` — Inline-Startstil `opacity:0; filter:blur(5px); transform:translate3d(0,1rem,0)…`.
- Absatz: `data-w-id="06a98e18-9026-2539-6eef-03a08bac1fa9"` — gleicher Inline-Startstil.
- Button: `data-w-id="adf01002-fd69-c74f-3f47-8f1052ac6afe"` (Glow-Interaktion, geteiltes Chrome).

### Sanity-Vorschlag
`finalCta.heading`, `finalCta.text`, `finalCta.buttonLabel`, `finalCta.buttonUrl` (Default Calendly-Link), `finalCta.openInNewTab` (bool). Ggf. global mit anderen CTA-Sections teilen.

---

## Reihenfolge im `<main>` (Ausgabe oben→unten)
1. `section_hero` (Hero)
2. `section_about-timeline` (Werdegang-Timeline)
3. `section_interest-banner` (Interessen + Marquee)
4. `section_final-cta` (Abschluss-CTA)
5. `.cta-modal` (Coaching-Anfrage-Modal — **anderer Agent**, liegt im `<main>`, ist aber globales Chrome)

## Bild-Assets (Export-Pfade, alle unter `images/`)
- Hero: `Titelbild-40_1.avif`
- Timeline: `Tristan-mit-Kuh_1.avif`, `Projekteinkäufer-für-Apple.avif`, `Webseite-050_1.avif`, `Gsund-und-Guat-1_1.avif`, `Social-Media-Manager.avif`, `3-Zinnen-Südtirol_1.avif`, `Mindful-Stays_1.avif`, `Social-Media-Business-Coach_1.avif`, `E-Book-2_1.avif`
- Social-Icons: inline-SVG (Instagram/LinkedIn), kein Datei-Asset.
- Interest-Icons: inline-SVG (currentColor).
- CTA-Pfeil: `white-arrow-topright-vector.svg` (geteiltes Chrome).
- Alle Bilder haben im Export **leeren alt-Text** → in Sanity alt-Felder ergänzen.

## Offene Punkte / Unklarheiten
1. **alt-Texte fehlen komplett** (Hero + alle 9 Timeline-Bilder). Vorschlag oben, Inhalte muss Tristan liefern / wir textlich vorschlagen.
2. **Timeline-Scroll-Engine:** Exakte GSAP-ScrollTrigger-Parameter (Pin-Länge = 1200vh, `list` 900vw) stehen nicht als eigenes Inline-Script hier — die Bewegung kommt aus Webflow-IX (`w-mod-ix3`). Für die Migration muss der Animations-Agent den horizontalen Pin-Scroll neu in GSAP bauen (Scrub, pin, x-translate über 9 Stops). Mobile-Portrait: Animation deaktiviert, vertikale Liste (Custom-Script-Verhalten dokumentiert).
3. **Timeline-Bild-srcsets sind im Export inkonsistent** (falsche Zuordnungen, JPG-Fallbacks). Empfehlung: je Station die in der Tabelle genannte Einzeldatei nehmen, Responsive-Größen via Astro `<Image>` generieren — nicht die Export-srcsets kopieren.
4. **Final-CTA vs. Header-CTA:** Final-CTA → Calendly-Direktlink; Header-„0 € Angebot" → Modal/Anchor. Beim Sanity-Modell trennen (kein gemeinsamer „öffnet Modal"-Automatismus).
