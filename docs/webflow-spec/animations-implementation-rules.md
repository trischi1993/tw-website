# Animations-Neuaufbau — verbindliche Regeln für alle Agenten

## Quellen (read-only)
- IX2-Decode (WAS animiert wird, exakte Werte): `scratchpad/wf-scripts/ix2-relevant.txt`
  (Cluster-weise; Rohdaten `ix2-data.json`, Element-Map `wid-map.json`).
- IX3-Timeline (Über-mich): `scratchpad/wf-scripts/ix3-data.json`.
- Inline-Custom-Scripts: `scratchpad/wf-scripts/*.js` (index-12 = Line-Anim, bereits portiert).
- Webflow-Export (DOM-Struktur, CSS-Werte, gebackene Initial-Styles):
  `/Users/julian/Downloads/upgreight-Websites/Astro/tristan/tristan-webflow-code/`
  (HTML-Seiten + `css/tristan93.webflow.css`). IMMER konsultieren, wenn Markup-
  Beziehungen unklar sind (Overflow-Wrapper, Spaltenbreiten, is-N-Indizes).

## Semantik-Festlegungen (entschieden, nicht neu ableiten)
- **Easings:** `''`→`none` (linear), `ease`→`'wfEase'`, `easeInOut`→`'wfEaseInOut'`,
  `outQuart`→`'power3.out'`, `inOutQuart`→`'power3.inOut'`, `outSine`→`'sine.out'`,
  `outQuint`→`'power4.out'`. Import aus `src/scripts/motion/util.ts` (EASE).
- **Breakpoints (mq):** main ≥992, medium 768–991, small 480–767, tiny ≤479 →
  `BP` aus util.ts, via `mm.add(...)`. Events gelten NUR in ihren mq!
- **SCROLL_INTO_VIEW:** einmalig (`onEnterOnce(el, offsetPct, cb)`),
  Start = `top ${100-offset}%`. GROUP 0 mit `[group0 = INITIAL STATE]` sofort
  per gsap.set anwenden (innerhalb derselben mm-Bedingung!), GROUP 1+ beim
  Eintritt; Items innerhalb einer Gruppe laufen PARALLEL mit ihren delay/
  duration/easing; mehrere Gruppen (ohne Initial-State-Flag) = sequenziell
  (Gruppe n+1 startet, wenn die längste Tween aus n fertig ist). `ev.loop=true`
  → Gruppen als Endlosschleife (Marquee/Scroll-Line).
- **SCROLLING_IN_VIEW (Scrub):** Keyframes 0–100 % über die Reise des
  Trigger-Elements durch den Viewport → ScrollTrigger `start:'top bottom'`,
  `end:'bottom top'`, `scrub:0.5` (500 ms IX2-Glättung). Zwischen Keyframes
  linear interpolieren (`piecewise`); jenseits geklemmt.
- **MOUSE_MOVE (continuous):** Fortschritt 0..1 relativ zum Element
  (`onMouseProgress`), Werte über `piecewise` mappen, Anwendung per
  `gsap.quickTo(..., { duration: 0.5, ease: 'power2.out' })`. Nur mq main +
  zusätzlich `FINE_POINTER` gaten. Bei mouseleave NICHT zurücksetzen (IX2
  lässt den letzten Wert stehen), außer die Daten sagen anderes.
- **Einheiten:** xValue/yValue mit Unit % ⇒ `xPercent`/`yPercent` (Prozent der
  Eigengröße!), rem/em/px/vw/vh ⇒ `x`/`y` mit Einheit als String (z. B. `'2rem'`).
  S_SIZE ⇒ width/height tweenen (heightUnit AUTO ⇒ auf 'auto' animieren).
- **Tote Actions:** Action-Items mit Target `{}` bzw. `EL-OFFSITE`-Events sind
  No-ops (gelöschte Klassen / nicht migrierte Seiten) — NICHT nachbauen.
  Ebenfalls tot (Selektor existiert auf keiner Live-Seite): a-106 (.heading-2),
  a-18 (.link-block), a-22/a-23 (.splide__slide), a-143.
- **IX3 (nur Timeline):** GSAP-Timeline mit den Rohwerten position/duration
  bauen (Gesamtlänge ≈ 0.24 ergibt sich automatisch), ScrollTrigger auf dem
  1200vh-Track `start:'top bottom' end:'bottom bottom' scrub:0.8` — GSAP mappt
  progress über die Timeline-Eigenlänge (exakt die IX3-Semantik,
  `timeline.progress(clamp01)`). tt:2 = fromTo [von,bis]; tt:1 = from
  (bis = natürlicher Zustand). ease-Index: 0=none, 2='power1.out',
  3='power1.inOut'; ohne ease ⇒ none. stagger {amount, ease, from} wie GSAP.
  splitText chars/words via GSAP SplitText.

## Architektur / Kontrakt
- Jedes Motion-Modul: `src/scripts/motion/<name>.ts`, exportiert
  `init(mm: gsap.MatchMedia): void`, importiert aus `./util`. Der Entry
  `src/scripts/motion.ts` ist FERTIG verdrahtet — Dateinamen exakt einhalten:
  reveals, home-load, home-hero, results, banner, gallery, faq-hover,
  aio-load, module, bonuses, about-load, timeline, interests, footer,
  buttons, glow. (lines existiert bereits.)
- Module müssen ohne ihre Ziel-Elemente still no-op sein (querySelector-Guard).
- **Initialzustände NUR per gsap.set im JS** (nie CSS), und IMMER innerhalb
  derselben matchMedia-Bedingung wie die Animation (Beispiel Footer-Reveal:
  mq main+medium — auf small/tiny darf NICHTS versteckt werden!).
- Scroll-Strecken-Layouts (vh-Tracks, Sticky) nur unter `html.has-motion`
  aktiv (sections.css-Muster beibehalten); ohne JS statisch gestapelt.
- Funktionale Interaktionen (Menü, FAQ-Accordion, Modals, Consent) leben in
  `menu.ts`/`widgets.ts`/`consent.ts` (immer geladen) und müssen unter
  prefers-reduced-motion bedienbar bleiben (Zustände dann instant setzen).
- prefers-reduced-motion: motion.ts ist komplett No-op — nicht zusätzlich gaten.

## Hook-Vokabular (Komponenten stampfen Attribute, Module animieren)
- `data-anim="lines"` (+`data-delay`,`data-stagger`,`data-speed`,`data-replay`) — fertig.
  NUR: Home-Hero-H1 (`data-delay="1"`) und Value-Statement-Text (`data-stagger="0.5"`).
- `data-anim="reveal"` (+`data-delay` Sek., `data-offset` %, Default 16) —
  a-110/a-117/a-119/a-159: set {opacity:0, y:'1rem', blur 5px} → opacity(ease),
  y(outQuart), blur(ease), 0.8 s. a-117 ⇒ delay 0.15; a-119 ⇒ delay 0.3 + offset 0.
- `data-anim="usp-row"` — a-50: Kinder `[data-usp-icon]` (x -1rem) /
  `[data-usp-text]` (x +1.5rem), beide fade, 1.15 s outQuart/ease, offset 15.
- `data-anim="grow-line"` — a-41: width 0→100 %, 2 s outQuart, offset 10.
- `data-anim="faq-item"` — a-107: NUR Kind `[data-faq-top]` opacity 0→1,
  1.5 s ease, offset 15. KEIN x-Slide (der war ein toter Verweis)!
- `[data-glow]` Container + Kind `[data-glow-circle]` — a-141/a-160:
  xPercent/yPercent -50→50, quickTo 0.5 s, mq main + FINE_POINTER.
- `[data-underline]` Container + Kind `.link-underline__line` — a-91/92:
  over: set x -101 % → to 0 (0.3 s outSine); out: to +101 % (0.2 s outSine).
- Nav-Hooks (in Header.astro vorhanden, erhalten!): `[data-nav-logo-text="1|2"]`,
  `[data-nav-logo-line]`, `[data-nav-right]`.
- Alte geratene Hooks (`reveal-up`, `reveal-left`, `reveal-split`, `reveal-x`,
  `fade`, `data-reveal`, `data-line-draw`, `data-split-a/b`, `data-hero-scroll*`,
  `data-results*`, `data-gallery`, `data-banner*`, `data-timeline*`-Altform,
  `data-wipe`) werden von den jeweiligen Ownern ERSETZT/entfernt.

## 1:1-Parität (wichtigste Regel)
- Es wird NUR animiert, was IX2/IX3/Line-Script belegen. Zusatz-Animationen
  aus der alten Implementierung entfernen (Elemente ohne Beleg = statisch
  sichtbar). Im Zweifel Export-HTML nach `data-w-id`/Klassen prüfen.
- Werte (Dauern, Delays, Easings, Distanzen, Offsets, mq) EXAKT übernehmen.
- Barrierefreiheit/Click-to-edit/Progressive Enhancement der Komponenten
  NICHT verschlechtern (aria, sr-only, `edit?.()`-Stamps bleiben).

## Verbote
- KEINE Änderungen an types.ts / sections.ts / Studio-Schemas / Seed /
  editor-blocks / insertables (Kontrakt bleibt). Fehlende Darstellungsdaten im
  Component ableiten (z. B. Jahreszahl in Buchstaben splitten).
- Template-Plumbing (Live-Preview, Zwei-Builds, CSP/SEO) nicht anfassen.
- Shared-Dateien nur in den eigenen, unten zugewiesenen Blöcken editieren;
  vor JEDEM Edit an sections.css/global.css die Datei frisch lesen (parallele
  Agenten!). Bei Edit-Konflikt: neu lesen, erneut versuchen.

## Datei-Ownership
- **A1 (home-hero):** motion/home-load.ts, motion/home-hero.ts;
  HomeHeroSection.tsx; sections.css-Block „Home-Hero".
- **A2a (reveals/chrome-sections):** motion/reveals.ts, motion/banner.ts,
  motion/faq-hover.ts; widgets.ts (nur FAQ-Teil); ValueStatementSection.tsx,
  UspListSection.tsx, ServicesTabsSection.tsx, TestimonialsSection.tsx,
  FaqSection.tsx, SplitCtaSection.tsx, FinalCtaSection.tsx;
  sections.css-Blöcke Value-Statement/USP/Coachings-Tabs/Testimonials/FAQ/
  Split-CTA/Final-CTA.
- **A2b (results/gallery):** motion/results.ts, motion/gallery.ts;
  ResultsSection.tsx, GalleryMarqueeSection.tsx; sections.css-Blöcke
  „Zahlen & Fakten" + „Galerie-Marquee".
- **A3 (aio):** motion/aio-load.ts, motion/module.ts, motion/bonuses.ts;
  VideoHeroSection.tsx, ModuleSection.tsx, BonusesSection.tsx;
  sections.css-Blöcke AIO-Hero/Modul-Block/Bonusse.
- **A4 (about):** motion/about-load.ts, motion/timeline.ts,
  motion/interests.ts; PortraitHeroSection.tsx, TimelineSection.tsx,
  InterestsSection.tsx; sections.css-Blöcke Über-mich-Hero/Timeline/Interessen.
- **A5 (footer/cookie):** motion/footer.ts; Footer.astro, CookieConsent.astro,
  consent.ts (nur Anim-Timings/Choreo).
- **A6 (nav/menu/buttons):** menu.ts, motion/buttons.ts, motion/glow.ts;
  Header.astro, GlowButton.tsx; global.css nur Button-/Link-Underline-/
  Menü-Blöcke.

## Abschluss je Agent
- `npx astro check` laufen lassen; Fehler in EIGENEN Dateien fixen (Fehler
  über fehlende Module anderer Agenten ignorieren und im Report nennen).
- Kurzreport: umgesetzte ActionLists (IDs), bewusste Abweichungen (mit Grund),
  gestampfte Hooks, offene Abhängigkeiten.
