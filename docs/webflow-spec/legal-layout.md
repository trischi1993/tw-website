# Layout-Spec: Datenschutz, Impressum, 404

Quellen: `datenschutz.html`, `impressum.html`, `404.html`, CSS: `css/tristan93.webflow.css` (+ `webflow.css` core, `normalize.css`).

## 1. Datenschutz + Impressum — gemeinsames Layout

Beide Seiten sind strukturell identisch aufgebaut: globaler Navbar → `<header class="section_legal-header">` (Seitenkopf) → `<section class="section_legal-content">` (Rechtstext) → globaler Footer + globales CTA-Modal ("Coaching anfragen", gleiche Komponente wie auf anderen Seiten, hier nicht seitenspezifisch).

### 1.1 Seitenkopf / Hero (`section_legal-header`)

```html
<header class="section_legal-header">
  <div class="padding-global">
    <div class="container-large">
      <div class="padding-section-large">
        <div class="max-width-large">
          <div class="margin-bottom margin-small">
            <h1>Datenschutz</h1> <!-- bzw. "Impressum" -->
          </div>
          <p class="text-size-medium">Aktualisierungs-Datum: 01. September, 2024</p>
        </div>
      </div>
    </div>
  </div>
</header>
```

- **Container:** `padding-global` (5% Seitenpadding links/rechts) → `container-large` (max-width 80rem, zentriert) → `padding-section-large` (Section-Innenabstand oben/unten: Desktop 7rem, Tablet 6rem, Mobile 4rem).
- **Textspalte:** `max-width-large` beschränkt Titel + Datumszeile auf **37rem** (schmale, linksbündige Spalte am Seitenanfang — nicht die volle Containerbreite).
- **H1:** globaler `h1`-Stil — 4.65rem/300 Gewicht/Letter-Spacing -0.03em/Line-height 1.1 (Farbe erbt von `body`: `--text-color--text-primary` = `whitesmoke`, nahezu Weiß, auf `--background-color--background-primary` = `#0c0c0c`, nahezu Schwarz). `margin-bottom margin-small` = 1rem Abstand zur Datumszeile darunter.
- **Datumszeile:** `<p class="text-size-medium">` — reines "Aktualisierungs-Datum: 01. September, 2024", auf beiden Seiten identisches Datum.
- Kein Bild, kein Breadcrumb, keine Deko — reiner Text-Hero, dunkler Hintergrund (Site-Default: fast schwarz).

### 1.2 Content-Bereich (`section_legal-content`)

```html
<section class="section_legal-content">
  <div class="padding-global">
    <div class="container-large">
      <div class="padding-section-small">
        <div class="legal-content_component">
          <div fs-toc-element="contents" class="text-rich-text w-richtext">
            <!-- h2/h3/h4/p/ul -->
          </div>
        </div>
      </div>
      <div class="spacer-xhuge"></div>
    </div>
  </div>
</section>
```

- **Container:** wieder `padding-global` + `container-large` (80rem), aber **kein** `max-width-large`-Wrapper um den Rich-Text — `legal-content_component` hat keine eigene CSS-Klasse mit Breitenbegrenzung. **Der Fließtext läuft über die volle Containerbreite (~80rem / bis zu ~1280px), nicht auf eine schmalere Lesespalte begrenzt.** Das ist bei Datenschutz mit sehr langem Text ungewöhnlich breit für Fließtext — bei der Astro-Umsetzung empfehlenswert, den Rich-Text-Body optional auf eine lesefreundlichere Spalte (z. B. `max-width-large`/`max-width-medium`, ~35–37rem, oder mind. `max-width-xlarge` 64rem) einzuschränken, auch wenn das vom Original abweicht. Falls 1:1-Treue Priorität hat: volle Containerbreite beibehalten.
- **Section-Padding:** `padding-section-small` (Desktop 3rem, Tablet 3rem, Mobile 2rem oben/unten).
- **Abschluss:** `spacer-xhuge` (7rem/6rem/4rem Top-Padding als reiner Spacer) nach dem Content-Block, vor Footer.
- **`fs-toc-element="contents"`**: Finsweet-Attribut für ein automatisch generiertes Inhaltsverzeichnis — im HTML vorhanden, aber es gibt **keinen sichtbaren TOC/Sidebar-Nav-Block** im DOM dieser Seiten (kein `fs-toc-element="list"` o. ä. gefunden). Das Attribut scheint ungenutzt/Restbestand einer Finsweet-Komponente ohne zugehöriges TOC-UI. Kann in Astro ignoriert werden.

### 1.3 Typografie des Rechtstexts (`.text-rich-text` + globale Heading-Styles)

`.text-rich-text` selbst setzt **nur Margins**, keine Font-Größen — die Größen kommen von den globalen `h1`–`h6`/`p`-Regeln (gelten sitesweit, auch für Hero-Headlines). Das ergibt für Rechtstext ungewöhnlich große Zwischenüberschriften:

| Ebene | Font-Size | Weight | Line-height | Letter-spacing | Margin (in `.text-rich-text`) |
|---|---|---|---|---|---|
| h1 (nur Seitenkopf, nicht im Rich-Text) | 4.65rem | 300 | 1.1 | -0.03em | — |
| h2 | 2.875rem | 400 | 1.2 | -0.02em | margin-top 1.5rem, margin-bottom 1rem |
| h3 | 2.25rem | 500 | 1.175 | -0.01em | margin-top 1.5rem, margin-bottom 0.75rem |
| h4 | 2rem | 500 | 1.1875 | — | margin-top 1.25rem, margin-bottom 0.75rem |
| p | 1rem (Body-Default) | 300 | 1.55 (Body-Default) | — | margin-bottom 1rem |
| ul/li | Standard-Browser-Aufzählung, `w-richtext ul` (Webflow-Default-Listeneinzug) | — | — | — | — |

- **Farbe:** Fließtext erbt `--text-color--text-primary` (whitesmoke) vom `body` — kein eigener Textfarb-Override im Rich-Text.
- **Links (`<a>`)** innerhalb des Rich-Texts: **keine eigene Linkfarbe/Unterstreichung definiert** — global gilt nur `a { text-decoration: none }`, keine `color`-Regel für `a` oder `.text-rich-text a` gefunden. Das bedeutet, Links im Rechtstext rendern vermutlich in Browser-Default-Blau ohne Unterstreichung — wirkt wie eine Lücke im Design-System, nicht bewusst gestaltet. **Empfehlung für Astro:** bewusste, zum Dark-Theme passende Linkfarbe setzen (z. B. Akzentfarbe der Site oder ein dezentes Unterstreichen), statt den vermutlich unbeabsichtigten Browser-Default zu übernehmen.
- **Fett (`<strong>`)** kommt im Datenschutztext genau einmal vor (Abschnitt "Speicherdauer" unter Newsletter: "Sie können der Speicherung widersprechen…") — Standard-Bold, keine Sonderfarbe.
- **Auffällige Inhalts-Eigenheit:** Der Abschnitt "Widerspruchsrecht gegen die Datenerhebung…" (Art. 21 DSGVO) ist **komplett in Versalien (ALL CAPS)** gesetzt — das ist Standard-Formulierung der DSGVO-Textbausteine, kein CSS-`text-transform`, sondern so im Text selbst geschrieben. 1:1 beibehalten.
- **Leerabsätze als Spacer:** Im Quelltext trennen sehr viele `<p>‍</p>` (nur Zero-Width-Joiner) die Blöcke voneinander — offenbar manuell in Webflow eingefügte visuelle Lücken zusätzlich zu den Heading-Margins. Diese Leerabsätze wurden in den Content-Markdown-Dateien nicht 1:1 nachgebildet; stattdessen sollte die Astro-Komponente die Abstände über die Heading/Paragraph-Margins selbst lösen (sauberer als leere Absätze zu duplizieren).
- **Datumszeile-Klasse `text-size-medium`:** kleinere Schriftgröße als Body-Text für das "Aktualisierungs-Datum"-Label (sekundär/dezent gegenüber H1).

### 1.4 Abstände / Sonstiges

- Beide Seiten sind `noindex` (Meta-Robots) — bewusst von Google ausgeschlossen. Für die Astro-Migration prüfen, ob das beibehalten werden soll (typisch für Legal-Seiten, aber teils auch versehentlich gesetzt bei Webflow-Exports — Rücksprache empfohlen, hier nicht automatisch übernehmen ohne Hinweis).
- Beide Seiten teilen sich exakt denselben Cookie-Consent-Block (siehe 1.5) und dasselbe globale CTA-Modal "Coaching anfragen" (Formular, nicht Teil der Legal-Inhalte — wird vermutlich von anderen Spec-Agents für die Formulare abgedeckt).
- Footer-Legal-Zeile (`footer_legal-paragraph`, auf beiden Seiten sichtbar): `Impressum • Datenschutz` als interne Links, mit `aria-current="page"`/`w--current` auf der jeweils aktiven Seite.

### 1.5 Cookie-Consent-Komponente (Finsweet `fs-cc`, identisch auf beiden Legal-Seiten)

Eingebunden per `<script async src="https://cdn.jsdelivr.net/npm/@finsweet/cookie-consent@1/fs-cc.js" fs-cc-mode="opt-in">` im `<head>`. DOM-Struktur (`.fs-cc-components`):

1. **Banner** (`fs-cc="banner"`, unten fixiert): Text „Wenn Sie auf **„Alle Cookies akzeptieren""** klicken, stimmen Sie der Speicherung von Cookies auf Ihrem Gerät zu, um die Navigation auf der Website zu verbessern, die Nutzung der Website zu analysieren und unsere Marketingaktivitäten zu unterstützen. Weitere Informationen finden Sie in unserer [Datenschutzrichtlinie](datenschutz.html)." + Buttons „Alle Cookies akzeptieren" (`fs-cc="allow"`, Glow-Button-Stil) und „Ablehnen" (`fs-cc="deny"`, tertiärer Button) + Link „Cookie Einstellungen bearbeiten" (`fs-cc="open-preferences"`).
2. **Permanentes Manager-Icon** (`.cookie-manager-icon-wrapper`, `fs-cc="manager"` → `fs-cc="open-preferences"`): schwebendes Icon, jederzeit klickbar, um die Präferenzen erneut zu öffnen.
3. **Präferenzen-Panel** (`fs-cc="preferences"`, Formular `#cookie-preferences`): Titel „Datenschutzpräferenzen", Erklärtext, Buttons „Alle Cookies ablehnen" / „Alle Cookies akzeptieren", dann 4 Kategorien mit Toggle:
   - **Essentiell** — immer aktiv, kein Toggle, nur Hinweistext „Diese Elemente sind erforderlich, um die Grundfunktionen der Website zu ermöglichen."
   - **Marketing** — Checkbox `fs-cc-checkbox="marketing"`, Beschreibungstext zu Werbe-Relevanz/Kampagnenmessung.
   - **Personalisierung** — Checkbox `fs-cc-checkbox="personalization"`, Beschreibungstext zu Spracheinstellungen/lokalen Inhalten.
   - **Analysen** — Checkbox `fs-cc-checkbox="analytics"`, Beschreibungstext zu Nutzungsverhalten-Analyse.
   - Abschluss-Button „Speichern" (`fs-cc="submit"`).
   - *Kleiner Bug im Export:* Die Checkbox-Labels bei Marketing/Personalisierung/Analysen zeigen im Markup den Text „Essential" statt einer Kategorie-eigenen Beschriftung (`<span class="... w-form-label">Essential</span>`) — vermutlich Copy-Paste-Fehler beim Duplizieren der Felder in Webflow. Für die Astro-Neuimplementierung korrekt beschriften statt 1:1 den Fehler übernehmen.

**Kernbefund:** Beide Legal-Seiten verweisen auf ein Cookie-/Consent-System mit vier Kategorien (Essentiell/Marketing/Personalisierung/Analysen) und der Datenschutztext in `content-datenschutz.md` beschreibt sehr viele Dienste, die dieses Consent-System theoretisch triggern würde (siehe Abschnitt 2 unten).

## 2. 404-Seite — vollständige Spec

Quelle: `404.html`. Deutlich einfacher als die Legal-Seiten — **kein globaler Navbar, kein Footer, kein Cookie-Banner, kein CTA-Modal.** Reine Utility-Page.

```html
<div class="utility-page-wrap">
  <div class="utility-page-content w-form">
    <img src="https://d3e54v103j8qbb.cloudfront.net/static/page-not-found.211a85e40c.svg" alt="">
    <h2>Page Not Found</h2>
    <div>The page you are looking for doesn't exist or has been moved.</div>
  </div>
</div>
```

- **Texte (Original, Englisch, nicht übersetzt — trotz `lang="de"` und deutscher Site):**
  - Überschrift (h2): **"Page Not Found"**
  - Fließtext: **"The page you are looking for doesn't exist or has been moved."**
  - Kein CTA-Button, kein Link zurück zur Startseite im HTML vorhanden.
- **Bild/Grafik:** Externes Standard-Webflow-SVG von deren CDN: `https://d3e54v103j8qbb.cloudfront.net/static/page-not-found.211a85e40c.svg` (generisches Webflow-404-Icon, kein Custom-Branding, kein Alt-Text gesetzt (`alt=""`)).
- **Styling:** Die Klassen `.utility-page-wrap` und `.utility-page-content` sind in **keiner** der drei mitgelieferten CSS-Dateien (`normalize.css`, `webflow.css`, `tristan93.webflow.css`) definiert oder überschrieben. Das bedeutet: Auf der Live-Seite hat diese 404-Seite **keinerlei site-spezifisches Styling** — kein dunkles Theme, keine Brand-Typografie, kein Navbar/Footer/Logo. Sie rendert im Wesentlichen mit Browser-Defaults (Webflows interne `.w-form`-Basisstile evtl. minimal wirksam), optisch komplett losgelöst vom Rest der Website.
- **Meta:** `<title>Not Found</title>`, `og:title`/`twitter:title` = "Not Found", **keine Meta-Description**, kein `robots`-Meta-Tag (im Gegensatz zu den Legal-Seiten kein explizites `noindex`), Canonical `https://tristanweithaler.com/404`.
- Enthält denselben Satz an globalen `<script>`-Includes (jQuery, Webflow.js, GSAP, CTA-Modal-Handler, Formular-JS, Lenis-Smooth-Scroll etc.) wie alle anderen Seiten, obwohl auf dieser Seite kein Modal/Formular/Scroll-Effekt sichtbar zum Einsatz kommt — reines Boilerplate aus dem globalen Footer-Script-Block, keine funktionale Relevanz für die 404-Seite selbst.

**Empfehlung für Astro-Migration:** Die 404-Seite ist im Original bewusst (oder unbewusst) minimal/ungebrandet. Da für die neue Astro-Site vermutlich ein durchgängiges Markendesign gewünscht ist (dunkles Theme, Navbar/Footer, evtl. CTA "Zurück zur Startseite"), sollte hier — anders als bei den zwei Legal-Seiten — kein 1:1-Redesign, sondern eine bewusste Entscheidung getroffen werden: entweder das minimalistische Original-Verhalten beibehalten oder (empfohlen) die Seite ins Site-Chrome (Navbar/Footer) einbetten und einen Rücksprung-Link ergänzen, da das Original hier keinen bietet.

## 3. Zusammenfassung Design-Tokens, die hier relevant sind

- Hintergrund (global/dark): `--background-color--background-primary` = `#0c0c0c`
- Text (global): `--text-color--text-primary` = `whitesmoke`
- Sekundärtext: `--text-color--text-secondary` = `#737373`
- Schriftfamilie: `Poppins, Tahoma, sans-serif` (Body, Weight 300, Size 1rem, Line-height 1.55)
- Container-Breite: `container-large` = max-width 80rem, `padding-global` = 5% Seitenrand
- Schmale Textspalte: `max-width-large` = 37rem (nur im Seitenkopf verwendet, nicht im Rich-Text-Body)
