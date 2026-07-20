# Global Design-System & Chrome — Tristan Weithaler

Quelle: Webflow-Export `tristan-webflow-code/`. Referenzseite Chrome: `index.html`.
CSS: `css/normalize.css` (Reset), `css/webflow.css` (Framework-Basis), `css/tristan93.webflow.css` (Site-Styles).
Breakpoints (max-width): **991** (Tablet), **767** (Mobile Landscape), **479** (Mobile Portrait). Basis = Desktop.
Alle Werte unten sind aufgelöst; Webflow-Klassennamen in Klammern als Zuordnung.

Grundton der Site: **dunkel** (fast-schwarzer Hintergrund, helle Schrift, warme Gold-/Beige-Akzente, "Dolomiten"-Bildwelt).

---

## 1. Farben

Es existiert ein Token-System (CSS Custom Properties in `:root`, `tristan93.webflow.css:129-184`). Zwei Ebenen: **base-color** (Rohwerte) → **semantische** Tokens.

### Base-Palette (Rohwerte)
| Token | Hex | Rolle |
|---|---|---|
| `--base-color-brand--black-brand` | `#0C0C0C` | **Primärer Seiten-Hintergrund** |
| `--base-color-brand--grey-blue-dark` | `#1D1D1D` | Sekundär-Flächen (Cards, FAQ, Formular-Inputs, Sektionen) |
| `--base-color-brand--grey-blue` | `#4D5258` | Tertiär-Flächen / sekundäre Links |
| `--base-color-brand--grey-blue-light` | `#808389` | Formular-Rahmen (`--border-color--border-forms`) |
| `--base-color-brand--main` | `#D8D3CC` | Warmes Beige — Button-Outline-Rahmen, Button-Hover-Fläche |
| `--base-color-brand--secondary` | `#806429` | **Gold/Bronze-Akzent** — CTA-Gradient, aktive Tags, Fokus-Rahmen |
| `--base-color-brand--gold-alt` | `#5E4931` | Gold-Alternative (selten) |
| `--base-color-brand--tertiary` | `black` (`#000`) | reines Schwarz |
| `--base-color-brand--transparent` | `transparent` | — |
| `--orange-1` (Legacy) | `#B39478` | Logo-Linie mobil (`.navbar_logo-line.black`) |
| `--orange-1-2` (Legacy) | `#786352` | — |
| `--cream-2` (Legacy) | `#DFD8D1` | — |

### Neutrale Graustufen
| Token | Hex |
|---|---|
| `--base-color-neutral--grey-lightest` | `whitesmoke` = `#F5F5F5` — **Primärtext**, Rahmen hell, Glow |
| `--base-color-neutral--grey-lighter` | `#D3D3D3` — Tertiärtext (viele Fließtexte/Listen) |
| `--base-color-neutral--grey-light` | `#737373` — Sekundärtext (Platzhalter, Labels-Info) |
| `--base-color-neutral--grey` | `#525252` — Footer-Legal-Text |
| `--base-color-neutral--grey-dark` | `#424242` — FAQ-Icon-Linien |
| `--base-color-neutral--grey-darker` | `#292929` — Menü-Trennlinien |
| `--base-color-neutral--grey-darkest` | `#202020` |
| Weitere: `#E5E5E5` (grey-200), `#A3A3A3` (grey-400), `#D6D6D6` (grey-300), `whitesmoke` (grey-100) | |

### System-/Status-Farben (Formulare)
| Rolle | Hex |
|---|---|
| Erfolg Text (`--...success-green`) | `#027A48` |
| Erfolg BG (`...success-green-light`) | `#ECFDF3` |
| Fehler Text (`--...error-red`) | `#B42318` |
| Fehler BG (`...error-red-light`) | `#FEF3F2` |
| Custom Inline-Fehlertext (Modal-JS) | `#E05C5C` |

### Semantische Zuordnung (das effektiv Sichtbare)
- **Hintergrund primär**: `#0C0C0C` (body). Sekundär: `#1D1D1D`. Tertiär: `#4D5258`. Alternate (invers/hell): `#F5F5F5`.
- **Text primär**: `#F5F5F5`. Sekundär: `#737373`. Tertiär: `#D3D3D3`. Alternate (auf hell): `#0C0C0C`. Brand-secondary (Links/Akzent): `#806429`.
- **Linien/Border**: primär `#F5F5F5`, sekundär `#1D1D1D` (Trennlinien auf dunklem BG), forms `#808389`.
- **Akzent/CTA**: Gold `#806429` (+ Beige `#D8D3CC` im Verlauf).

### Wichtige Direkt-Hex/RGBA (nicht über Tokens)
- Navbar-BG: `#1515151F` (~12% helles Grau) + Gradient-Overlay `#0C0C0CBF` (~75% schwarz) darüber.
- Menü-Overlay-Panel (`.menu_right-panel`): `#121212`.
- Transition-Tabs: `#2B2B2B`.
- Modal-Overlay: `#12131666` (~40% dunkel).
- Button-Glow-Basis: `#FFFFFF0D` (~5% weiß).
- FAQ-Plus-Icon-BG: `#FFF` (weißes Quadrat).
- Cookie-Prefs-Close: BG `#F5F6FF`, Icon `#021A7C`.
- Gängige Schatten-Alphas: `#00000026`, `#0000001A`, `#0000000F`, `#00000014`.

---

## 2. Typografie

### Font-Stack
`Poppins, Tahoma, sans-serif` (body). Poppins ist **selbst-gehostet** (18 TTF-Dateien in `fonts/`, alle Gewichte 100–900 × normal/italic, per `@font-face` in `tristan93.webflow.css:1-128`).

**Effektiv genutzte Gewichte** (in Regeln, nicht nur deklariert): **300, 400, 500, 600, 700, 800** = Workhorses; 100/200/900 nur je 2×, Italic 9× (`.text-style-italic`, About-Timeline). → Für Migration reichen 300/400/500/600/700(/800) laden; Rest optional.

**⚠️ TYPEKIT-URTEIL: Altlast, NICHT nötig.** Ein Inline-Typekit-Loader (`index.html:2041-2049`, kitId `vqw1kwc`, scriptTimeout 1100) lädt ein Adobe-Kit. Es gibt aber **nirgends** eine Font-Family außer `Poppins`, System-Fallbacks und `'webflow-icons'` (Icon-Font) — geprüft in allen `.css` + Inline-Styles. Der Typekit-Embed setzt nur `wf-loading`/`wf-active`-Klassen, wird von keiner CSS-Regel genutzt. **Ersatzlos streichen.**

### Skala (Desktop-Basis) — `h`-Tags == `.heading-style-hN` identisch
| Element | font-size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| h1 | 4.65rem (~74px) | 300 | 1.1 | −0.03em |
| h2 | 2.875rem (~46px) | 400 | 1.2 | −0.02em |
| h3 | 2.25rem (~36px) | 500 | 1.175 | −0.01em |
| h4 | 2rem (32px) | 500 | 1.1875 | 0 |
| h5 | 1.5rem (24px) | 700 | 1.3 | 0.01em |
| h6 | 1.225rem (~19.6px) | 700 (util-Klasse: 500) | 1.375 | 0 |
| body/p | 1rem (16px) | 300 | 1.55 | — |
| label | — | 700 | — | — |
| blockquote | 18px | — | 22px | — |

### Body-Größen-Utilities
`.text-size-large` 1.25rem · `.text-size-medium` 1.125rem · `.text-size-regular` 1rem · `.text-size-small` 0.875rem · `.text-size-tiny`/`.text-size-small` 0.75rem.
Weights: `.text-weight-light` 300 · `medium` 500 · `semibold` 600 · `bold` 700 · `xbold` 800.
Sonstige: `.text-style-allcaps` (uppercase) · `.text-style-tagline` (weight 600, inline-block, kein underline — **die "Eyebrow"-Rolle**) · `.text-style-quote` (border-left 3px, 1.25rem/1.5) · `.text-style-muted` (opacity .6) · `.text-style-italic`.

### Responsive Overrides
**≤767px:** h1→3rem, h2→2.25rem (letter-spacing 0), h3→2rem, h4→1.75rem, h5→1.325rem, h6→1.2rem.
**≤479px:** h2→2rem. (h1 bleibt 3rem.)
**≤991px:** keine Heading-Overrides.
Große Display-Sonderfälle: `.menu_text-link` 4.75rem → 3.25rem (991) → 2.75rem (479); `.about-timeline_display-text` 7rem; `.modal-heading` 2.5rem → 1.75 (991) → 1.5 (767).

---

## 3. Layout-System

### Container (mittig, auto-Margin)
- `.container-large` **max-width 80rem** (1280px) — Standard.
- `.container-medium` 64rem (1024px) · `.container-small` 48rem (768px).
- `.max-width-*`: xxlarge 80 / xlarge 64 / large 37 / medium 35 / small 30 / xsmall 25 / xxsmall 20 rem.

### Gutter / Seitenrand
- `.padding-global`: **padding-left/right 5%** (fluid). Navbar & Modal nutzen ebenfalls 5% (`5vw` bzw. `5%`).

### Section-Paddings (vertikal)
- `.padding-section-small` 3rem · `medium` 5rem · `large` 7rem · `xlarge`/`xxlarge` (>7rem).
- Box-Paddings: `.padding-medium` 2rem · `large` 3 · `xlarge` 4 · `xxlarge` 5 · `huge` 6 · `xhuge` 8 · `xxhuge` 12rem.

### Spacer (nur padding-top, Vertikal-Abstand)
tiny .25 · xxsmall .5 · xsmall 1 · small 1.5 · medium 2 · large 3 · xlarge 4 · xxlarge 5 · huge 6 · xhuge 7 · xxhuge 10 rem.

### Grid/Flex-Muster
- Webflow-Basis: `.w-layout-grid` (2×1fr, gap 16px), `.w-layout-vflex` (column).
- Reviews-Grid: 3× `minmax(15rem,1fr)`, gap 2rem.

### Radius-System
Buttons/Pills **10rem** (voll rund). Cards/Modals **1.5rem**. FAQ-Icon/Inputs **0.5rem**. Resource-Cards **1.5rem**, Bild darin 1.1rem. Cookie-Banner 1.5rem, Cookie-Prefs-Form 1.25rem. Work-Items 1rem.

### Schatten
- `.shadow-primary` `0 1px 3px #0000001A, 0 1px 2px #0000000F` (+ weitere Größen-Stufen im Styleguide).
- Resource-Bild: `0 6px 12px #00000026`. Link-Hover: `1px 1px 3em 1px #0006`.

### Blur-Effekte (backdrop-filter)
- Navbar `blur(0.5rem)`. Modal `blur(1.5rem)`. Cookie-Prefs-Overlay `blur(0.5rem)`. Button-Glow-Circle `filter: blur(20px)`.

---

## 4. Buttons + Links

### 4a. Primär-CTA "Glow-Button" (`.button-glow`) — das Leit-Element
Verschachtelte Struktur (immer gleich, kommt auf jeder Seite mehrfach vor):
```
.button-glow                (äußerer Ring: bg #FFFFFF0D, radius 10rem, padding 1px, overflow hidden)
  .button-css               (Inline-<style> mit .gradient-btn — s.u.)
  .button-wrapper           (bg #0C0C0C, radius 10rem, overflow clip)
    .button-content-wrapper.gradient-btn   (padding .575rem 1.5rem, flex center, gap .75rem)
      <p/​input class=button-text/button-submit>  Label
  .button-glow-circle       (bg whitesmoke, blur(20px), radius 100%, 100%+.5rem, absolute — Glow-Bleed)
```
**`.gradient-btn` Hintergrund** (Gold-Conic + 3 Linear-Gradients + Grain-SVG-Noise 15% Opacity):
```
conic-gradient(from 0deg at 68% 62%, #73196E00 8%, #80642961 18%, #8064297D 36%, #80642966 68%, #80642945 72%, #FF000000 76%),
linear-gradient(112deg, #80642900 44%, #80642914 57%, #80642966 72%, #806429A6 86%, #806429FF 93%),
linear-gradient(105deg, #80642900 39%, #80642914 60%, #8064295E 79%, #806429B0 92%, #806429FF 100%),
linear-gradient(171deg, #73196E00 56%, #D8D3CC40 72%, #D8D3CC78 85%, #d8d3cc 99%),
url("data:image/svg+xml,…feTurbulence Grain… opacity 0.15");
background-size: cover; background-position: center; background-repeat: no-repeat;
```
Optisch: pillenförmiger Button, gold-schimmernde Fläche (unten-rechts satter Gold `#806429`, oben-links Beige `#D8D3CC`) mit feinem Film-Grain, weicher weißer Glow-Rand. Text `.button-text` = weiß, letter-spacing −.02em.
Vorkommen: Header "0 € Angebot", Modal-Submit ("Senden"), Cookie "Alle akzeptieren"/"Alle Cookies akzeptieren"/"Einstellungen bestätigen", diverse Hero-/Section-CTAs.
Interaktion: Webflow-IX2 lässt den `.button-glow-circle` dem Cursor folgen (Glow-Follow) — für Migration optional als Mouse-Move-Effekt oder statischer Glow.
Trigger zum Modal-Öffnen: `btn-action="cta-modal-open"` (als `<button>`), sonst `<a href="/#0-Euro-Angebot">`.

### 4b. Outline-Button (`.button`)
Rahmen `1.45px solid #D8D3CC`, Text `#F5F5F5`, radius 10rem, padding `.575rem 1.5rem`, `transition: all .5s cubic-bezier(.165,.84,.44,1)`, gap .75rem.
- **:hover** → `background-color #D8D3CC` (fällt gefüllt-beige).
- **:active** → border+bg `#806429` (gold).
- `.button.is-tertiary` → transparent (für "Ablehnen" im Cookie-Banner).

### 4c. Sekundär / Text-Link
- `.button.is-secondary` → randlos, kein Padding, keine Transition, `color #D3D3D3`, block, relative.
- Underline-Animation: Nav-Links haben `.link-underline-line` (1.15px, bg `#F5F5F5`, `transform: translateX(-101%)` → auf hover reingeschoben; Webflow-IX2).

### 4d. Legacy `.button-old` (nur im Style-Guide) — **nicht migrieren**
Gefüllt hell (`#F5F5F5` bg, dunkler Text), Varianten is-secondary/is-link/is-tertiary/is-alternate.

### Standard-Transition-Kurve site-weit
`cubic-bezier(.165, .84, .44, 1)`, Dauer meist `.5s` (Buttons/Cards), `.2s` (kleine State-Changes wie FAQ-Icon, Radios).

---

## 5. Header / Navigation

### Struktur (`nav.navbar`, `index.html:298-364`)
- **Position:** `fixed` oben rechts (`inset:0 0 auto auto`), **z-index 499**, volle Breite, Höhe **4.375rem** (max 80px; ab ≥1600px 140px via Head-Media-Query), padding `.125rem 5vw`.
- **Hintergrund:** `backdrop-filter: blur(.5rem)` + bg `#1515151F` + linearer Overlay `#0C0C0CBF → #0C0C0CBF` (dunkel-transluzent, verschwommen). Kein Farbwechsel beim Scrollen (kein Scroll-State im CSS).
- **Logo (Wortmarke, Split):** `.navbar_logo-wrapper.is-desktop` zeigt "Tristan | Weithaler" als zwei `.navbar_logo-text` (1.5rem, weight 500) getrennt durch vertikale Linie `.navbar_logo-line` (1.75px × 2rem, Farbe Gold `#806429`). Mobile-Variante `.is-mobile` zeigt "T | W" (Linie Farbe `#B39478`), erscheint ab ≤767px (Desktop-Logo wird dann ausgeblendet).
- **Desktop-Links** (`.navbar_menu-desktop`, `.navbar_menu-link`, Farbe `#D3D3D3` → hover `#F5F5F5`, mit `.link-underline-line`):
  1. "Zum E-Book" → `https://ebook.tristanweithaler.com/` (target _blank)
  2. "ALL-IN-ONE Coaching" → `all-in-one-coaching.html`
  3. "Über mich" → `ueber-mich.html`
  4. "Partner" → `#` — **Klasse `hide` (ausgeblendet)**, nicht migrieren.
- **Header-CTA:** Glow-Button "0 € Angebot" → `href="/#0-Euro-Angebot"` rel=nofollow (Anker; öffnet KEIN Modal im Header, sondern springt zum Angebot-Abschnitt).
- **Burger** (`.navbar_menu-button`, `display:none` auf Desktop, ab ≤991px `flex`): runder Button (3rem, bg `#1D1D1D`, radius 100%) mit 3 Linien (`.navbar_menu-line-*`, je 100%×1.5px, Farbe hell `#F5F5F5`).

### Mobile/Tablet-Menü (Fullscreen-Overlay) — **es gibt KEIN Mega-Menü**
`mega-menu.html` ist eine **leere Stub-Seite** (nur geteilte Scripts, kein Nav-Markup). Auch im Desktop-Header existiert kein Dropdown/Mega-Menü. Die einzige Aufklapp-Navigation ist das Fullscreen-Overlay:
- `.menu_parent` (z 99, 100vw×100vh, fixed, `display:none` → per IX2 auf `flex`/`block`). **Doppelt im DOM** (einmal in `<nav>`, einmal direkt danach) — Export-Artefakt, für Migration nur **eine** Instanz.
- `.menu_right-panel`: bg `#121212`, Breite 50% (Desktop-Basis) → **100% ab ≤991px**, zentriert.
- Links `.menu-link-parent` (je 16.667% Höhe, border-bottom `1.5px #292929`, padding `3.5rem`/`4.5rem`): großes `.menu_text-link` (**4.75rem** → 3.25 (991) → 2.75 (479)) + weißer Pfeil `images/White-arrow-button.svg` (`.menu_icon-image`, 2.25rem). Hover-Wipes: `.menu_card-whipe` (`#292929`) & `.menu_click-whipe` (`#737373`, height 0→…). Menü-Einträge:
  1. **Startseite** → index.html
  2. **Zum E-Book** → ebook.tristanweithaler.com (_blank)
  3. **ALL-IN-ONE Coaching** → all-in-one-coaching.html
  4. **Über mich** → ueber-mich.html

### Öffnen/Schließen-Logik
- Öffnen/Schließen ist eine **Webflow-IX2-Interaktion** auf `.navbar_menu-button` (`data-w-id="37b3cc8b-…"`): Burger-Linien → X, `.menu_parent` ein-/ausblenden, Panel-/Wipe-Animationen. Für Migration mit GSAP/CSS nachbauen.
- **Inline-Scripts sind größtenteils tote Altlast** (Ziel-Klassen existieren im aktuellen Markup nicht):
  - `$('.burger-menu-parent').on('click' … toggleClass('remove-blur-mobile'))` → `.burger-menu-parent`/`.nav` existieren nicht als Elemente. **Dead.**
  - `$('.open').on('tap', … toggleClass('no-scroll'))` → kein Element `class="open"`. **Dead.**
  - `.no-scroll{overflow:hidden}` (Head) ist real, wird aber vom IX2/Body gesetzt.
- ⚠️ Für Migration: sauberen A11y-Burger bauen (aria-expanded, ESC schließt, `overflow:hidden` am Body wenn offen). Die `-webkit-perspective/backface`-Hacks im Head (`.nav-parent`, `.burger-menu-parent`, `.flex-cc-h.menu`) sind iOS-Repaint-Fixes für nicht mehr vorhandene Elemente → weglassen.

---

## 6. Footer (`footer.section_footer`, `index.html:1518-1583`)

- **Dolomiten-Panorama** oben: `images/Berge-1D1D1D_1.avif` (`.footer_dolomites`, srcset bis 3840w) als dekoratives Bergsilhouetten-Band.
- Container: `.padding-global` + `.background-color-secondary` (`#1D1D1D`). Text weiß.
- **Layout (`.footer_component`):** Desktop 2-spaltig `space-between`. Links `.footer_first-wrapper` (34%), rechts `.footer_second-wrapper` (55%).
  - ≤991px: gap 4rem. **≤767px: `flex-flow: column`** (untereinander), first/second je 100%, second-top ebenfalls column.
- **Linke Spalte:** Logo-Bild `images/Logo---Tristan-Weithaler-TW-1.avif` (`.footer-logo-image`, 9rem breit) → Claim-Text "Südtirols erster Social Media Business Coach" (`.footer_paragraph`, grau `#D6D6D6`) → **Social-Liste** (`.footer_social-list`, gap 2rem):
  - **Instagram** → `instagram.com/tristan.weithaler/` — Lottie `documents/ig-icon-white.json` (`.social-lottie-animation.is-1`, **2rem×2rem**).
  - **LinkedIn** → `linkedin.com/in/tristan-weithaler-1b9972171/` — Lottie `documents/linkedin-icon-white.json` (`.social-lottie-animation.is-3`, **1.75rem×1.75rem**).
  - Lottie-Params: `data-loop="0"` (**kein Loop**, spielt einmal), `data-autoplay="1"` (spielt beim Laden), `data-direction="1"`, `renderer=svg`, weiße Icons. Kein Hover-Trigger im Markup — Autoplay einmalig. (Für Migration: `lottie-web`/`@lottiefiles` oder als animiertes SVG; optional Hover-Replay.)
- **Rechte Spalte** (`.footer_second-wrapper-top`, Desktop row → ≤767px column):
  - **Nav-Links** (`.footer_nav-link`, 1.25rem): Startseite · Zum E-Book (_blank) · ALL-IN-ONE Coaching · Über mich · **Work** (`work.html`) · **Partner** (`#`, is-4). (Work/Partner nur im Footer.)
  - **Kontakt** (`.footer_contact-wrpper`): E-Mail-Icon `images/email-icon-white.svg` + Titel "Email" (`.footer_contact-title` 2.25rem → 2rem@479) + Gold-Link (`.footer_orange-link`, Farbe `#806429`) `info@tristanweithaler.com` (mailto mit subject "Hey Tristan").
- **Legal-Zeile** (`.footer_legal-paragraph`, Grau `#525252`, .825rem): `Impressum • Datenschutz` (Links → impressum.html / datenschutz.html). **Kein sichtbarer Copyright-Jahr-Text** im Footer-Markup.

---

## 7. Seiten-Transition (Wipe-Overlay)

### Markup (`.transition`) — nur auf `work.html` & `resources.html` vorhanden!
```
.transition (z 2147483647, 100vw×100vh, fixed inset 0, display:none)
  .transition-trigger (display:none — IX2-Auslöser, data-w-id 185b5fbc-…)
  .trans-left-tab   (bg #2B2B2B, 50% breit, links)
  .trans-right-tab  (bg #2B2B2B, 50% breit, rechts)
```
Zwei dunkelgraue (`#2B2B2B`) Tabs, die von links/rechts zur Mitte bzw. auf-/zuziehen (**Curtain/Wipe**, kein Logo). Die eigentliche Animation ist eine **Webflow-IX2**-Sequenz, ausgelöst durch Klick auf `.transition-trigger`.

### Timing & Steuerung (`index.html:2004-2030`)
- `introDurationMS = 1500` — beim Laden: `.transition-trigger` wird geklickt (Wipe öffnet), Body bekommt `no-scroll-transition` (overflow hidden) für 1500ms.
- `exitDurationMS = 1300` — beim Klick auf internen Link (gleiche Host, kein `#`, kein `_blank`, nicht `.no-transition`): Wipe schließt, dann nach **1300ms** `window.location = href`.
- `.no-transition`-Klasse = ausgeschlossen. Back-Button (`pageshow persisted`) → reload.
- Nach `introDurationMS` wird bei Resize `.transition` auf `display:none` gesetzt.
- **Zweites Script** (`index.html:2030-2040`): Für Links `a.list-parent, a.menu-link-parent, a.logo-parent, a.n-p-link, a.btn-parent-s, a.img-parent-link` → `preventDefault` + `setTimeout(window.location=href, 1100)`. Verzögert Navigation um **1100ms** (parallele/alte Logik; teils überlappend mit obiger — beim Migrieren auf **eine** konsistente Transition vereinheitlichen).

⚠️ **Inkonsistenz:** `index.html` lädt zwar die Transition-Scripts, hat aber **kein `.transition`-Markup** → auf Home feuert die Transition nicht (Script prüft `transitionTrigger.length > 0`). Für saubere Migration: EINE globale Transition-Komponente auf ALLEN Seiten, EIN Timing (Vorschlag: intro ~800–1200ms, exit ~600–800ms; die Original-1500/1300 wirken lang).

---

## 8. CTA-Modal "Anfrage" (`.cta-modal`, auf jeder Seite, `index.html:1297-1516`)

### Öffnen/Schließen (`index.html:1591-1650`, reines Vanilla-JS)
- **Öffnen:** Klick auf `[btn-action="cta-modal-open"]` → `.cta-modal` `display:block`, dann nach 10ms `opacity:1` (CSS-Transition `opacity .3s`). Zusätzlich: URL-Param `?openModal=true` klickt beim Load den ersten Trigger.
- **Schließen:** (a) X-Button `.cta-modal-close`, (b) **ESC**-Taste, (c) Klick auf den Scroll-Container-Hintergrund (`.cta-modal-scroll-container`, nur wenn direktes Target = Overlay). Jeweils `opacity:0`, nach 500ms `display:none`.
- `display` steuert `.cta-modal.open{display:block;opacity:1}` (Inline-Style-Embed).

### Layout/Styling
- `.cta-modal`: z 610, fixed inset 0, `backdrop-filter: blur(1.5rem)`, opacity-Transition .3s.
- `.cta-modal-overlay`: z 510, bg `#12131666` (dunkel-transluzent).
- `.cta-modal-scroll-container`: z 560, `padding-top: 10vh`, seitlich 5%, scrollbar (`overflow:auto`), `data-lenis-prevent`.
- `.cta-modal-container`: max-width **35rem**, zentriert.
- `.cta-modal-content-wrapper`: bg `#0C0C0C`, radius **1.5rem**, padding `12% 10%` (≤479px `15% 5% 20%`).
- `.cta-modal-close`: transparent, rund, oben rechts, `rotate(45deg)` (Plus → X). Icon = Plus-SVG (`.cta-modal-close-icon`, 1.5rem, currentColor).
- Überschrift `.modal-heading`: "Coaching anfragen" (h3, **2.5rem** weight 700 → 1.75 (991) → 1.5 (767)).

### Formular (`#wf-form-Anfrage`, method GET, native Webflow-Form)
**Feste Felder (in Reihenfolge):**
| Feld | name | Typ | Pflicht | Platzhalter |
|---|---|---|---|---|
| Name | `Name` | text | ✔ | "Max Mustermann" |
| E-Mail-Adresse | `E-Mail-Adresse` | email | ✔ | "max@mustermann.com" |
| Berufsbezeichnung oder Unternehmen | `Berufsbezeichnung-Oder-Unternehmen` | text | ✘ | "CEO bei Muster GmbH" |
| Social Media Link (falls vorhanden) | `Social-Media-Link-falls-vorhanden` | text | ✘ | "@Instagram…" |
| **Coaching-Kategorie** (Radios) | `Service-Typ` | radio | ✔ | — |
| Weitere Informationen | `Weitere-Infos` | textarea (maxlen 5000, min-h 11.25rem) | ✘ | "Erzähl mir gerne mehr…" |
| GDPR-Checkbox | `GDPR` | checkbox | ✔ | "Ich akzeptiere die [Datenschutzerklärung]" (Link → datenschutz.html) |

**Input-Styling** (`.modal-input`): bg `#1D1D1D`, border `1px #808389`, radius .5rem, min-height 2.75rem, padding `.5rem .75rem`, font 16px, Placeholder-Farbe `#737373`. Textarea `.is-text-area` min-height 11.25rem.

**Bedingte Logik** (`data-target`-Radios + ~9KB-Script `index.html:1727-1990`):
- Radiogruppe **`Service-Typ`** (custom-styled `.quiz_radio-icon`, aktiv/fokus = 2px Gold `#806429`):
  - "ALL-IN-ONE Coaching" → `data-target="isAIO"` (Pflicht-Default). Zeigt nichts Weiteres.
  - "Spezifische Coachings" → `data-target="isSpecificCoaching"` → blendet Block **`#isSpecificCoaching`** ein.
- Innerhalb `#isSpecificCoaching`: Radiogruppe **`Unternehmens-Typ`**:
  - "Personal Brand / Selbstständig" → `data-target="isPersonalBrand"` → zeigt Multi-Select `#isPersonalBrand` (`#select-multiple-personal-brand`).
  - "Startup / Unternehmen" → `data-target="isUnternehmen"` → zeigt Multi-Select `#isUnternehmen` (`#select-multiple-unternehmen`).
- Logik: Beim Laden alle bedingten Blöcke `display:none`. Nur das Target der aktiven Auswahl je Gruppe wird gezeigt. `Unternehmens-Typ` ist **nur** required, wenn "Spezifische Coachings" gewählt ist (sonst `disabled`, damit unsichtbares Pflichtfeld nicht blockiert).
- **Eigene Fehlermeldungen** (weil Radios per `opacity:0` unsichtbar → Safari zeigt keine native Meldung): pro ungültigem Feld/Gruppe eine `.modal-field-error` (`#E05C5C`, .875rem), scrollt zum ersten Fehler. Texte: Radio "Bitte wähle eine Option aus." · Checkbox "Bitte akzeptiere die Datenschutzerklärung." · E-Mail-Mismatch "Bitte gib eine gültige E-Mail-Adresse ein." · sonst "Bitte fülle dieses Feld aus."

**Multi-Select (choices.js 11.2.3, `index.html:1659-1725`):**
- Zwei `<select multiple class="modal-select-multiple">` (personal-brand / unternehmen), Label "Welche Coaching-Bereiche interessieren dich?" + Info "(Mehrfachauswahl möglich)".
- **Optionen kommen aus Webflow-CMS** (`.w-dyn-list` / `.modal-select-multiple-input`) — im Export **leer** (`w-dyn-bind-empty`). ⚠️ Bei Migration: Coaching-Bereiche als feste Liste bzw. Sanity-Collection nachliefern (Werte enthalten z.B. "Vision & Ausrichtung" laut Kommentar).
- Choices-Config: `searchEnabled:true, removeItemButton:true, shouldSort:false, duplicateItemsAllowed:false, allowHTML:true`, Texte DE ("Klicke zum Auswählen", "Keine Optionen verfügbar", "Keine Treffer"). Placeholder "Coaching-Bereiche wählen…".
- **Styling** (Inline `<style>` im Markup): Tags transparent mit 1px Gold-Rand; ausgewählt/hover = Gold-Fill `#806429`; Dropdown bg `#0C0C0C`/`#1D1D1D`; radius .5rem.
- Gewählte Werte werden in ein verstecktes `<input name="Coaching-Bereiche">` gejoint (", ") beim Submit übertragen.

**Submit-Button:** Glow-Button (s. 4a), `input[type=submit]` value **"Senden"**, `data-wait="Bitte warten..."`.

**Erfolg/Fehler:**
- `.w-form-done` (`.cta-modal-success-message`): h4 **"Vielen Dank!"** + "Ich melde mich in Kürze bei dir. Bitte überprüfe auch deinen Spam-Ordner, falls meine Nachricht dort gelandet ist."
- `.w-form-fail` (`.modal-error-message`, bg `#FEF3F2`/Text `#B42318`): **"Ups! Etwas ist schief gelaufen - bitte versuche es nochmal."**

> Hinweis: Es existiert zusätzlich eine `.aiocoaching-modal` (Variante, `tristan93.webflow.css:3903+`) — vermutlich seitenspezifisch (AIO-Seite), Chrome-relevant nur falls global. Prüfen bei Seiten-Analyse.

---

## 9. Cookie-Banner (Finsweet fs-cc, Mode `opt-in`) — für Nachbau OHNE Finsweet

Skripte: `@finsweet/cookie-consent@1/fs-cc.js` (`fs-cc-mode="opt-in"`) + `@finsweet/attributes-scrolldisable`. Markup `index.html:417-560`, CSS `tristan93.webflow.css:4115-4360`.

### 9a. Banner (`.fs-cc-banner_component`, unten fixiert)
- z 999999, `position:fixed; inset:auto 0 0`, margin `0 2rem 2rem`, padding `1.5rem 2rem`, bg `#0C0C0C`, border `1px #1D1D1D`, radius 1.5rem. `display:none` bis Consent aussteht.
- Container (`.fs-cc-banner_container`): Grid `1.5fr 1fr`, max-width 102rem, align center.
- **Text** (grau `#D3D3D3`): "Wenn Sie auf **„Alle Cookies akzeptieren"** klicken, stimmen Sie der Speicherung von Cookies … zu, um die Navigation zu verbessern, die Nutzung zu analysieren und unsere Marketingaktivitäten zu unterstützen. Weitere Informationen finden Sie in unserer [Datenschutzrichtlinie](datenschutz.html)."
- **Buttons** (`.fs-cc-banner_buttons-wrapper`):
  - **"Alle akzeptieren"** = Glow-Button (`fs-cc="allow"`).
  - **"Ablehnen"** = `.button.is-tertiary` (transparent-outline, `fs-cc="deny"`).
  - Link **"Cookie Einstellungen bearbeiten"** (`fs-cc="open-preferences"`, `.fs-cc-banner_text-link`, unterstrichen).

### 9b. Manager-Icon (persistent, unten links) `.fs-cc-manager_component`
- `position:fixed; inset:auto auto 1rem 1rem`, z 999. Runder Button (`.fs-cc-manager_button`, bg `#1D1D1D`, radius 999rem, padding .5rem) mit **Cookie-SVG-Icon** (2rem, Farbe Gold `#806429`). Öffnet Preferences.

### 9c. Preferences-Modal (`.fs-cc-prefs_component`)
- Fullscreen fixed, `backdrop-filter: blur(.5rem)`, z 1997, padding 2rem, zentriert. `display:none` bis geöffnet. Hat `data-lenis-prevent` + `fs-cc-scroll="disable"` (Body-Scroll sperren wenn offen).
- Karte (`.fs-cc-prefs_form`): bg `#0C0C0C`, radius 1.25rem, max-width **40rem**, max-height **80vh**, `overflow:auto` (`.fs-cc-prefs_content` padding `2.5rem 2rem`).
- **Close-Button** (`.fs-cc-prefs_close`): oben rechts überlappend, rund, bg `#F5F6FF`, Icon-Farbe `#021A7C`, Schatten. (X-SVG)
- **Titel** "Datenschutzpräferenzen" (`.fs-cc-prefs_title` 1.5rem/700) + Erklärungstext (grau .85rem).
- Zwei Top-Buttons (`.fs-cc-prefs_space-medium`): **"Alle Cookies ablehnen"** (`.button.is-tertiary`, deny) + **"Alle Cookies akzeptieren"** (Glow, allow).
- Untertitel "Zustimmungspräferenzen nach Kategorie verwalten".
- **4 Kategorien** (`.fs-cc-prefs_option`, border-bottom `1px #33333326`), je Label (weiß 1rem/700) + Beschreibung (grau .85rem):
  1. **Essentiell** — kein Toggle, Text "**Immer aktiv**". "Diese Elemente sind erforderlich, um die Grundfunktionen der Website zu ermöglichen."
  2. **Marketing** — Toggle `fs-cc-checkbox="marketing"` (name `marketing-2`). Beschreibung Werbe-Text.
  3. **Personalisierung** — Toggle `fs-cc-checkbox="personalization"` (name `personalization-2`).
  4. **Analysen** — Toggle `fs-cc-checkbox="analytics"` (name `analytics-2`).
- **Toggle-Optik** (`.fs-cc-prefs_checkbox-field`): Pille 2.75rem×1.5rem, bg `#CCC`, padding .125rem, radius 999rem; Knopf `.fs-cc-prefs_toggle` weißer Kreis 1.25rem. (Checkbox `opacity:0` darüber, Label `display:none`.) **Checked-Zustand ist nicht im CSS definiert** (Finsweet-JS schiebt den Knopf/färbt) → beim Nachbau: `:checked` → Knopf nach rechts (`translateX`), Pille aktiv-Farbe (Vorschlag: Gold `#806429` oder Grün `#027A48`).
- **Bestätigen:** Glow-Button **"Einstellungen bestätigen"** (`fs-cc="submit"`); echtes Webflow-Submit versteckt.

### Interaktions-Verhalten (nachzubauen)
opt-in = **nichts wird ohne Zustimmung gesetzt**. Banner erscheint bis Entscheidung; "Ablehnen" schließt ohne Marketing/Analytics/Personalization; "Alle akzeptieren" aktiviert alle; Manager-Icon öffnet Preferences jederzeit; Preferences sperrt Body-Scroll. Consent in Cookie/localStorage persistieren, Skripte kategorisiert nachladen.

---

## 10. Smooth Scroll (Lenis) — **NICHT AKTIV / Dead Code**

`lenis@0.2.28/bundled/lenis.js` wird per CDN auf **jeder** Seite geladen (`index.html:2055` u.a.), aber **nirgends** initialisiert: kein `new Lenis(...)`, kein `lenis.raf`, keine Optionen — in keiner `.html` und nicht in `js/webflow.js`. → Smooth-Scroll läuft de facto **gar nicht**; die Seite scrollt nativ.
`data-lenis-prevent` steht am Cookie-Prefs-Modal und am CTA-Modal (`.cta-modal`, `.fs-cc-prefs_component`) — ohne aktives Lenis wirkungslos, aber semantisch: "diese Overlays sollen das Seiten-Scrolling nicht mitziehen".
⚠️ **Migrations-Entscheidung:** Entweder Lenis bewusst **weglassen** (Original-Verhalten = nativ) ODER neu + korrekt initialisieren, falls Smooth-Scroll gewünscht. Nicht „1:1“ ist hier gar keine Funktion.

---

## 11. Sonstiges Chrome

### Favicon / Webclip (`index.html` head)
- `images/favicon.png` (`rel=shortcut icon`, 32×32-ish) · `images/webclip.png` (`rel=apple-touch-icon`).
- Canonical: `https://tristanweithaler.com`. `<html lang>` prüfen (Export ggf. ohne lang → für DE `lang="de"` setzen).

### Scrollbar (Head-Inline-Style)
`::-webkit-scrollbar{ width:0px }` → **Scrollbar unsichtbar** (Breite 0). Thumb `#B9B9B9` (irrelevant bei 0-Breite). Body: `overflow-y:scroll; overflow-x:hidden`. → Für Migration: dezente/versteckte Scrollbar beibehalten.

### ::selection
**Keine** benutzerdefinierte `::selection`/`::-moz-selection`-Regel in den Site-Styles → Browser-Default. (Optional: dezente Gold-/Beige-Selection für Feinschliff.)

### no-scroll / Body-Lock
`.no-scroll{overflow:hidden}` (Head). `.no-scroll-transition{overflow:hidden;position:relative}` (für Page-Transition). Wird von Modal/Menu/Transition genutzt, um Body-Scroll zu sperren. (Die jQuery-Toggler dafür sind teils Dead Code, s. §5 — im Astro sauber neu verdrahten.)

### Global geladene Third-Party-Libs (Head + Footer)
GSAP 3.15.0 (gsap, SplitText, ScrollTrigger) **und** zusätzlich GSAP 3.11.4 + ScrollTrigger von cdnjs (Doppel-Load — bereinigen), `split-type`, `splitting@1.0.6` (CSS), jQuery 3.5.1, choices.js 11.2.3, Finsweet fs-cc + scrolldisable + cmsload. GSAP-Zeilen-Animation `[js-line-animation]` (Wörter/Zeilen sliden hoch, `index.html:2061-2120`) — global initialisiert. ⚠️ Für Migration Libs konsolidieren: **eine** GSAP-Version, jQuery nur falls nötig, Finsweet ersetzen, `splitting`/`split-type`/`SplitText` vereinheitlichen.

### Icon-Assets (Chrome)
`images/White-arrow-button.svg` (Menü-Pfeil), `images/white-arrow-topright-vector.svg` (Button-Pfeil ↗), `images/email-icon-white.svg` (Footer), Logo `images/Logo---Tristan-Weithaler-TW-1.avif`, Footer-Berge `images/Berge-1D1D1D_1.avif`, Cookie-Icon inline-SVG.

---

## Zusammenfassung offener Punkte für die Migration
1. **Typekit streichen** (Altlast, Poppins reicht, selbst-gehostet).
2. **Lenis**: aktuell tot — bewusst weglassen oder neu initialisieren.
3. **Mega-Menü existiert nicht** — nur Fullscreen-Burger-Overlay; `mega-menu.html` ist leer.
4. **Dead-Code-Nav-Toggler** (`.burger-menu-parent`/`.open`/`.remove-blur-mobile`) sauber neu bauen (A11y-Burger).
5. **Page-Transition** nur auf work/resources vorhanden + doppelte Timing-Logik → global vereinheitlichen.
6. **CTA-Modal Coaching-Bereiche** (Multi-Select) kommt aus CMS (Export leer) → Werte/Collection nachliefern.
7. **Cookie-Banner** ohne Finsweet nachbauen (Markup/Styles hier vollständig; Toggle-checked-Farbe frei wählen).
8. **GSAP doppelt geladen** (3.15 + 3.11.4) → auf eine Version konsolidieren.
9. **Menü/Footer** in `<nav>` bzw. doppelte `.menu_parent`-Instanz sind Export-Artefakte → einmalig.
