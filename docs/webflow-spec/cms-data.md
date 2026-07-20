# CMS-Daten: Services & Testimonials

Quelle: Webflow-CMS-Exporte (CSV) aus `tristan-webflow-code/`. Normalisiert nach
`specs/data/services.json` und `specs/data/testimonials.json`.

## Services (`services.json`)

**19 Items gesamt** — 16 aktiv (nicht draft, nicht archived), 3 Draft, 0 archiviert.

Kategorien (Kategorie-Feld, 2 Werte, kein freies Textfeld):
- Personal Brands & Selbständige: 11 Items
- Startups & Unternehmen: 8 Items

Draft-Items (nicht live, kein `Published On`):
- „Social Media Manager Ausbildung" (`ausbildung-zum-social-media-manager`)
- „Strategien für eine erfolgreiche Kundengewinnung" (`strategien-fur-eine-erfolgreiche-kundengewinnung`)
- „Vom Content Creator/Influencer zum Unternehmer" (`vom-content-creator-influencer-zum-unternehmer`)

### Feld-Semantik
- `name` — Service-Titel (Anzeigename)
- `slug` — URL-Slug
- `category` — Zielgruppen-Segment: "Startups & Unternehmen" (Sie/Ihr-Ansprache) vs. "Personal Brands & Selbständige" (Du-Ansprache)
- `formName` — Name für Formular/Anfrage; laut Spaltenbeschreibung bewusst gekürzt, wenn der Service-Name zu lang ist (z. B. „Erfolgreiche Kundengewinnung" statt „Strategien für eine erfolgreiche Kundengewinnung")
- `description` — Fließtext-Beschreibung, 288–392 Zeichen, alle in ähnlicher Länge (keine Ausreißer)
- `imageUrl` — Webflow-CDN-URL (immer `cdn.prod.website-files.com`)
- `localImage` — lokaler Pfad relativ zu `tristan-webflow-code/`, oder `null`
- `order` — Reihenfolge (Ganzzahl), sortiert das JSON-Array
- `draft`, `archived` — Booleans
- `webflowItemId` — zusätzlich mitgeführt (nicht in der ursprünglichen Feldliste verlangt, aber nützlich als stabiler Referenzschlüssel für spätere Sanity-Migration/Idempotenz)

### Auffälligkeiten
- **Inhalte sind bewusst dupliziert pro Zielgruppe.** 5 Service-Themen existieren als Zwillingspaar mit fast identischem Text, aber unterschiedlicher Anrede und eigenem Slug — nur die Ansprache ändert sich (Du/dich vs. Ihr/euch): „Zielgruppe & Positionierung", „Social Media Account Optimierung", „Strategien für mehr Reichweite & Follower", „Kundengewinnung & Monetarisierung", „Content Erstellung & Bearbeitung". Beide Zwillinge eines Paares teilen sich dasselbe Bild (5 doppelt verwendete `imageUrl`-Werte).
- **`order` ist nicht global eindeutig**, sondern nur innerhalb einer Kategorie sinnvoll (z. B. beide „Social Media Account Optimierung"-Varianten haben `order: 3`, je einmal pro Kategorie). Eine reine `order`-Sortierung über beide Kategorien hinweg ergibt keine stabile Gesamtreihenfolge — das JSON ist trotzdem stur nach `order` sortiert, wie angefordert.
- Keine leeren Pflichtfelder, keine echten Wortdopplungen außer dem oben beschriebenen Zwillings-Pattern.

## Testimonials (`testimonials.json`)

**32 Items gesamt** — alle aktiv (0 Draft, 0 archiviert).

Kein Kategorie-Feld vorhanden (anders als bei Services).

### Feld-Semantik
- `name` — Name/Autor (bei zwei Einträgen ist es ein Unternehmens-/Projektname statt Personenname: „Buonomemes", „Barbara & Lorena")
- `slug` — URL-Slug (2x mit `-2`-Suffix: `sarah-ellemunt-2`, teils weil ein früherer/archivierter Eintrag denselben Slug belegt hat — dieser ist im aktuellen Export aber nicht mehr enthalten)
- `testimonial` — Fließtext, 216–1570 Zeichen, große Spannweite
- `role` — Tätigkeit/Rolle/Beruf des Autors bzw. Unternehmenskontext
- `imageUrl` — Webflow-CDN-URL (immer `cdn.prod.website-files.com`)
- `localImage` — lokaler Pfad oder `null`
- `order` — Reihenfolge auf der Webseite (Ganzzahl oder `null`)
- `draft`, `archived` — Booleans
- `webflowItemId` — zusätzlich mitgeführt (siehe oben)

### Auffälligkeiten
- **1 Item ohne `order`-Wert**: „Friedrich Moosmair" (neuester Eintrag, erstellt 2026-07-08) hat ein leeres Reihenfolge-Feld → `order: null`, im JSON ans Ende sortiert.
- **`order` ist nicht eindeutig**: mehrere Testimonials teilen sich denselben Wert (`2` ×2, `4` ×3, `5` ×3, `9` ×2, `10` ×2, `20` ×2). Anders als bei Services gibt es kein Kategorie-Feld, das die Kollision erklärt — die Reihenfolge scheint manuell gepflegt und nicht durchgängig konsistent.
- **Whitespace bereinigt**: Rohdatensatz „Marlies " (Slug `resmairhof`) hatte ein Leerzeichen am Namensende — im JSON getrimmt.
- **Sehr lange Texte**: „Alexia Milesi" (1570 Zeichen), „Simon Minesso" (1252), „Daniel Felderer aka „Feldi““ (1145) deutlich länger als der Durchschnitt (~450) — ggf. für Kartenlayouts kürzen/truncaten.
- Mehrzeilige Testimonials mit eingebetteten Zeilenumbrüchen (`\n`) kommen vor, u. a. bei „Barbara & Lorena", „Bettina Wild", „Marlies", „Simone & Martin" (z. B. Namens-Signatur am Textende) — beim CSV-Parsing korrekt als eine Zelle erhalten geblieben.
- Keine Duplikate bei Namen; keine leeren Pflichtfelder außer dem `order`-Fall oben.

## Bild-Referenzen (beide Collections)

Alle `imageUrl`-Werte sind Webflow-CDN-URLs (`https://cdn.prod.website-files.com/...`), keine lokalen/relativen Pfade.

**Lokaler Abgleich gegen `tristan-webflow-code/images/` (134 Dateien):**
- Services: nur **1 von 14 eindeutigen Bildern** lokal vorhanden — „Vision & berufliche Ausrichtung" (`Visionsfindung 1.avif` → lokal `images/Visionsfindung-1_1Visionsfindung 1.avif`). Zufallstreffer: dieselbe Datei wird zusätzlich direkt (nicht über die CMS-Bindung) in `index.html` verwendet, deshalb hat der Webflow-Static-Export sie mit heruntergeladen.
- Testimonials: **0 von 32 Autor-Bildern** lokal vorhanden.

**Grund:** Der Webflow-Static-Export lädt nur Assets herunter, die direkt in den exportierten statischen Seiten referenziert sind. CMS-Collection-Items selbst werden nicht als einzelne Seiten exportiert (nur je eine generische Vorlage `detail_service.html` / `detail_testimonial.html` ohne gebundene Bild-URLs) — die Service- und Testimonial-Bilder aus den CSVs wurden dadurch nie heruntergeladen.

**Konsequenz für die Astro/Sanity-Migration:** Die tatsächlichen Bilder müssen direkt von den Webflow-CDN-URLs bezogen werden (diese sind i. d. R. dauerhaft erreichbar), nicht aus dem lokalen `images/`-Ordner. `localImage` ist in fast allen Fällen `null` — kein Bug im Skript, sondern korrekt fehlende lokale Kopie.
