# Animations-Spec — Tristan Weithaler (Webflow → Astro/GSAP)

Dekodiert aus dem Webflow-Export `tristan-webflow-code/` (Stand 2026-07-20).
Scope-Seiten: `index.html`, `ueber-mich.html`, `all-in-one-coaching.html`, `datenschutz.html`, `impressum.html`, `404.html`.

Quellen der Animationen:
1. **Webflow IX2** — die vollständige Interaktionsdatenbank liegt **nicht** in den HTML-Seiten, sondern in `js/webflow.js` als Aufruf `Webflow.require("ix2").init({events:{…}, actionLists:{…}})` (195 Events, 78 Action-Lists für die *gesamte* Site). Sie wurde extrahiert und ausgewertet.
2. **Inline-GSAP + SplitType** — ein `[js-line-animation]`-Script (nur `index.html`).
3. **CSS** — `css/tristan93.webflow.css` (Transitions/Hover; keine relevanten `@keyframes`).
4. **Custom Inline-JS** — CTA-Modal-Fade, Seiten-Transition-Mechanik, Menü-/Burger-Toggles.

**Zentrale Erkenntnis zur Zuordnung:** *Alle* IX2-Interaktionen sind **CLASS-basiert** (0 element-spezifische `data-w-id`-Trigger). D.h. jede Interaktion feuert auf *jedem* Element mit der Ziel-Klasse. Die `data-w-id`-Attribute im HTML sind größtenteils tote Referenzen (Ausnahme: die 2 Lottie-Elemente). Das Matching unten basiert daher auf dem tatsächlichen Vorkommen der Trigger-Klassen pro Seite.

---

## 0. Easing-Mapping (Webflow → GSAP)

| Webflow-Easing            | GSAP-Äquivalent            | Anmerkung |
|---------------------------|----------------------------|-----------|
| `outQuart`                | `power3.out`               | Quart = x⁴ → GSAP power3 |
| `outSine`                 | `sine.out`                 | |
| `ease` (Default)          | `power1.out`               | exakt = CSS `ease` → alternativ `CustomEase.create("ease","0.25,0.1,0.25,1")` |
| `""` (leer)               | — (instant / `set()`)      | tritt nur in Initial-State-Gruppen auf → als `gsap.set()` umsetzen |
| `Power2.easeOut` (Script) | `power2.out`               | line-animation |
| CSS `cubic-bezier(.165,.84,.44,1)` | `power4.out` / `expo.out` | Webflow-Standard-„smooth", nur in CSS-Transitions (Hover-Polish) |

Alle IX2-Dauern sind in **Millisekunden**. Die `[js-line-animation]`-Werte sind in **Sekunden**.

**`prefers-reduced-motion`:** In Webflow nicht berücksichtigt. Für die Migration überall respektieren → Reveals sofort auf Endzustand setzen, Loops/Glow deaktivieren.

---

## GLOBAL / CHROME (auf allen Scope-Seiten außer 404)

Diese Interaktionen kommen über Navbar + Footer + Cookie-Banner auf **jeder** Scope-Seite vor (404 ausgenommen — dort nur 3 Klassen, keine Interaktionen).

### G1 — Navbar-Menü-Link Hover-Wipe
- **Element:** `.navbar_menu-link` (Hover-Füllung/Unterstreichung im Haupt-Nav-Link)
- **Trigger:** `MOUSE_OVER` / `MOUSE_OUT` (Events e-869 / e-870) — alle Breakpoints
- **Effekt:** Wipe-Füllung horizontal.
  - Hover-in: `x: -101% → 0%`, **300 ms**, `outSine` (→ `sine.out`)
  - Hover-out: `x → 101%`, **200 ms**, `outSine`
- **Initial-State:** kein persistenter Init (Startwert -101% wird erst bei Hover-in gesetzt).
- **GSAP:** `gsap.fromTo(fill, {xPercent:-101}, {xPercent:0, duration:.3, ease:"sine.out"})`; onLeave `gsap.to(fill,{xPercent:101,duration:.2,ease:"sine.out"})`. Element `overflow:hidden` am Link-Wrapper.

### G2 — Footer Social-Link Hover (Blur/Dim)
- **Element:** `.footer_social-link`
- **Trigger:** `MOUSE_OVER`/`MOUSE_OUT` (e-522 / e-523) — **nur Desktop** (`mq=main`)
- **Effekt:**
  - Hover-in: `opacity: 1 → 0.6`, `filter: blur(0) → blur(2px)`, **380 ms** (linear/kein Ease)
  - Hover-out: zurück auf `opacity:1`, `blur(0)`, **340 ms**, `ease` (→ `power1.out`)
- **Initial-State:** `opacity:1`, `blur(0)`.
- **GSAP:** einfache `gsap.to()` auf opacity+filter. (Doppelte Action-Items im Original = zwei Kind-Layer; Netto-Effekt identisch.)

### G3 — Lottie Social-Icons (Instagram + LinkedIn)
- **Elemente:** `.social-lottie-animation.is-1` (`documents/ig-icon-white.json`, Dauer 1.18 s) und `.social-lottie-animation.is-3` (`documents/linkedin-icon-white.json`, Dauer 1.5 s). Beide `data-w-id` `…08ce` / `…08d0`.
- **Abspiel-Verhalten:**
  - **Load:** `data-autoplay="1"`, `data-loop="0"` → spielt beim Laden **einmal** komplett ab (SVG-Renderer, eager).
  - **Hover:** IX2 e-276 (`a-78`) — bei `MOUSE_OVER` auf `.social-lottie-animation` Lottie neu abspielen: Frame `0 → 99.8%` über **600 ms** (alle Breakpoints).
- **GSAP-Hinweis:** `lottie-web` laden, `lottieInstance.goToAndPlay(0)` bei `mouseenter`; Autoplay-once bei Init. Kein GSAP nötig — reine Lottie-Steuerung. (Falls Lottie eingespart werden soll: durch statische SVGs ersetzen und Hinweis an Team.)

### G4 — Button-Glow (cursor-folgender Schein) — Desktop-only
- **Elemente:** `.button` bzw. `.button-glow` enthalten `.button-glow-circle` (radialer, `blur(20px)`, `border-radius:100%`, absolut positioniert).
- **Trigger:** `MOUSE_MOVE` / continuous (Events e-839/e-843 → `a-141`, e-875 → `a-143`), `basedOn: ELEMENT` — **nur Desktop** (`mq=main`; `.button-glow-circle` ist ≤991px `display:none`).
- **Effekt:** Glow-Kreis folgt dem Cursor innerhalb der Button-Bounds:
  - X-Achse: `translateX: -50% … +50%` (Prozent), `restingState: 50%` (zentriert), `smoothing: 50–80`
  - Y-Achse: `translateY: -50px … +50px`, `restingState: 50`, `smoothing: 50–80`
- **GSAP-Hinweis:** `mousemove`-Listener auf `.button`; normierte Cursor-Position (0–1) → `gsap.to(circle,{xPercent: (px-.5)*100, y:(py-.5)*100, duration:.5, ease:"power2.out"})`. `restingState` = Center bei `mouseleave`. `quickTo` verwenden für Performance.

### G5 — Menü-Link Klick-Indikator
- **Element:** `.menu-link-parent` (bzw. Kind-Linie) — Haupt-Nav / Mega-Menü-Trigger
- **Trigger:** `MOUSE_CLICK` (e-393, `a-74`) — alle Breakpoints
- **Effekt:** `SIZE height: 0% → 100%` (width bleibt 100%) + `rotate z: 0 → 45deg`, **300 ms**, `outQuart` (→ `power3.out`)
- **Initial-State:** `width:100%, height:0%`.
- **GSAP:** aktiver Indikator, der beim Klick aufklappt/rotiert. Eher UI-State als Deko — beim Neubau des Menüs optional. Als `gsap.to()` auf height+rotation umsetzen.

### G6 — Cookie-Consent-UI (Finsweet `fs-cc`)
- **Elemente/Trigger:** `.fs-cc-banner_trigger`, `.fs-cc-manager_trigger`, `.fs-cc-prefs_trigger`, `.fs-cc-prefs_checkbox` (Events e-893…e-900).
- **Effekte (Kurzform):**
  - Banner SHOW: `y:100% → 0`, `display none→flex`, 300 ms `ease`; HIDE: `y→100%`, 300 ms, dann `display:none`.
  - Manager/Prefs-Popup SHOW: `display→block/flex`, `y:100%/20px → 0`, `opacity:0→1`, 300 ms; HIDE: reverse.
  - Prefs-Checkbox CHECK: Knopf `x:0→20px` + `bg → rgb(128,100,41)`, 200–250 ms; UNCHECK: reverse (`bg → #ccc`).
- **Migrations-Hinweis:** Diese Animationen gehören zum **Finsweet Cookie-Consent**-Widget (`@finsweet/cookie-consent`), nicht zum Content. Nur nachbauen, wenn dasselbe Cookie-Tool weitergenutzt wird — sonst durch das Consent-Tool der Wahl ersetzen. **Nicht** Teil der GSAP-Content-Architektur.

### G-Custom-A — Menü-/Scroll-Toggles (kein GSAP, nur Zustands-Klassen)
- `.open` `tap` → `body.no-scroll` (Menü-Scroll-Lock). Burger `.burger-menu-parent` `click` → `.nav.remove-blur-mobile` (Mobile-Nav-Blur toggeln). `.menu-link-parent` `mouseenter` → `.menu-text.hover`. Reine CSS-Zustandsklassen; als CSS-Transitions übernehmen (kein JS-Timeline).

### G-Custom-B — Finsweet `scrolldisable`
- Attribut `fs-scrolldisable-element="when-visible"` (index: 1×, aio: 2×). Sperrt Body-Scroll, solange das markierte Element sichtbar ist — hier an **Modal/Cookie-Overlay** gekoppelt (verhindert Hintergrund-Scroll bei offenem CTA-Modal bzw. Cookie-Banner). In Astro durch eigenen `overflow:hidden`-Toggle beim Modal-Öffnen ersetzen (siehe I-CTA). Keine Animation.

---

## SEITEN-TRANSITION (global konfiguriert, aber auf Scope-Seiten inaktiv) ⚠️

**Mechanik (Inline-Script in jeder Seite):**
- `let transitionTrigger = $(".transition-trigger"); introDurationMS=1500; exitDurationMS=1300; excludedClass="no-transition";`
- **Load:** wenn `.transition-trigger` existiert → `.click()` (startet die IX2-Intro), `body.no-scroll-transition` für 1500 ms.
- **Link-Klick:** interne Links (gleicher Host, kein `#`, nicht `.no-transition`, nicht `target=_blank`) → `preventDefault`, Trigger klicken, nach **1300 ms** navigieren.
- **Zweites Script (unabhängig!):** `a.list-parent, a.menu-link-parent, a.logo-parent, a.n-p-link, a.btn-parent-s, a.img-parent-link` → `preventDefault` + Navigation erst nach **1100 ms**.
- **Resize:** blendet `.transition` nach dem Intro auf `display:none`.

**Befund für den Scope:** Das Overlay-Paar `.transition` + `.transition-trigger` existiert im gesamten Export **nur in `work.html` und `resources.html`** (beide *außerhalb* des Scopes). Auf `index/ueber-mich/aio/datenschutz/impressum/404` ist **kein** Overlay vorhanden → `transitionTrigger.length === 0` → **keine sichtbare Intro-/Exit-Transition**.
- Konsequenz 1: Der 1300 ms-Exit-Handler greift auf Scope-Seiten nicht (Bedingung `transitionTrigger.length>0`).
- Konsequenz 2: Das **zweite** Script (1100 ms-Delay auf Logo/Menü/etc.) läuft trotzdem → Navigation verzögert sich 1100 ms **ohne** sichtbare Animation (Leftover-/UX-Bug).

**Empfehlung:** Für die 1:1-Migration der Scope-Seiten **keine** Page-Transition implementieren und das 1100 ms-Link-Delay **nicht** übernehmen (ersatzlos streichen). → **Unklarheit / Entscheidungspunkt:** gegen die Live-Seite prüfen, ob die Homepage doch ein Intro-Overlay hat (evtl. war es ein nicht-exportiertes Symbol). Falls gewünscht, ist es als simples full-screen-Overlay (`y:100%→0` Intro / `0→-100%` Exit, ~1.3–1.5 s, `power4.inOut`) global nachrüstbar.

---

## index.html (Home)

Zusätzlich zu **allen** Global/Chrome-Interaktionen (G1–G6):

### H1 — Hero-Headline Line-Reveal (`[js-line-animation]`)
- **Element:** `h1.home-hero-h1` (`data-speed="1"`, `data-delay="1"`, kein `data-stagger`)
- **Trigger:** Script läuft `DOMContentLoaded` + `setTimeout 700 ms`; ScrollTrigger `start:"top bottom"`, `toggleActions:"play none none none"`. Da im Hero (oben) → **spielt beim Laden**.
- **Mechanik:** SplitType `types:"lines"`, jede `.line` → `overflow:hidden`, innen `.line-inner` (`display:block`).
  - `fromTo(.line-inner, {yPercent:100}, {yPercent:0, duration: 1 (=data-speed), stagger:{amount:0.2 (default), ease:"linear"}, delay: 1 (=data-delay)})`
  - Timeline-Ease: `Power2.easeOut` (→ `power2.out`)
- **Initial-State:** Wrapper `visibility:hidden` (CSS `[js-line-animation]{visibility:hidden}`), im Script `gsap.set(el,{autoAlpha:1})` vor dem Split.
- **Resize:** bei Breiten-Änderung `tl.kill()`, Text zurücksetzen, neu splitten.
- **GSAP:** GSAP **SplitText** (3.x, inzwischen frei) mit `type:"lines", mask:"lines"` ersetzt SplitType sauber; `yPercent:100→0`.

### H2 — Hero „Value"-Absatz Line-Reveal (`[js-line-animation]`)
- **Element:** `p.hero-value-display-text` (`data-delay="0.2"`, `data-stagger="0.5"`, kein `data-speed` → default `0.7`)
- **Trigger/Mechanik:** identisch H1, aber `duration:0.7`, `stagger.amount:0.5`, `delay:0.2`. Spielt beim Laden (im Viewport).

### H3 — Home-List Text-Reveal (Scroll)
- **Element:** `.home-list_text-wrapper` (Listen-/Feature-Zeilen; Kind-Elemente Label + Text)
- **Trigger:** `SCROLL_INTO_VIEW` (e-118, `a-50`, „Home list item scroll [in]") — alle Breakpoints, Scroll-Offset 15% (siehe generelle SCROLL_INTO_VIEW-Config).
- **Effekt:** zwei Kind-Elemente gleiten horizontal ein + Fade:
  - Init: Element A `x:-1rem, opacity:0`; Element B `x:+1.5rem, opacity:0`
  - To: beide `x:0, opacity:1`, **1150 ms**, MOVE `outQuart` (→`power3.out`), OPACITY `ease` (→`power1.out`)
- **GSAP:** `ScrollTrigger` + `fromTo`; die zwei Richtungen als zwei Tweens (Label von links, Text von rechts).

### H4 — FAQ-Item Reveal (Scroll)
- **Element:** `.faq_item`
- **Trigger:** `SCROLL_INTO_VIEW` (e-431, `a-107`) — alle Breakpoints
- **Effekt:** `x:-100% → 0%` + `opacity:0 → 1`, **1500 ms**, MOVE `outQuart`, OPACITY `ease`.
- **GSAP:** von links komplett einschieben; ggf. `stagger` über mehrere `.faq_item` per `ScrollTrigger.batch`.

### H5 — Services-Card Fade-in (Scroll)
- **Element:** `.services_card` (nur auf index)
- **Trigger:** `SCROLL_INTO_VIEW` (e-856, `a-119` „Fade in [d.30]") — alle Breakpoints
- **Effekt:** Init `opacity:0, blur(5px), y:1rem` → To `opacity:1, blur(0), y:0`, **800 ms**, `delay: 300 ms`, MOVE `outQuart`, OPACITY/FILTER `ease`.
- **GSAP:** klassisches „reveal-up + de-blur". Delay 0.3 s. → Referenz-Muster **`reveal-up`**.

### H6 — Home-Work-Item Hover (Portfolio-Overlay) — Desktop-only
- **Element:** `.home_work_item` (enthält Bild + Overlay)
- **Trigger:** `MOUSE_OVER`/`MOUSE_OUT` (e-106/e-107, `a-45`/`a-46`) — **nur Desktop** (`mq=main`)
- **Effekt Hover-in:**
  - Overlay: `y:101% → 0%` (**800 ms**, `outQuart`), `opacity:0 → 1` (**600 ms**, `ease`)
  - Bild: `scale:1 → 1.05` (**750 ms**, `outQuart`), `filter: blur(0) → blur(6px)` (**750 ms**, `ease`)
- **Effekt Hover-out (a-46):** Bild `blur→0` + `scale→1` (650 ms); Overlay `y→101%` + `opacity→0` (670 ms, +80 ms Delay auf zweitem Layer).
- **Initial-State (a-45 G0):** Overlay `y:101%, opacity:0`, Bild `scale:1, blur:0`.
- **GSAP:** Hover-Timeline pro Item; Overlay slide-up + Bild-Zoom-Blur. **Hinweis:** Prüfen, ob die „Work"-Section in der Astro-Migration überhaupt bestehen bleibt (work.html ist out-of-scope; auf der Home evtl. eine gekürzte Vorschau).

### I-CTA — CTA-Modal Fade (Custom-JS, nicht IX2/GSAP)
- **Element:** `.cta-modal` (+ `.cta-modal-scroll-container`, `.cta-modal-close`)
- **Öffnen:** Klick auf `[btn-action="cta-modal-open"]` → `display:block`, nach 10 ms `opacity:1`. Auch via URL-Param `?openModal=true` (klickt den Trigger).
- **Schließen:** ESC / Klick auf Backdrop / `.cta-modal-close` → `opacity:0`, nach 500 ms `display:none`.
- **CSS:** `.cta-modal { opacity:0; transition: opacity .3s; display:none; }` → sichtbarer Fade **300 ms** (das 500 ms-`setTimeout` deckt nur das anschließende Ausblenden ab).
- **Migration:** als einfaches Modal mit `opacity`-Transition (300 ms) + Body-Scroll-Lock nachbauen. Kein GSAP nötig. Choices.js-Multiselect + bedingte Formularfelder gehören zum Formular, nicht zur Animation (an Formular-Spec verweisen).

### Finsweet CMS-Load (index)
- `fs-cmsload-element="list"`, `fs-cmsload-mode="load-under"`, `fs-cmsload-stagger="250"` — **eine** CMS-Liste mit „Load-under" (nachladen unter der Liste) und **250 ms Stagger** beim Einblenden neuer Items. Vermutlich die Testimonials- oder Services-Liste. Beim Neubau: entweder statisch alle Items rendern (kein Load-more nötig) oder Load-more mit 250 ms-Stagger-Fade nachbauen. → **Unklarheit:** welche konkrete Liste (Testimonials vs. Services) — im finalen Markup verifizieren.

---

## ueber-mich.html (Über mich)

**Nur Global/Chrome (G1–G6).** Keine `[js-line-animation]`, **keine** Content-Scroll-Reveals im IX2-Matching (die Reveal-Klassen `.home-list_text-wrapper`, `.faq_item`, `.services_card` kommen hier nicht vor).
- → **Unklarheit / verifizieren:** Über-mich wirkt animationsseitig „nackt" (nur Navbar/Footer/Lottie/Button-Glow). Gegen die Live-Seite prüfen, ob dort Content-Reveals sichtbar sind — falls ja, laufen sie über Klassen, die im Export auf dieser Seite fehlen, oder es ist beabsichtigt statisch. Empfehlung: das globale `reveal-up`-Muster (H5) beim Neubau sparsam auf Über-mich-Sektionen anwenden, um Konsistenz herzustellen (Design-Entscheidung mit Team).

---

## all-in-one-coaching.html (AIO)

Zusätzlich zu **allen** Global/Chrome-Interaktionen:

### AIO-1 — Home-List Text-Reveal (Scroll)
- Identisch zu **H3** (`.home-list_text-wrapper`, e-118/`a-50`): Kind-Elemente `x:∓… → 0` + Fade, **1150 ms**, `outQuart`/`ease`.

### AIO-2 — FAQ-Item Reveal (Scroll)
- Identisch zu **H4** (`.faq_item`, e-431/`a-107`): `x:-100% → 0` + Fade, **1500 ms**, `outQuart`.

### AIO-3 — Prozess-Schritt „Marquee" (KEINE Animation)
- `.process-step_marquee` ist trotz Namens **nur ein statischer Flex-Container** (`display:flex; justify-content:space-around`) — **kein** CSS-`@keyframes`, keine Loop-Animation, kein IX2. Nicht als Marquee umsetzen; als statische Icon-/Logo-Reihe übernehmen.

Kein `[js-line-animation]`, kein `.services_card`-Fade auf AIO. CMS-Load (`fs-cmsload…`, 250 ms Stagger) wie index vorhanden.

---

## datenschutz.html & impressum.html (Legal)

**Nur Global/Chrome (G1–G6).** Keine Content-Reveals, keine Line-Animation, keine Lottie-Autoplay-Besonderheiten außer den globalen Social-Icons im Footer. Legal-Seiten = statischer Textblock + Standard-Chrome.

---

## 404.html

**Keine Animationen.** 0 `data-w-id`, 3 Klassen, kein IX2-Match, kein Inline-Animations-Script. Minimalseite (nur Chrome falls Nav/Footer vorhanden — hier faktisch leer).

---

## Nicht aktive / tote Technik im Export (bewusst NICHT migrieren)

- **Lenis Smooth-Scroll:** `lenis.js` wird geladen (`cdn…/lenis@0.2.28`), aber **nie initialisiert** (kein `new Lenis`, kein `raf`-Loop). → Kein Smooth-Scroll, kein Parallax aktiv. `data-speed="1"` am H1 ist **kein** Parallax, sondern der Dauer-Parameter der Line-Animation.
- **Doppelte GSAP-Ladungen:** GSAP wird mehrfach eingebunden (3.15.0 von website-files **und** 3.11.4 von cdnjs). In Astro **einmal** bündeln.
- **`pageshow`-Reload** (bfcache): `if (event.persisted) window.location.reload()` — Legacy gegen zurückgesetzte Transition-States. Nicht nötig, wenn keine Transition migriert wird.
- **Typekit-Loader** (`vqw1kwc`): Font-Loading, keine Animation.

---

## Empfohlene schlanke Gesamt-Architektur (GSAP + ScrollTrigger + SplitText)

Ein **einziges** globales Animations-Modul (`src/scripts/animations.js`), data-attribut-getrieben, `prefers-reduced-motion`-safe. GSAP **einmal** laden. Wiederverwendbare Muster:

### Reveal-Muster (ScrollTrigger, `data-anim`)
Ein `ScrollTrigger.batch` über `[data-anim]`, Standard-Trigger analog Webflow (`start:"top 85%"` ≈ Webflow-Offset 15%). Optional `data-delay`, `data-duration`, `data-stagger`.

| Attribut                     | Quelle (IX2)         | from → to | Default-Dauer / Ease |
|------------------------------|----------------------|-----------|----------------------|
| `data-anim="reveal-up"`      | H5 `a-119`, `a-106`  | `opacity:0, y:16px, blur(5px)` → `opacity:1, y:0, blur(0)` | 800 ms / `power3.out`, opt. `data-delay="0.3"` |
| `data-anim="reveal-left"`    | H4/AIO-2 `a-107`     | `x:-100%, opacity:0` → `x:0, opacity:1` | 1500 ms / `power3.out` |
| `data-anim="reveal-split-x"` | H3/AIO-1 `a-50`      | Label `x:-1rem` + Text `x:1.5rem`, beide `opacity:0` → `x:0, opacity:1` | 1150 ms / `power3.out` |
| `data-anim="lines"`          | H1/H2 line-animation | pro Zeile `yPercent:100` → `0` (SplitText, `mask:"lines"`) | `data-speed`→duration, `data-stagger`, `data-delay`, `power2.out` |

- **`lines`**: GSAP **SplitText** `{type:"lines", mask:"lines"}`; Re-Split bei Resize (`ScrollTrigger.saveStyles` / `matchMedia`). Ersetzt SplitType 1:1.
- **`reveal-*`**: initial per `gsap.set()` (die IX2-„Init-Gruppe"), Endzustand per `to()` beim Scroll-Enter. `once: true` (Webflow `loop:false`).

### Hover-/Interaktions-Komponenten (Desktop-only via `matchMedia("(min-width:992px)")`)
- **`u-hover-blur`** (G2 Footer-Social): `opacity→0.6 + blur(2px)` in 380 ms / zurück 340 ms.
- **`button-glow`** (G4): `mousemove`→`gsap.quickTo` auf `.button-glow-circle` (X `xPercent ±50`, Y `y ±50px`), Center bei `mouseleave`. Nur Desktop.
- **`work-item`** (H6): Hover-Timeline Overlay-slide-up (`y:101%→0`) + Bild `scale 1.05` + `blur(6px)`.
- **`nav-link`** (G1): Wipe-Fill `xPercent:-101→0` / out `→101`, `sine.out`.

### Lottie (G3)
- Separates Mini-Modul: `lottie-web`, Social-Icons Autoplay-once + Replay bei Hover (`goToAndPlay(0)`). Alternativ statische SVGs (Team-Entscheidung, spart Dependency).

### Bewusst weglassen
- Page-Transition-Overlay (auf Scope-Seiten nicht vorhanden), 1100 ms-Link-Delay, Lenis, doppelte GSAP-Ladungen, `pageshow`-Reload. Cookie-Consent-Animationen (G6) nur mit dem gewählten Consent-Tool.

### Struktur-Vorschlag
```
src/scripts/animations.js   // GSAP-Register, matchMedia, reveal-batch, hover-init
src/scripts/lottie-social.js // optional
```
Data-Attribute im Astro-Markup setzen (`data-anim`, `data-delay`, `data-stagger`, `data-speed`) — kein per-Element-JS, ein zentraler Init.
