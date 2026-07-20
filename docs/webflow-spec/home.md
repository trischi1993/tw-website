# Spec — Startseite (index.html) · tristanweithaler.com

1:1-Migration Webflow → Astro. Quelle: `tristan-webflow-code/index.html`, `css/tristan93.webflow.css`, `css/webflow.css`.
Seite: `<html lang="de">`, `data-wf-page="6690ef66366329732cd9aeec"`.

**SEO / Head**
- `<title>`: Tristan Weithaler - Südtirols erster Social Media Business Coach
- Meta description (auch og:/twitter:description): „Ich bin Tristan, Social Media Business Coach mit über 8 Jahren Erfahrung. Ich zeige dir, wie du deine Reichweite, Follower und Kunden organisch steigerst und dein Business strategisch über Social Media aufbaust."
- og:title / twitter:title = wie `<title>`; og:image/twitter:image = `.../68b947ba418aeeb65bfd9b31_tristan2.png` (CDN); twitter:card = summary_large_image; og:type = website
- canonical: `https://tristanweithaler.com`
- google-site-verification vorhanden (Content in Spec-Global)

---

## Design-Tokens (aufgelöst, gelten für die ganze Seite)

**Farben**
- Hintergrund primär (Body): `#0c0c0c` (fast-schwarz)
- Hintergrund sekundär (Karten-Innenflächen, FAQ-Antwort): `#1d1d1d`
- Hintergrund tertiär: `#4d5258`
- Text primär: `whitesmoke` (~`#f5f5f5`)
- Text sekundär: `#737373`
- Text tertiär: `#d3d3d3`
- Marke sekundär / Gold (Sterne, Glow): `#806429`
- Marke „main" / Creme (Button-Rand): `#d8d3cc`
- Gold-alt: `#5e4931`
- Rahmen sekundär (Trennlinien, Karten-Border): `#1d1d1d`
- Rahmen primär (helle Linien, z.B. Scroll-Indikator, Link-Underline): `whitesmoke`
- Grau-Abstufungen: gray-200 `#e5e5e5`, gray-300 `#d6d6d6`, gray-700 `#424242`, Icon-Punkt `#686868`

**Typografie**
- Font-Family: `Poppins, Tahoma, sans-serif` (Adobe-Typekit-Kit `vqw1kwc` wird zusätzlich geladen)
- Body-Basis: 1rem / weight 300 / line-height 1.55
- Gewichte in Nutzung: 300 (light, Standard), 400, 500, 600 (semibold), 700 (bold)
- Heading-Skala (Desktop → 767 → 479):
  - h1 / `.heading-style-h1`: 4.65rem → 3rem · weight 300 · lh 1.1 · ls −.03em
  - h2 / `.heading-style-h2`: 2.875rem → 2.25rem → 2rem · weight 400 · lh 1.2 · ls −.02em (ls 0 ab 767)
  - h3: 2.25rem → 2rem · weight 500 · lh 1.175 · ls −.01em
  - h4: 2rem → 1.75rem · weight 500 · lh 1.1875
  - h6 / `.heading-style-h6`: 1.225rem → 1.2rem · weight 500 (h6-Tag 700) · lh 1.375
  - Text-Größen: large 1.25rem→1.125rem · medium 1.125rem→1rem · regular 1rem · small .875rem

**Layout-Grundraster**
- `.padding-global`: padding-left/right 5%
- Container: large 80rem · medium 64rem · small 48rem · max-width-large 37rem (alle zentriert)
- `.padding-section-large`: 7rem → (991) 6rem → (767) 4rem oben/unten
- `.padding-section-xxlarge`: 11rem → 10rem → 6rem
- Spacer (padding-top): small 1.5rem→1.25rem · medium 2rem→1.5rem · large 3rem→(991)2.5rem→(767)2rem · xlarge 4rem→3.5rem→2.5rem · xxlarge 5rem→4.5rem→3rem
- Margin-Utilities: medium 2rem→(991)1.5rem→(767)1.25rem · large 3rem→2.5rem→1.5rem · xxlarge 5rem→4rem→3rem

**Button-System** (2 Typen, seitenweit)
- Primär „button-glow" (Verlaufs-Button): Wrapper mit 1px Padding + Glow-Ring; innen `.button-content-wrapper.gradient-btn` (konischer Gold-Verlauf `#806429`-Töne + Grain-SVG, siehe Chrome-Spec), padding .575rem 1.5rem, radius 10rem. Text `.button-text` (whitesmoke, ls −.02em). Optionales Pfeil-Icon `white-arrow-topright-vector.svg` (Hover: Pfeil-Swap via translate). `.button-glow-circle` (Blur-Glow) nur Desktop, ab 991 ausgeblendet.
- Sekundär `.button.is-secondary`: reiner Textlink (#d3d3d3) mit `.link-underline-line` (1.15px, whitesmoke, per Hover von translateX(-101%) einfahrend).
- Tertiär `.button.is-tertiary`: transparenter Umriss-Button (Border creme `#d8d3cc`, radius 10rem, padding .575rem 1.5rem).

---

## Section-Reihenfolge (in `<main class="main-wrapper">`, oben → unten)

Navbar, Mobile-Menü-Panel, Cookie-Banner (Finsweet), Seiten-Transition → **eigener Agent (Chrome)**, hier nur Andockpunkte.
Danach im `<main>`:

1. `section_home-hero` — Hero (ist `<header>`)
2. `section_home-ph` — Hook-/Value-Absatz
3. `section_results` — „Zahlen & Fakten" (Scroll-Karten)
4. `section_cta` — ALL-IN-ONE Coaching Teaser
5. `section_services` — „Spezifische Coachings" (Tabs + CMS)
6. `section_home-work` — „Bekannt aus" (Marquee)
7. `section_home-list` — „Warum mit mir zusammenarbeiten"
8. `section_reviews` — Testimonials (CMS)
9. `section_standard-layout` (#0-Euro-Angebot) — Instagram Erfolgs-Check
10. `section_faq` — FAQs
11. `cta-modal` (Anfrage-Formular) → **eigener Agent**, docht am Ende von `<main>`
12. `footer.section_footer` → **eigener Agent**

---

## 1 · Hero — Section-Name: `hero`

**Zweck:** Erster Eindruck, Headline + CTA + Titelbild mit Scroll-Reveal.

**Text (wörtlich)**
- H1 (2 Zeilen, unterschiedliche Größen im selben `<h1>`):
  - Zeile 1 (Span `.home-hero-h1-span`, klein): `Südtirols erster`
  - `<br>` Zeile 2 (H1-Basis, groß): `Social Media Business Coach`
- Button (primär, öffnet CTA-Modal): `Coaching anfragen` + Pfeil-Icon
- Scroll-Indikator: dünne vertikale Linie (kein Text)

**Layout**
- `section_home-hero` > `home-hero_component` (Höhe **300vh**, position relative) — treibt Scroll-Reveal.
- `home-hero_content-wrapper`: `position: sticky; top:0; height:100vh`, Grid **1.25fr / 1fr**, align center.
- Links `home-hero_content-left`: max-width 40rem, `margin-left:5vw; margin-right:5rem`, relativ. Enthält H1 → `spacer-large` (3rem) → button-group → Scroll-Linie.
- Rechts `home-hero_content-right`: `position:absolute; inset:0 0 0 auto; width:40%` → Bild-Wrapper full-height, `overflow:clip`.
- **991:** component Höhe auto; content-wrapper wird 1-Spalte, `flex-direction:column`, row-gap 4rem, `padding-top:7rem`, static (kein sticky). content-left margins → 5%. content-right static, width 100%, Bild-Wrapper `padding-top:100%` (quadratisch), Bild height 150% / margin-top −40%.
- **767:** content-wrapper padding-top 6rem; content-left max-width 30rem; Scroll-Linie ausgeblendet.
- **479:** H1 2.9rem; Span 1.5rem; Bild margin-top −40%.

**Typografie**
- H1 `.home-hero-h1`: line-height 1.2; „Social Media Business Coach" nutzt H1-Basis **4.65rem / weight 300 / ls −.03em**; auf 767 → 3rem; auf 479 → 2.9rem.
- Span „Südtirols erster" `.home-hero-h1-span`: **2.25rem / weight 300 / lh 1.4 / ls 0**; 767 → 1.75rem; 479 → 1.5rem.
- Button-Text: whitesmoke, ls −.02em.

**Farben/Flächen**
- Section-BG: `#0c0c0c`. Bild wird anfangs von `home-hero_content-whipe.bg-shade` (Vollfläche `#0c0c0c`, `position:absolute; inset:0`) überdeckt und per Scroll „weggewischt".
- Scroll-Linie `home-hero_scoll-line`: BG whitesmoke, 1px×10rem (Wrapper `overflow:hidden`, unten −14rem).

**Bilder/Medien**
- Titelbild: `images/Titelbild-93-1_1.avif`, `loading="eager"`, `width=1920`, `sizes=100vw`, srcset 500/800/1080w → `Titelbild-93-1_1Titelbild-93-1.avif`, 2440w → `Titelbild-93-1_1.avif`. `.home-hero_image`: object-fit cover, object-position 50% 100% (unten), 100%×100% absolut. Alt: leer.
- Pfeil-Icons Button: `images/white-arrow-topright-vector.svg` (2 Stück für Hover-Swap).

**Interaktionen / Animation**
- H1: `js-line-animation` (`data-speed="1"`, `data-delay="1"`) → GSAP SplitType Zeilen-Reveal (yPercent 100→0).
- Button-group-Wrapper: inline `opacity:0; transform:translate3d(40px,0,0)` → IX2-Einblendung (Trigger-`data-w-id="adf01002-fd69-c74f-3f47-8f1052ac6afe"` auf Button).
- `home-hero_scoll-wrapper`: `data-w-id="1d620f68-33cb-4b02-c1ef-d0146f79c9ca"`, inline `opacity:0`.
- `home-hero_ix-trigger`: `data-w-id="18cc0d92-5a0a-7c41-be40-47f94344dc6b"`, `margin-top:100vh` → Scroll-Trigger für den Whipe/Reveal.
- content-left trägt Node-ID `w-node-_18cc0d92-5a0a-7c41-be40-47f94344dc5c-2cd9aeec` (Grid-Positionierung).
- Button `btn-action="cta-modal-open"` → öffnet CTA-Modal (globales Script).

**Sanity-Vorschlag:** eyebrow (String), headline (String, groß), ctaLabel (String), ctaAction (Modal/Link), heroImage (Bild + Alt).

---

## 2 · Value/Hook-Absatz — Section-Name: `valueHook` (`section_home-ph`)

**Zweck:** Großes Statement direkt unter dem Hero (Autorität + Nutzenversprechen).

**Text (wörtlich):**
> Ich habe Brands mit bis zu 200.000 Followern und über 150 Millionen Views aufgebaut - 100% organisch. Heute zeige ich Menschen und Betrieben, wie sie Social Media gezielt nutzen, um ihre Vision sichtbar zu machen und erfolgreich aufzubauen.

**Layout:** `padding-global` > `container-large` (80rem) > `padding-section-home-ph` (**padding-top 13rem / bottom 5rem**; 991: 11rem/5rem; 767: 7rem/0). `home-ph_component` width 97% (767/479: 100%). Auf 479 zusätzlich `section_home-ph { margin-bottom:-15% }` (überlappt Folgesektion).

**Typografie:** `.hero-value-display-text`: **4.25rem** / weight 300 / lh 1.3 / ls −.01em, Farbe erbt = whitesmoke. 991 → 3.25rem; 767 → 3rem; 479 → 2.2rem.

**Farben:** BG `#0c0c0c`, Text whitesmoke.

**Interaktionen/Animation:** `js-line-animation` (`data-delay="0.2"`, `data-stagger="0.5"`) → GSAP Zeilen-Reveal.

**Sanity-Vorschlag:** valueText (Text, mehrzeilig).

---

## 3 · Zahlen & Fakten — Section-Name: `results` (`section_results`)

**Zweck:** Social Proof mit gestapelten „Beweis"-Screenshots, die beim Scrollen auffächern; großer Titel als gefüllte + Umriss-Ebene.

**Text (wörtlich):** H2 (2 Ebenen, identischer Text): `Zahlen & Fakten`

**Layout**
- `padding-global` > `container-large` > `results_component` (**Höhe 200vh**, relativ, Grid 1fr/1fr).
- `results_content`: `position:sticky; top:0; height:100vh`, flex zentriert. Enthält Titel-Ebenen + Kartenliste.
- Titel: 2× `results_title-wrapper` (absolut, zentriert, `height:18em`, `overflow:hidden`, `container-type:inline-size`):
  - Ebene 1: `h2.results_title-1` (gefüllt, Farbe `#1d1d1d`).
  - Ebene 2 (`z-index-10`): `h2.results_title-1.is-outline` (Fill transparent, `-webkit-text-stroke:3px #1d1d1d`; 991: 2px; 479: 1px).
  - `results_title-1`: font-size **13cqw** (Container-Query-Breite; 767: 12.5cqw), white-space nowrap, lh 1.3.
- `results_list`: flex column, max-width 30rem, relativ. 4 Karten absolut übereinander gefächert:
  - `card-1`: z 4, keine Rotation
  - `card-2`: z 3, `rotate(3deg)`
  - `card-3`: z 2, `rotate(6deg)`
  - `card-4`: z 1, `rotate(9deg)`
  - `.results_card`: aspect 2/3, height **60vh** (991: 24rem, 767: 22rem), flex column.
- **991:** component Grid 1fr/1fr, min-height auto, col-gap 3rem; content height 100svh.
- **767:** component 1-Spalte, row-gap 3rem; title-wrapper margin-top 6rem; results_list sticky top 0, min-height 24.5rem, margin-top 6rem.
- **479:** 1-Spalte; content padding 5%; ix-trigger margin-top 90vh.

**Typografie:** siehe `results_title-1` oben.

**Farben/Flächen:** BG `#0c0c0c`. Titel gefüllt `#1d1d1d`, Umriss-Stroke `#1d1d1d` (beide dunkel → dezenter „geprägter" Titel auf schwarzem Grund). Karten-Bilder mit `filter: drop-shadow(0 3px 6px #000000b3) brightness(70%)`, radius 1rem.

**Bilder/Medien:** `images/1_1.avif`, `2_1.avif`, `3_1.avif`, `4_1.avif` (Analytics-/Statistik-Screenshots, Hochformat). `.results_image`: object-fit contain, width auto / height 100%, radius 1rem. Alt: leer.

**Interaktionen/Animation:** `results_ix-trigger` `data-w-id="6f9798c4-89e5-b44f-0bd5-21f1e96be06c"` (`margin-top:100vh`) → Scroll-getriebenes Auffächern der Karten + Bewegung/Skalierung der Titel-Ebenen (IX2, Dekodierung: Animations-Agent).

**Sanity-Vorschlag:** title (String), cards[] (Bild + Alt, 4 Stück, sortierbar).

---

## 4 · ALL-IN-ONE Coaching Teaser — Section-Name: `ctaAllInOne` (`section_cta`)

**Zweck:** Hauptangebot bewerben, Link zur AIO-Unterseite.

**Text (wörtlich)**
- H2: `ALL-IN-ONE Social Media Coaching`
- Absatz (`text-size-medium text-color-tertiary`):
  > Das Komplettpaket für Selbständige sowie Unternehmen - 1:1 oder in Teams.
  >
  > In meinem All-in-One Coaching lernst du Schritt für Schritt alles, von den Social Media Grundlagen über Strategien für mehr Reichweite, Follower und Kunden bis hin zur professionellen Content-Erstellung.

  (Original: zwei `<br><br>` zwischen den Absätzen.)
- Button (primär): `Mehr erfahren` + Pfeil-Icon → `all-in-one-coaching.html`

**Layout:** `padding-global` > `container-large` > `padding-bottom padding-xhuge` (padding-bottom **8rem**; 991: 6rem; 767: 4rem) > Grid `cta_component` **1.25fr / 1fr**, col-gap 2rem, align center.
- Links `cta_content` (max-width 27rem): H2 → `spacer-small` (1.5rem) → Absatz → `spacer-medium` (2rem) → button-group.
- Rechts `cta_image-wrapper` (relativ, flex zentriert): Bild (width 100%) + dahinter `cta_bg-wrapper` (`z-index:-1; inset:0`) > `cta_bg-blur1`.
- **991:** Grid 1fr/1fr, col-gap 3rem. **767:** 1-Spalte, row-gap 3rem, image-wrapper 80% Breite. **479:** `section_cta { margin-top:-15% }`, image-wrapper 100%.

**Typografie:** H2 = heading-style-h2 (2.875rem→…). Absatz 1.125rem (767: 1rem), Farbe `#d3d3d3`.

**Farben/Flächen:** BG `#0c0c0c`. `cta_bg-blur1`: BG Gold `#806429`, `filter:blur(3rem)`, radius 50%, 50%×50%, `rotate(20deg)` → goldener Glow-Fleck hinter dem Mockup.

**Bilder/Medien:** `images/Digital-Product-Mockup-2.avif` (Produkt-Mockup), `.cta_image` width 100%. Alt: leer. Button-Pfeil `white-arrow-topright-vector.svg`.

**Interaktionen/Animation:**
- H2 `data-w-id="10d94104-7b3a-3d67-f2eb-c6caf4cb28e2"`, inline `opacity:0; filter:blur(5px); transform:translate3d(0,1rem,0)` → IX2 Blur-Up-Reveal.
- button-group-Wrapper inline `opacity:0; transform:translate3d(40px,0,0)` → IX2-Einblendung.

**Sanity-Vorschlag:** heading, bodyRichText (2 Absätze), ctaLabel, ctaLink, image (+Alt).

---

## 5 · Spezifische Coachings — Section-Name: `servicesList` (`section_services`)

**Zweck:** Einzel-Coachings aus CMS, umgeschaltet per Tab nach Zielgruppe.

**Text (wörtlich)**
- H2 (zentriert): `Spezifische Coachings`
- Absatz (`text-size-medium text-color-tertiary`): `Individuelle Einzelcoachings für konkrete Themen und Herausforderungen  – 1:1 oder in Teams.` (Original hat doppeltes Leerzeichen vor „–".)
- Tab 1 (aktiv): `Für Selbstständige`
- Tab 2: `Für Unternehmen`
- Buttons unten: primär `Coaching anfragen` (öffnet CTA-Modal) + sekundär `Kostenloses Erstgespräch buchen` → `https://calendly.com/tristanweithaler/30min` (target _blank)
- **Versteckter Block** (`.hide`, nicht sichtbar, aber im Markup): H6 „Individueller 1:1 Videocall mit mir (1-2 Stunden)" + Absatz „Du hast spezifische Fragen im Bereich Social Media …". → In Migration weglassen oder als deaktiviert markieren.

**Layout**
- `padding-global` > `container-medium` (64rem) > `padding-section-large`.
- Kopf: `text-align-center` > `max-width-large align-center`: H2 → spacer-small → Absatz. Danach `spacer-xxlarge` (5rem).
- Tabs `services_components` (Webflow w-tabs): border 1px `#1d1d1d`, radius 1rem, Grid.
  - Tab-Menü `services_tabs-menu`: Desktop flex nebeneinander (2×). `services_tab-link`: padding 1.5rem 2rem, border-right + border-bottom `#1d1d1d`, Textfarbe sekundär `#737373`; aktiv `.w--current` → Textfarbe whitesmoke, border-bottom transparent. 767: Menü column, border-right entfällt.
  - Tab-Heading `h3.services_tab-heading`: **1.5rem / weight 400 / lh 1.3** (767: 1.325rem). Tab 2 zusätzlich `.inherit-color`.
  - Content `services_tabs-content`: padding-top 3rem (767: 2rem; 479: 1rem).
- Karten `services_card`: Grid **1fr / 4fr** (Bild links, Inhalt rechts), gap 3rem, padding 1.75rem 3rem. 991: 1fr/3.5fr, gap 2.5rem, padding 1.5rem 2rem. 767: **1-Spalte**, padding 1.5rem, Bild 50% Breite.
  - `services_image` (aspect 1:1, radius 1rem, width 100%) + `services_card-content` (flex column, max-width 90%; 991: 100%): H4 `heading-style-h6` (Service-Name) → spacer-small → `p.text-color-secondary` (Beschreibung, `#737373`).
- Nach Tabs: `spacer-large`, versteckter Block, dann `button-group is-center` (2 Buttons).

**CMS-Rendering (Services-Collection, 19 Items)**
- Zwei gefilterte Listen, je Tab eine:
  - **Tab 1 „Für Selbstständige"** → Filter `Kategorie = "Personal Brands & Selbständige"` (11 Items vorhanden).
  - **Tab 2 „Für Unternehmen"** → Filter `Kategorie = "Startups & Unternehmen"` (8 Items).
- **Sortierung:** Feld `Reihenfolge` aufsteigend.
- **Limit:** Live werden **je Tab 8 Karten** gerendert (kein Paging). D.h. Tab 1 zeigt 8 von 11.
- Felder pro Item: `Name des Service` (→ H4), `Beschreibung des Service` (→ Absatz), `Bild zum Service` (→ services_image), `Kategorie` (→ Tab-Filter), `Reihenfolge` (→ Sort), `Name des Service für Formular/Anfrage` (→ CTA-Modal Multi-Select, siehe Modal-Spec).
- Live gerenderte Reihenfolge:
  - Tab 1: Vision & berufliche Ausrichtung · Zielgruppe & Positionierung · Social Media Account Optimierung · Strategien für mehr Reichweite & Follower · Angebote, Produkte & Freebies · Kundengewinnung & Monetarisierung · Content Erstellung & Bearbeitung · Erfolgs-Mindset für Wachstum
  - Tab 2: Allgemeine Social Media Beratung · Zielgruppe & Positionierung · Social Media Account Optimierung · Strategien für mehr Reichweite & Follower · Kundengewinnung & Monetarisierung · Content Erstellung & Bearbeitung · Influencer Marketing Beratung · Mitarbeiter-Ausbildung
- Beispiel-Beschreibung (Item „Allgemeine Social Media Beratung"): „Ihr seid im Bereich Social Media überfordert und wisst nicht, wo ihr anfangen oder weitermachen sollt? Wo lohnt es sich, zu investieren, ohne Geld zu verbrennen und gleichzeitig langfristig zum Erfolg eures Unternehmens beizutragen? …" (volle Texte in `Tristan Weithaler - Services - ….csv`).

**Farben:** BG `#0c0c0c`; Tab-/Kartenrahmen `#1d1d1d`; Beschreibung `#737373`.

**Interaktionen/Animation**
- H2 `data-w-id="6acd2be1-a2ab-4c26-f173-1e8b971fbc30"`, inline `opacity:0; filter:blur(5px); translate3d(0,1rem,0)` → IX2 Blur-Up.
- Tabs = Webflow-Tabs (`data-duration-in="400"`, `data-duration-out="200"`, easing ease). Umschalten Tab 1/2.
- Node-ID am Tab-Menü: `w-node-_6acd2be1-…-1fbc37`.
- Button „Coaching anfragen" `btn-action="cta-modal-open"`.

**Sanity-Vorschlag:** sectionHeading, sectionSubtext, tab1Label, tab2Label, calendlyUrl, ctaLabel; Service-Dokument mit: name, formName, category (2 Optionen), description (Text), image (+Alt), order (Number). Optional: limitPerTab.

---

## 6 · Bekannt aus — Section-Name: `pressLogos` / `knownFrom` (`section_home-work`)

**Zweck:** Medien-/Presse-Referenzen als horizontal scrollende Reihe (Marquee).

**Text (wörtlich)**
- H2 (zentriert): `Bekannt aus`
- 5 Karten-Titel (`h3.home-work_work-title`, über dem jeweiligen Bild):
  1. `Zett am Sonntag`
  2. `Rai Sender Bozen`
  3. `Der Vinschger`
  4. `Südtirol heute`
  5. `Vinschgerwind`
- Button unten (sekundär): `Mehr über mich →` → `ueber-mich.html`

**Layout**
- `section_home-work` (width 100vw, overflow hidden) > `padding-section-large`.
- Kopf: `padding-global` > `container-medium` > `overflow-hidden` > `text-align-center` > H2. Danach `spacer-xlarge`.
- `home_work_component` (data-w-id, flex zentriert, **height 28rem**; 991: 18rem `overflow:scroll`; 767: 20rem; 479: 16rem, overflow hidden).
- `home_work_scroll-wrapper`: **width 180%**, max 182rem, flex → horizontale Reihe (breiter als Viewport → Marquee-Bewegung). 767: `overflow`-Scroll manuell, width auto, gap 5vw, margin 5%.
- `home_work_item` (is-1…is-5): width **30%**, margin 0 1%, radius 1rem, overflow hidden, `cursor:default`. 767: width 70vw, margins 0. Links `href="#"` (rein dekorativ, kein Ziel).
  - `home_work_image-wrapper` (absolut, full) > `home_work_image` (object-fit cover, absolut). 
  - `home-work_text-wrapper` (z1, width 60%, absolut zentriert): H3 white, Basis 2.25rem/weight 500 (991: 1.75rem, 767: 1.9rem, 479: 1.5rem).
- Danach `spacer-large`, dann `spacer-medium` > `button-group is-center` mit Sekundär-Button.

**Bilder/Medien** (jeweils `home_work_image`, cover, Alt leer):
1. `images/Zett-am-Sonntag_1.avif` (srcset 500/800/1080 → `…Zett-am-Sonntag.avif`, 1280 → `…_1.avif`)
2. `images/Rai-Südtirol_1.avif` (srcset analog `Rai-Südtirol`)
3. `images/Der-Vinschger-1_1.avif` (kein srcset)
4. `images/Südtirol-heute-3_1.avif` (srcset `Südtirol-heute-3`)
5. `images/Vinschgerwind-2_1.avif` (srcset `Vinschgerwind-2`)

**Farben:** BG `#0c0c0c`; Titel weiß über abgedunkeltem Bild (Bild trägt eigenen Kontrast; kein separates Overlay im CSS außer Bild selbst).

**Interaktionen/Animation**
- H2 `data-w-id="4caa75a6-2c05-0d40-1b24-fea1381d857c"` (overflow-hidden-Wrapper → Zeilen-/Slide-Reveal).
- `home_work_component` `data-w-id="4caa75a6-2c05-0d40-1b24-fea1381d857f"` → Scroll-getriebene Horizontalbewegung der Reihe (IX2 Marquee). Ab 991 stattdessen nativer Overflow-Scroll.

**Sanity-Vorschlag:** heading, ctaLabel, ctaLink, logos[] (title + image + Alt, sortierbar). (Presse-Items evtl. als kleine CMS-Liste oder statisches Array.)

---

## 7 · Warum mit mir zusammenarbeiten — Section-Name: `whyMe` (`section_home-list`)

**Zweck:** 6 Argumente/USPs in 2-spaltiger Liste mit Trennlinien.

**Text (wörtlich)** — H2: `Warum mit mir zusammenarbeiten`
Liste (fett = `text-weight-semibold`-Span am Zeilenanfang):
1. **8 Jahre Erfahrung** als Social Media Manager, Content Creator, Influencer, Unternehmer und Coach.
2. **Internationale Kurse** im Bereich Social Media Marketing, Brand Building und Online-Business absolviert.
3. **Eigene Marken** und Projekte erfolgreich über Social Media aufgebaut und individuell monetarisiert.
4. **Exclusives Insiderwissen** durch wertvolle Erfahrungen und ein starkes Netzwerk mit Branchenexperten.
5. **Über 100** Menschen und Unternehmen im Bereich Social Media und Markenaufbau geholfen.
6. **Persönliche Betreuung** jedes Kunden, um höchste Expertise und Qualität in den Coachings sicherzustellen.

**Layout**
- `section_home-list overflow-hidden` > `padding-global` > `container-large` > `padding-section-large`.
- Kopf: `margin-bottom margin-xxlarge` (5rem) > `text-align-center` > `max-width-large align-center` > `overflow-hidden` > H2.
- `home-list_grid`: Grid **2 Spalten**, col-gap **6rem**, row-gap 0. 767: col-gap 1.5rem. 479: **1 Spalte**.
- `home-list_item` (flex column, relativ):
  - `home-list_text-wrapper`: flex row, gap 1rem, margin **2.5rem** oben/unten (479: 1.5rem). Icon-Embed (Kreis-SVG r≈6, fill `#686868`, 1rem-Box, margin-top .75rem) + `p.home-list_text`.
  - `home-line`: BG `#1d1d1d`, 100%×1px, absolut unten (Trennlinie unter jedem Item).

**Typografie:** H2 = heading-style-h2. `home-list_text`: **1.5rem** (479: 1.375rem), Farbe `#d3d3d3`; fetter Auftakt weight 600.

**Farben:** BG `#0c0c0c`; Trennlinien `#1d1d1d`; Icon-Punkt `#686868`.

**Interaktionen/Animation**
- H2 `data-w-id="1b7309c1-ff8f-fe86-35e0-8a9b62132efd"` (overflow-hidden → Reveal).
- 6× `home-line` mit `data-w-id` (…`132f07`, `132f0f`, `132f17`, `132f1f`, `132f27`, `132f2f`) → Linien-„Draw"-Animation (Breite 0→100%) beim Scrollen.

**Sanity-Vorschlag:** heading, items[] (boldLead: String, text: String), sortierbar.

---

## 8 · Testimonials — Section-Name: `testimonials` (`section_reviews`)

**Zweck:** Kundenstimmen aus CMS, 3-spaltiges Grid, „mehr laden" + „weiterlesen".

**Text (wörtlich)**
- Banner-Headline (2 Ebenen, gleicher Text): `Nette Worte von aktuellen Kunden`
- „Mehr laden"-Link: `Mehr Testimonials laden`

**Layout**
- `section_reviews` (overflow hidden) > `padding-section-large`.
- `banner-heading-wrapper` (white-space nowrap, flex column, margin-bottom 4rem):
  - `h1.banner-heading-top`: whitesmoke, **7.5rem / weight 300 / lh .8** (991: 4rem; 479: 3rem).
  - `h1.banner-heading-bottom`: gleicher Text, Farbe `#1d1d1d`, `align-self:flex-end` → versetzte dunkle „Schatten"-Kopie (großer Zweizeiler-Effekt, überbreite Laufschrift).
- `padding-global` > `container-large` > `reviews_component`.
- `reviews_collection-list` (CMS): Grid **3 Spalten** (`minmax(15rem,1fr)`×3). 991: 1 Spalte-minmax (Component: 2 Spalten). 767: 1 Spalte. gap 2rem.
- Karte `reviews_content`: border 1px `#1d1d1d`, radius 1rem, padding **2.5rem** (767: 1.5rem), flex column space-between, align-items flex-start.
  - `reviews_rating-wrapper` (margin-bottom 1.5rem): 5× `reviews_rating-icon` Stern-SVG, Farbe Gold `#806429` (`text-color-brand-secondary`), Icon-Box 1.5rem.
  - `reviews_text` (`#d3d3d3`, **1.125rem**; 767: 1rem): Testimonial-Text.
  - `reviews_client`: Bild + Info. 767: column. Bild `reviews_customer-image` (radius 100%, 3rem×3rem, cover). Info: Name (`text-weight-semibold`) + Rolle (`text-size-small text-color-secondary` = .875rem `#737373`).
- Pagination-Wrapper: „Previous" (`.hide`), „Next" = `a.w-pagination-next.reviews_load-more` mit Label „Mehr Testimonials laden" + Underline-Linie; Seitenzähler `.hide`.

**CMS-Rendering (Testimonials-Collection, 32 Items)**
- **Initial gerendert: 3 Karten** (Webflow-Limit). Weitere via Finsweet CMS Load: `fs-cmsload-mode="load-under"`, `fs-cmsload-element="list"`, `fs-cmsload-stagger="250"` → Klick auf „Mehr Testimonials laden" lädt nächste Seite unter die bestehende (250ms Stagger).
- **Sortierung:** Feld `Reihenfolge auf der Webseite` aufsteigend (Items ohne Wert ans Ende).
- Felder: `Testimonial` (→ reviews_text), `Name / Autor` (→ Name), `Tätigkeit / Rolle / Beruf` (→ Rolle), `Autor Bild` (→ customer-image), `Reihenfolge auf der Webseite`.
- Erste 3 (Reihenfolge 1–2): Naomi Kircher (Mentorin & Influencerin, 18.000+ Follower) · Buonomemes (Comedian & Influencer, 700.000+ Follower) · Barbara Prantl (Hobbyköchin & Influencerin, 170.000+ Follower). Volle Liste + Texte in `Tristan Weithaler - Testimonials - ….csv`.
- Bewertung: statisch **5 Sterne** je Karte (keine Rating-Zahl im CMS).

**„Weiterlesen"-Verhalten (Inline-Script, `.reviews_component`)**
- Nach DOM-Load für jedes `.reviews_text`: wenn `textContent.length > 216`, Text bei **216 Zeichen** kürzen → `kurz` + `<span class="dots">...</span>` + verstecktes `<span class="more-text">rest</span>` + `<a class="read-more">weiterlesen</a>`. Klick blendet Rest ein, versteckt Link. Element bekommt Klasse `processed`.
- Silbentrennung aktiv (`hyphens:auto`, lang de). „weiterlesen"-Link: unterstrichen, erbt Farbe, Hover → weiß.
- Nach „Mehr laden": `applyReadMore()` erneut (500ms Delay) für neue Items.

**Farben:** BG `#0c0c0c`; Banner-Top whitesmoke, Banner-Bottom `#1d1d1d`; Sterne Gold `#806429`; Karten-Rahmen `#1d1d1d`.

**Interaktionen/Animation**
- `section_reviews` `data-w-id="f6082040-7061-b282-bbcf-39bb43653e93"` → Banner-Headline-Bewegung (Scroll-Marquee horizontal, IX2).
- `reviews_load-more` `data-w-id="f6082040-7061-b282-bbcf-39bb43653ebd"`.

**Sanity-Vorschlag:** bannerHeading, loadMoreLabel, initialCount (Number, Default 3), readMoreCharLimit (Default 216); Testimonial-Dokument: quote (Text), author (String), role (String), image (+Alt), order (Number). Sterne fix 5 (kein Feld nötig, ggf. rating optional).

---

## 9 · Instagram Erfolgs-Check (0-Euro-Angebot) — Section-Name: `freebieCheck` (`section_standard-layout`, `id="0-Euro-Angebot"`)

**Zweck:** Lead-Magnet/Freebie; Ankerziel des Navbar-Buttons „0 € Angebot" (`/#0-Euro-Angebot`).

**Text (wörtlich)**
- H2: `Finde in 5 Min. heraus, wo dein Instagram noch Potenzial liegen lässt.`
- Button (primär): `Zum kostenlosen Erfolgs-Check!` + Pfeil-Icon → `https://freebies.tristanweithaler.com/instagram-erfolgs-check` (target _blank, rel nofollow)

**Layout**
- `padding-global` > `container-medium` (64rem) > `padding-section-large` > Grid `standard-layout_component` **1.25fr / 1fr**, gap 4rem, align center. 991: 1fr/1fr gap 2rem. 767/479: **1 Spalte**, row-gap 3rem.
- Links `standard-layout_content`: H2 → `margin-top margin-medium` (2rem) → button-group.
- Rechts `standard-layout_image-wrapper` (relativ, flex zentriert; 767: flex-start): `standard-layout_image` width **75%**, radius 1rem (767: 50%, 479: 60%).

**Typografie:** H2 = heading-style-h2 (2.875rem→…).

**Farben:** BG `#0c0c0c`.

**Bilder/Medien:** `images/Erfolgs-Check-Instagram-iPhone.webp` (srcset 500 → `…-p-500.webp`, 521 → Original). object-fit implizit, radius 1rem. Alt leer.

**Interaktionen/Animation**
- H2 `data-w-id="9834938f-8007-f6f1-48d3-9004ff38feac"`, inline `opacity:0; filter:blur(5px); translate3d(0,1rem,0)` → IX2 Blur-Up.
- button-group-Wrapper inline `opacity:0; translate3d(40px,0,0)` → IX2-Einblendung.
- **Anker:** `id="0-Euro-Angebot"` muss erhalten bleiben (Navbar-Button springt hierher).

**Sanity-Vorschlag:** heading, ctaLabel, ctaLink, image (+Alt), anchorId (fix „0-Euro-Angebot").

---

## 10 · FAQs — Section-Name: `faq` (`section_faq`)

**Zweck:** 8 aufklappbare Fragen (Accordion).

**Text (wörtlich)** — H2: `FAQs`
Q/A-Paare (Frage `faq_question-text`, Antwort `p.text-size-medium`; `<br>` = Zeilenumbruch im Original):

1. **Was unterscheidet das ALL-IN-ONE Coaching von den spezifischen Coachings?**
   Das ALL-IN-ONE Coaching ist ein durchdachtes Schritt-für-Schritt Programm mit wertvollen Ressourcen, das dich ganzheitlich von den Grundlagen über Strategien, Erfolgsmessung und Monetarisierung bis hin zur Content-Produktion begleitet. Im Prinzip ist es eine kompakte, praxisorientierte Ausbildung im Bereich Social Media.
   Spezifische Coachings sind hingegen stundenbasiert und fokussieren sich gezielt auf einzelne Schwerpunktbereiche.

2. **Für wen ist das ALL-IN-ONE Coaching Programm geeignet?**
   Für alle, die Social Media ganzheitlich verstehen und eigenständig erfolgreich aufbauen möchten.
   Geeignet für Selbstständige, Unternehmen, Social Media Manager, Influencer und Content Creator sowie für alle, die es noch werden möchten – unabhängig von Branche oder Themengebiet.
   Das Programm ist sowohl für Anfänger als auch für Fortgeschrittene geeignet, da die Inhalte Modul für Modul aufeinander aufbauen und der Schwierigkeitsgrad Schritt für Schritt steigt.

3. **Für wen sind spezifische Coachings geeignet?**
   Für alle, die gezielt einzelne Schwerpunktbereiche vertiefen und optimieren möchten und dabei eine flexible, stundenbasierte 1:1 Begleitung bevorzugen.
   Geeignet für Selbstständige, Unternehmen, Social Media Manager, Influencer und Content Creator aller Art, sowie für alle, die es noch werden möchten – unabhängig von Branche oder Themengebiet.

4. **Behandelst du in deinen Coachings nur Instagram oder auch andere Plattformen?**
   Der Fokus liegt klar auf Instagram, da hier die besten Möglichkeiten für organische Reichweite und nachhaltige Monetarisierung bestehen.
   Die vermittelten Strategien und Methoden lassen sich jedoch problemlos auch auf Plattformen wie Facebook, TikTok oder YouTube Shorts übertragen.

5. **Behandelst du in deinen Coachings auch bezahlte Werbeanzeigen?**
   Der Schwerpunkt liegt auf dem organischen Social Media Aufbau, da dies ganz klar mein Expertenbereich ist.
   Bezahlte Werbeanzeigen werden ergänzend angesprochen, stehen jedoch nicht im Mittelpunkt der Coachings.

6. **Was kostet das ALL-IN-ONE Coaching Programm?**
   Das ALL-IN-ONE Coaching ist ein intensiv begleitetes Premium-Programm.
   Die genaue Investition besprechen wir transparent im persönlichen Erstgespräch nach deiner Bewerbung, da wir zunächst prüfen, ob das Programm optimal zu dir oder deinem Unternehmen passt.

7. **Was kosten die spezifischen Coachings?**
   Die spezifischen Coachings sind stundenbasiert aufgebaut.
   Die Investition richtet sich nach den gewünschten Bereichen und dem Umfang und wird transparent im persönlichen Erstgespräch nach deiner Anfrage bzw. Bewerbung besprochen.

8. **Wie läuft der Bewerbungsprozess ab?**
   Du bewirbst dich über das Formular auf der Website.
   Ich prüfe deine Bewerbung persönlich und lade dich bei Passung zu einem kostenlosen Erstgespräch per Videocall ein.
   In diesem Gespräch finden wir gemeinsam heraus, in welcher Form wir deine Ziele bestmöglich erreichen und zu welchem Zeitpunkt ein Start im Coaching möglich wäre.

**Layout**
- `padding-global` > `container-large` > `padding-section-large`.
- Kopf: `margin-bottom margin-large` (3rem) > `max-width-large` > `overflow-hidden` > H2.
- `faq_component` > 8× `faq_item` (flex column, relativ, overflow hidden):
  - `faq_top` (z1, flex row space-between, cursor pointer, **min-height 6.5rem**; 991: padding .5rem .5rem .5rem 1rem): `faq_question-wrapper` > `faq_question-text` + `faq_plus-icon-wrapper`.
  - `faq_plus-icon-wrapper`: BG **weiß**, radius .5rem, **3.5rem×3.5rem** (767: 2.5rem), Hover-Transition. Enthält `faq_icon-horizontal-line` + `faq_icon-vertical-line` (je `#424242`, 1.5rem) → Plus, das beim Öffnen zu Minus wird.
  - `home-line` (Trennlinie `#1d1d1d`).
  - `faq_bottom` (z2, BG `#1d1d1d`) > `faq_answer-wrapper` (max-width 53rem, Farbe `#e5e5e5`, padding **3.75rem 6rem**; 767: 3rem; 479: 1.75rem).
  - `faq_whipe` (z0, BG `#1d1d1d`, 100%×6.8em; 479: 30em) → Ausklapp-Fläche/Maske.

**Typografie:** H2 = heading-style-h2. `faq_question-text`: **1.75rem** / Farbe `#d3d3d3` / ls −.025em (991/767: 1.5rem; 479: 1.4rem). Antwort `text-size-medium` (1.125rem→1rem), Farbe `#e5e5e5`.

**Farben:** BG `#0c0c0c`; Plus-Icon-Box weiß mit `#424242`-Linien; Antwort-Fläche `#1d1d1d`.

**Interaktionen/Animation**
- Alle 8 `faq_item` tragen `data-w-id="cf877d6e-6126-36f8-6590-62a62c621a27"` → Accordion-Toggle (Höhe der Antwort + Plus→Minus-Rotation + `faq_whipe`-Reveal). IX2, Dekodierung durch Animations-Agent. Verhalten prüfen: vermutlich unabhängig aufklappbar (nicht exklusiv, da identische ID pro Item).

**Sanity-Vorschlag:** heading, items[] (question: String, answer: Text/RichText), sortierbar.

---

## Andockpunkte (Detail = andere Agenten)

- **Navbar** (`nav.navbar`): Logo „Tristan|Weithaler" (Desktop) / „T|W" (Mobile) → `index.html`; Desktop-Links: „Zum E-Book" (`https://ebook.tristanweithaler.com/`, _blank), „ALL-IN-ONE Coaching" (`all-in-one-coaching.html`), „Über mich" (`ueber-mich.html`), „Partner" (`.hide`); Burger-Button; Primär-Button „0 € Angebot" → `/#0-Euro-Angebot` (Anker in Section 9). → **Chrome-Agent**.
- **Mobile-Menü-Panel** (`.menu_parent` / `.menu_right-panel`): Links Startseite / Zum E-Book / ALL-IN-ONE Coaching / Über mich mit `White-arrow-button.svg`. → **Chrome-Agent**.
- **Cookie-Banner** (Finsweet `fs-cc`, opt-in): Banner-Text + „Alle akzeptieren"/„Ablehnen"/„Cookie Einstellungen bearbeiten" + Präferenz-Modal (Essentiell/Marketing/Personalisierung/Analysen). → **Chrome-Agent**.
- **CTA-Modal** (`.cta-modal`, docht am Ende von `<main>`): Formular „Coaching anfragen" (Felder: Name, E-Mail, Berufsbezeichnung/Unternehmen, Social Media Link, Coaching-Kategorie-Radios ALL-IN-ONE/Spezifische → conditional Personal Brand/Startup → Multi-Select „Coaching-Bereiche" aus Services-CMS via Choices.js, Weitere Infos, GDPR-Checkbox, Submit „Senden"). Öffnet über beliebiges `btn-action="cta-modal-open"` bzw. `?openModal=true`. → **Formular-/Chrome-Agent**. Relevant für Home: die Hero- und Services-Buttons „Coaching anfragen" triggern es.
- **Footer** (`footer.section_footer`): Dolomiten-Bild `Berge-1D1D1D_1`, Logo, Claim „Südtirols erster Social Media Business Coach", Social (IG/LinkedIn Lottie), Nav-Links, E-Mail `info@tristanweithaler.com`, Impressum/Datenschutz. → **Chrome-Agent**.

## Seitenweite Skripte (Kontext, Detail andere Agenten)
- GSAP + SplitText/SplitType + ScrollTrigger (Zeilen-Animation `[js-line-animation]`), Lenis (Smooth Scroll), jQuery, Webflow IX2 (`webflow.js`), Choices.js (Modal-Select, gepinnt 11.2.3), Finsweet cookie-consent + cmsload + scrolldisable, Adobe Typekit `vqw1kwc`.
- Seiten-Transition (`.transition`, intro 1500ms / exit 1300ms) fängt interne Link-Klicks ab (außer `#`, `_blank`, `.no-transition`).
- CTA-Modal Open/Close (Klick/ESC/Overlay), `?openModal=true`.

## Unklarheiten / Prüfpunkte
1. **Services-Limit pro Tab:** Live werden nur 8 Karten je Tab gerendert (Tab 1 hätte 11). Migration: 8er-Limit übernehmen oder alle zeigen? → Empfehlung mit Team klären; als `limitPerTab` konfigurierbar bauen.
2. **Testimonials initial = 3:** Webflow-Limit 3 + „Mehr laden". In Astro ohne Finsweet nachbauen (z.B. initial 3, Rest per Button/JS einblenden) oder alle 32 direkt rendern? Read-more-Kürzung (216 Zeichen) beibehalten.
3. **„Bekannt aus"-Karten** verlinken auf `href="#"` (dekorativ, `cursor:default`) — als nicht-klickbare Elemente migrieren.
4. **Marquee vs. Scroll:** `home_work` und Reviews-Banner sind IX2-Scroll-Animationen (kein CSS-Loop). Genaue Kurve klärt Animations-Agent; ab 991 wird `home_work` nativer Horizontal-Scroll.
5. **Versteckter Block in Services** („Individueller 1:1 Videocall …", `.hide`) — im Export vorhanden, aber unsichtbar. Standardmäßig weglassen.
6. **Doppelte Leerzeichen / Bindestrich-Varianten** im Copy (z.B. Services-Subtext „Herausforderungen  – 1:1", CTA „Selbständige sowie Unternehmen - 1:1") 1:1 übernehmen oder beim Seed säubern? → Empfehlung: beim Seed leicht normalisieren, mit Team abstimmen.
7. **Sterne-Rating** ist statisch 5 (kein CMS-Feld) — so übernehmen.
