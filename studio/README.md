# Sanity Studio

Das **Redaktionssystem (CMS)** für die Website. Hier werden alle Inhalte
gepflegt: Texte, Bilder, Kontaktdaten, Galerien. Die Website (Astro) holt sich
die veröffentlichten Inhalte aus diesem Studio.

Das Studio ist eigenständig (eigener Ordner, eigene `package.json`) und kann
unabhängig von der Website gestartet und veröffentlicht werden.

---

## Inhalt

- [Was ist hier was?](#was-ist-hier-was)
- [Einmalige Einrichtung](#einmalige-einrichtung)
- [Täglicher Betrieb: Inhalte pflegen](#täglicher-betrieb-inhalte-pflegen)
- [Studio veröffentlichen](#studio-veröffentlichen)
- [Studio mit der Astro-Website verbinden](#studio-mit-der-astro-website-verbinden)
- [Automatischer Website-Neuaufbau beim Veröffentlichen (Webhook)](#automatischer-website-neuaufbau-beim-veröffentlichen-webhook)
- [Hinweis zu den Bildern](#hinweis-zu-den-bildern)

---

## Was ist hier was?

In der linken Spalte des Studios gibt es die Gruppe **Website** mit:

- **Startseite**: je Sprache eine (**Deutsch** / **English**), aus Abschnitten
  zusammengesetzt. Der Starter bringt einen neutralen **Text-Abschnitt** mit;
  die Abschnittstypen des Designs kommen pro Projekt dazu.
- **Weitere Seiten**: frei zusammenstellbare Unterseiten, ebenfalls aus
  Abschnitten, je Sprache ein Dokument.
- **Einstellungen**: je Sprache eine (**Deutsch** / **English**): Name,
  Kontaktdaten, Navigation, Footer-Links.

Startseite und Einstellungen gibt es **pro Sprache genau einmal** (feste IDs)
und können nicht gelöscht oder dupliziert werden. „Weitere Seiten“ können
beliebig viele angelegt werden.

### Zweisprachigkeit (Deutsch + Englisch)

Die Website ist zweisprachig auf **Dokument-Ebene**: pro Sprache gibt es ein
eigenes Dokument. Deutsch liegt auf der Website unter `/`, Englisch unter `/en/`.

- Startseite und Einstellungen sind je Sprache fest adressiert
  (`homePage-de` / `homePage-en`, `siteSettings-de` / `siteSettings-en`).
- Bei **Weiteren Seiten** verknüpft das **Übersetzungen-Menü** (oben im
  Dokument) die Sprachversionen: dort die andere Sprache anlegen oder
  auswählen, dann paaren Sprachumschalter und Suchmaschinen-Hinweise (hreflang)
  die beiden Seiten korrekt. Es wird nie eine Adresse „geraten“.

> **Veröffentlichen nicht vergessen:** Änderungen werden erst sichtbar, wenn
> oben rechts auf **Publish** geklickt wurde. Solange dort „Publish“ leuchtet,
> ist die Änderung nur ein Entwurf.

---

## Einmalige Einrichtung

Diese Schritte macht in der Regel der Entwickler **einmal** beim Aufsetzen.

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 22.15 oder neuer)
- Ein kostenloses [Sanity](https://www.sanity.io/)-Konto

### 1. Bei Sanity anmelden

```bash
cd studio
npx sanity login
```

### 2. Ein Sanity-Projekt anlegen / verbinden

Entweder ein neues Projekt über den Assistenten anlegen:

```bash
npx sanity init --env
```

Dabei „**production**“ als Dataset wählen. Der Befehl legt eine `.env`-Datei mit
der Projekt-ID an (siehe `.env.example`).

Oder, falls schon ein Projekt existiert: die Projekt-ID als Umgebungsvariable
setzen. Dazu im Ordner `studio/` eine Datei **`.env`** anlegen:

```
SANITY_STUDIO_PROJECT_ID=DEINE_PROJEKT_ID
SANITY_STUDIO_DATASET=production
```

(`studio/.env.example` zeigt das Format.)

### 3. Pakete installieren

```bash
npm install
```

### 4. Zweisprachige Start-Inhalte laden (empfohlen)

Der mitgelieferte, **deterministische** Datensatz (`seed.ndjson`) füllt das
Dataset mit den deutschen und englischen Inhalten der Demo (Startseite,
Einstellungen und eine Beispielseite je Sprache):

```bash
npm run import-seed
```

`seed.ndjson` wird aus `studio/scripts/make-seed.mjs` erzeugt (feste IDs, keine
Zufallswerte) und kann bei Änderungen mit `npm run seed:build` neu generiert
werden.

---

## Täglicher Betrieb: Inhalte pflegen

```bash
cd studio
npm run dev
```

Dann im Browser **http://localhost:3333** öffnen. Inhalte bearbeiten und mit
**Publish** veröffentlichen.

---

## Studio veröffentlichen

Das Studio kann kostenlos bei Sanity gehostet werden (Adresse der Form
`deinprojekt.sanity.studio`), damit der Kunde ohne lokale Installation darauf
zugreifen kann:

```bash
cd studio
npx sanity deploy
```

Beim ersten Mal wird nach einem Studio-Namen (Hostnamen) gefragt.
Für Updates anschließend einfach `npm run deploy` ausführen.

---

## Studio mit der Astro-Website verbinden

Solange keine Sanity-Variablen gesetzt sind, läuft die Astro-Website mit ihren
**eingebauten Seed-Inhalten** (das ist Absicht). Um auf das Studio umzustellen,
im **Astro-Projekt** (Wurzelverzeichnis, nicht im `studio/`-Ordner) eine Datei
`.env` anlegen bzw. ergänzen:

```
PUBLIC_SANITY_PROJECT_ID=DEINE_PROJEKT_ID
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-10-01
```

Die Projekt-ID ist dieselbe wie im Studio. Anschließend die Website neu bauen:

```bash
# im Astro-Projekt (Wurzelverzeichnis)
npm run build
```

Ab jetzt holt die Website ihre Inhalte aus Sanity. Ohne diese Variablen bleibt
alles beim eingebauten Seed, es geht also nichts kaputt, falls sie fehlen.

> Die Felder im Studio sind exakt auf die Astro-Seite abgestimmt. Bitte keine
> Feldnamen im Schema umbenennen, ohne die Website (`src/lib/sanity.ts`)
> entsprechend anzupassen.

---

## Automatischer Website-Neuaufbau beim Veröffentlichen (Webhook)

Die Website ist statisch und wird bei jeder Inhaltsänderung **neu gebaut**.
Damit das automatisch passiert, sobald im Studio auf **Publish** geklickt wird,
einen Webhook einrichten:

1. In der **Cloudflare-Workers-Builds**-Verbindung des PROD-Workers (Assets-only-
   Worker, siehe Repo-README „Deploy-Topologie") einen **Deploy Hook** anlegen.
   Man erhält eine URL, an die ein POST einen Rebuild + Deploy auslöst.
2. Im Sanity-Verwaltungsbereich
   **[sanity.io/manage](https://www.sanity.io/manage)** das Projekt öffnen,
   dann **API** > **Webhooks** > **Create webhook**.
3. Als **URL** die Deploy-Hook-URL aus Schritt 1 eintragen.
   - **Trigger on:** Publish (nur veröffentlichte Änderungen sollen Prod neu bauen)
   - **Dataset:** production
   - **HTTP method:** POST
4. Speichern.

Ab sofort stößt jedes Veröffentlichen im Studio einen neuen Build der Website
an.

---

## Hinweis zu den Bildern

Die Astro-Website wird zunächst mit einem **neutralen Platzhalterbild**
ausgeliefert. Die **echten Fotos** werden direkt hier im Studio hochgeladen,
überall, wo ein Bildfeld erscheint. Sobald die Website mit Sanity verbunden ist
(siehe oben), ersetzen die hochgeladenen Fotos automatisch die Platzhalter.

Für **jedes Bild** ist ein **Alternativtext** Pflicht: eine kurze Beschreibung
für Screenreader und Google. Ohne ihn lässt sich das Dokument nicht
veröffentlichen.
