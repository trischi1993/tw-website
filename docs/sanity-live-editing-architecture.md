# Einschätzung: Sanity auf Webflow-Niveau (und darüber)

> Architektur-Review vom 2026-07-08. Ziel: Sanity Visual Editing auf Realtime-Niveau (Millisekunden-Latenz, Hover-Preview) heben, Cloudflare-Topologie und Client-Onboarding vereinfachen. Alle Aussagen unten wurden gegen Primärquellen verifiziert (npm-Registry, GitHub-Quellcode, offizielle Sanity-/Cloudflare-Docs, Live-Pricing-Seiten, Stand 2026-07-08).

## Kurzfassung

**Euer Grundweg bleibt richtig. Es braucht keinen Plattformwechsel, sondern genau eine strukturelle Änderung plus zwei Modernisierungen:**

1. **Sections werden React-Komponenten** und laufen im Preview als hydrierte Island im "Live Mode". Das ist der einzige Weg zu Millisekunden, alles andere ist physikalisch unmöglich (Begründung unten). Der Prod-Output bleibt statisch und liefert **null React-JS** aus.
2. **Prod-Deploy zieht von Cloudflare Pages auf einen Assets-only-Worker.** Pages ist eingefroren, der Astro-Adapter hat Pages-Support schon in v13 entfernt. Deine 2-Deployments-Idee ist richtig und existiert im Template schon in Grundform, nur das Ziel ändert sich: 2 Workers statt Pages+Worker.
3. **Neukunden-Setup wird ein Befehl** (~3 Minuten): Sanity-Projekt, Dataset, CORS, Token, Webhook, Seed, Studio-Deploy, 2 Workers, Domains, Secrets. Alles ist heute per API/CLI scriptbar, einen fertigen End-to-End-Script gibt es öffentlich nicht, wir bauen den ersten.

Fast alles aus dem Video ist inzwischen **offizielles, dokumentiertes Sanity**, kein Hack. Der Video-Autor (sehr wahrscheinlich Timothy Ricks, Repo `flowtricks/remarkable`) nutzt die Standard-Pipeline auf Next.js 16 plus polierte Custom Inputs plus CSS-Variablen-Theming. Wir bekommen dieselbe Pipeline in Astro, in einem Codebase.

---

## 1. Warum es heute 0,5–2 s dauert (verifiziert am Code)

Die Kette pro Tastenanschlag im aktuellen Template: Studio-Autosave (debounced) → comlink-Event → `window.location.reload()` in `PreviewExtras.astro` → HTTP-Roundtrip zum Preview-Worker → zwei **ungecachte** GROQ-Fetches → kompletter SSR-Render → voller Browser-Reload → GSAP/Lenis-Re-Init.

Wichtig: Das ist kein Konfigurationsfehler von uns. Auch das offizielle `@sanity/astro` implementiert refresh wörtlich als `window.location.reload()` (aus dem Paket-Quellcode verifiziert). **Jede** .astro-basierte Preview hat dieses Limit, egal wie schnell der Server wird. Genau das ist der Lag, den der Typ im Video am Anfang beschreibt.

## 2. Der einzige Millisekunden-Pfad

Sanity dokumentiert heute drei Update-Mechanismen für Previews:

| Mechanismus | Latenz | Funktionsweise |
|---|---|---|
| **Presentation Live Mode** | **Millisekunden** | Studio pusht *pending* Draft-Änderungen (jeden Tastenanschlag, vor dem Speichern) per postMessage direkt in den iframe. **Kein Server-Roundtrip.** |
| Live Content API | ~Sekunde | Sync-Tags signalisieren Änderung, Frontend **re-fetcht** (Netzwerk). Für Produktions-Liveness gedacht. |
| Refresh-Callback | 0,5–2 s | Was wir heute haben: Full-Reload. |

Der Haken: Live Mode kann nur ein **client-seitiger Query-Store mit re-rendernden Komponenten** konsumieren (`@sanity/react-loader` mit `useQuery`+`useLiveMode`, alternativ Svelte-Loader). Ein Astro-Loader existiert nicht (npm 404, Stand heute), und reine .astro-Templates haben kein Re-Render-Modell im Browser. Daraus folgt die Architekturentscheidung zwingend:

## 3. Zielarchitektur: „Static Shell, Live Islands"

**Was sich ändert:** Die Section-Komponenten (aktuell nur `TextSection.astro` plus Renderer, die Migrationsfläche ist also minimal, perfekter Zeitpunkt) werden `.tsx`. Ein `SectionsIsland` rendert das `sections[]`-Array:

- **Prod-Build:** Astro rendert die React-Komponenten **statisch zur Buildzeit**. Kein `client:`-Directive, kein React-Runtime im Output. Der Besucher bekommt exakt so leanes HTML wie heute.
- **Preview-Build:** dieselbe Komponente hydriert als Island (`client:only`, über die vorhandenen Preview-Gates geschaltet), initial gefüttert vom Server (`loadQuery`), dann im Live Mode: Tippen im Studio erscheint in Millisekunden, ohne Netzwerk.

**Was gleich bleibt:** Der Seed-first/Dormant-Ansatz (die Getter-Seam in `src/lib/content/` füttert die React-Sections genauso), i18n, Theme-Tokens, die Zwei-Build-Isolation, `preview-url-secret`-Handshake, der Page-Navigator. Das Fundament ist gut, es fehlte nur die Live-Schicht.

**Was damit gratis aufgeht** (alles built-in in visual-editing v5, braucht nur `data-sanity`-Attribute via `createDataAttribute` + Stega, das bei euch schon vorverdrahtet aber abgeschaltet ist):

| Feature aus dem Video | Status |
|---|---|
| Klick-to-edit-Overlays | built-in (Stega + data-sanity) |
| Drag-to-reorder auf dem Canvas | built-in |
| Shift beim Ziehen = Minimap/Zoom-out | built-in |
| Rechtsklick: Duplizieren/Löschen/Einfügen | built-in |
| „Search to add" Insert-Menü | built-in (`@sanity/insert-menu`, per Schema konfigurierbar) |
| Instant-Reorder ohne Warten | `useOptimistic` (React, dokumentiert) |
| „Nur Sections auf Page, nur Cards im Slider" | natives Schema (`of: [...]`) |
| Conditional Props (Overlay-Slider erst bei Bild) | natives `hidden: ({parent}) => ...` |
| Slider/Regler direkt auf dem Canvas | `unstable_overlay-components` (React-only, unstable → pinnen und kapseln) |
| Wrapper-divs vor dem Kunden verstecken | data-sanity gezielt nur aufs Kind setzen |
| 2. Button wird automatisch Outline | kleine Custom-Logik (initialValue/Input) |

## 4. Hover-Preview in Millisekunden (der geilste Teil)

Zwei Wege geprüft:

- **Patch-on-hover** (Draft bei Hover patchen, bei Mouse-out reverten): funktioniert, aber Studio-Autosave committet debounced ins Content Lake → Undo-History-Müll und Race-Conditions beim Revert. **Verworfen.**
- **Eigener comlink-Seitenkanal** (empfohlen): `@sanity/comlink` v4 ist ein öffentliches, stabiles Paket ("http-like coms over iframes"). Ein Custom-Input im Studio (Segmented-Buttons statt Dropdown) sendet bei Hover `{path, value}` an ein Mini-Script in der Preview-Island, das einen **rein visuellen Override** setzt. Mouse-out räumt auf, Klick macht den echten `set()`-Patch (optimistic, sofort sichtbar, debounced committet).

Und hier zahlt sich eure Architektur unerwartet aus: **Wegen des Theme-Token-Systems ist ein Hover-Preview für Theme oder Alignment buchstäblich ein Attribut-Flip** (`data-tone="dark"` umschalten, alle Kinder folgen den Surface-Tokens). Null Re-Render, echte Millisekunden. Euer Token-System war versehentlich genau dafür gebaut. Dasselbe Muster trägt Font-Size-Stufen, Spacing-Variablen-Stepper, Max-Width in `ch` – alles, was als CSS-Custom-Property oder Datenattribut ausdrückbar ist.

Ehrlicher Hinweis: Presentation segnet fremde Kanäle nicht offiziell ab (deren eigener Kanal ist als internal markiert). Deshalb: den Hover-Kanal als isoliertes Modul bauen, das **fail-open** ist – wenn der Kanal mal bricht, fehlt nur das Hover-Preview, alles andere läuft weiter.

## 5. Cloudflare-Topologie pro Kunde

Deine Intuition („jeweils 2, einer für Preview") ist bestätigt, mit einem Update:

| | `kunde-prod` | `kunde-preview` |
|---|---|---|
| Typ | **Assets-only-Worker** (kein Adapter, kein `main`) | SSR-Worker (`@astrojs/cloudflare` v14.1+) |
| Inhalt | statisch, published-only, **kein Token im Build oder Runtime** | Drafts hinter `preview-url-secret`-Cookie, Viewer-Token als Secret |
| Domain | kunde.de (Zone auf eurem Account) | kunde.preview.upgreight.dev |
| Kosten | statische Requests **gratis & unlimitiert** | minimal (nur Editoren) |

- Beide Workers hängen via **Workers Builds** am selben Repo, gleicher Branch, nur Build-Env-Var und Wrangler-Config unterscheiden sich. Das ist Cloudflares dokumentiertes Muster.
- **Publish-Flow:** Sanity-Webhook → Workers Builds **Deploy Hook** (gibt es inzwischen, wie früher bei Pages; idempotent, webhook-retry-sicher). Prod ist nach wenigen Minuten live; der Editor sieht seine Änderung im Preview sowieso sofort. Das ist Webflow-Parität. Optional später für einzelne Kunden: SSR-Prod + Cache-Tag-Purge (Purge-by-Tag geht jetzt auf allen Plänen) für Sekunden-Publish, aber nicht als Default, lean bleiben.
- **Kein Cloudflare Access vor dem Preview**: bricht im Studio-iframe (Third-Party-Cookie, IdP-Redirect kann im iframe nicht abschließen). Die Absicherung über den Sanity-Mechanismus, wie ihr sie habt, ist genau der offizielle Weg; anonyme Besucher der Preview-URL sehen nur Published-Content.
- Bekannte Ecke: **Safari blockiert Third-Party-Cookies komplett** → Editoren standardmäßig auf Chrome/Edge (in die Kunden-Doku schreiben).
- Ab ~20 Kunden: Workers **Paid** ($5/Monat account-weit) wegen Worker-Cap (Free: 100 = exakt 50 Kunden) und 6 parallelen Builds statt 1.

## 6. Neukunden-Setup: ein Befehl

Alles verifiziert scriptbar, Ablauf des künftigen `init`-Scripts (erweitert euer `init.mjs`):

1. `sanity projects create --json --yes --organization ...` (oder Management API) → projectId
2. Dataset, CORS-Origins (localhost, Preview-, Prod-, Studio-Origin), `sanity tokens add --role=viewer --yes --json`
3. Webhook (Publish → Deploy Hook) via Management API – der einzige Teil ohne CLI-Flags
4. `sanity dataset import seed.ndjson production --replace`, `sanity deploy --yes` (studioHost aus Env)
5. `wrangler deploy` ×2, Workers-Builds-Anbindung + Trigger + Env-Vars per REST-API, Secrets per `wrangler secret put`, Domains per Route-Config

**Einmalig pro Account (manuell):** Cloudflare-GitHub-App installieren, Sanity-Service-Account mit Developer-Rolle anlegen und Token hinterlegen (Org-Tokens existieren seit Juli 2025, aber ob sie Projekte anlegen dürfen ist undokumentiert, deshalb Service-Account).

**Zwei Business-Entscheidungen, die du treffen musst:**
- **Org-Struktur:** Sanity empfiehlt seit dem 2025er-Umbau offiziell *eine Organisation pro Kunde* (Projekt-Transfer bei Übergabe wird unterstützt). Für Kunden, bei denen upgreight die Beziehung hält, ist eine Agentur-Org einfacher; Transfer geht später.
- **Free-Plan-Warze:** Free hat nur 2 Rollen (Administrator, Viewer) → Kunden-Editoren wären technisch Admins. Für kleine Sites okay, für heiklere Kunden ist Growth ($15/Seat/Monat) mit echter Editor-Rolle der saubere Upsell.

## 7. Was ich bewusst NICHT ändern würde

- **Kein Next.js.** Das Ricks-Repo läuft auf Next, aber der ms-Mechanismus ist identisch über Astro-React-Islands erreichbar, und ein Preview-Zweitcodebase wäre Drift-Garantie und Anti-lean.
- **Kein Storyblok/Builder/Webflow-Rückkehr.** Das Video beweist ja gerade, dass Sanitys Decke auf/über Webflow-Niveau liegt; der Rückstand war reine Setup-Arbeit.
- **Weiterhin kein `@sanity/astro`**, auch wenn es seit 1. Juli Astro 7 unterstützt (die Begründung im Skill-Doc ist damit stale, notiert). Sein Visual-Editing bleibt reload-basiert, eure manuelle Verdrahtung ist die bessere Basis.
- **Die Lean-Philosophie.** Der Deal ist präzise: Die gesamte neue Komplexität lebt im Preview-Build und Studio. Der Prod-Output bleibt statisches HTML ohne React-Runtime. Die Hausregel wird von „kein React im Projekt" zu „kein React im Prod-Output", das ist der ehrliche Preis.

**Echte Kosten, damit du sie kennst:** Sections schreiben sich künftig als .tsx statt .astro (kein Scoped-CSS mehr in Sections; euer Token/globales-CSS-Ansatz passt aber ohnehin besser dazu). Interaktive Sections (Akkordeon, Slider) entscheiden pro Fall: kleines Island in Prod oder euer bestehendes Muster globaler Scripts auf data-Attributen (GSAP-Pattern), das mit React-SSR kompatibel bleibt. Und `unstable_overlay-components` heißt unstable: Version pinnen, in eigenes Modul kapseln.

## 8. Umsetzungsplan

> Historisch (Vor-Umsetzung). Alle Phasen sind umgesetzt — siehe `docs/umbau-plan.md`
> (Protokoll). Nach Risiko geschnitten, keine Zeitschätzungen ([no-time-estimates]).

| Phase | Inhalt | Risiko |
|---|---|---|
| **A. Live-Core** | @astrojs/react + react-loader, `sectionText` → .tsx, SectionsIsland, Stega an, `createDataAttribute`, `useOptimistic`, CORS | hoch – der Brocken |
| **B. Studio-UX** | Custom Inputs (Segmented, Stepper, wachsende Textarea, Tooltips), comlink-Hover-Kanal, Insert-Menü, Presets, Auto-Regeln | mittel – inkrementell |
| **C. Cloudflare** | Prod Pages → Assets-only-Worker, 2 Builds-Trigger, Deploy-Hook-Flow | niedrig |
| **D. Provisioning** | One-Command-Script (Sanity + Cloudflare end-to-end), Doku | mittel |

Dazu zwei **Sofort-Fixes** unabhängig von allem: `studio/scripts/make-seed.mjs` emittiert noch gelöschte Section-Typen (sectionFeatures/Cta/Faq) und würde bei Re-Run Schema/Seed desyncen; README erwähnt noch sechs Sections.

---

## 9. Nachtrag: Verifikation gegen das Ricks-Repo (`flowtricks/remarkable`, geklont & analysiert 2026-07-08)

Das Repo wurde vollständig analysiert. Es bestätigt die Zielarchitektur und präzisiert vier Punkte:

- **Stack bestätigt:** Next.js 16.2.10, next-sanity 13.1.1, sanity 6.3.0, @sanity/visual-editing 5.4.5. Studio ist **im selben Next-App embedded** (`/studio`) – Studio und Site teilen sich also eine Origin (relevant für Punkt 3).
- **ms-Mechanismus präzisiert:** Ricks nutzt nicht `@sanity/react-loader`, sondern **`usePresentationQuery` aus `@sanity/visual-editing/react`** – der Studio-Loader streamt Query-Resultate pro Tastenanschlag per comlink/postMessage in den iframe, die PageBuilder-Komponente re-rendert daraus. Dazu `useOptimistic` + `useDocuments().patch` (mit `@sanity/mutate`-Operatoren) für Insert/Duplicate/Move ohne Warten. Der Hook ist framework-agnostisches React und in unserer Astro-Island genauso nutzbar → **Phase A: zuerst `usePresentationQuery` evaluieren statt react-loader** (ein Paket weniger, näher an dem, was nachweislich funktioniert).
- **Wichtigste Entdeckung – er patcht node_modules:** `patch-package` mit ausführlich dokumentierten Patches. Der buttrige Per-Keystroke-Effekt hängt an einem **Race-Condition-Fix in visual-editing 5.4.5** (fehlende `perspective`-Dependency in einem Effect – ohne Patch greifen Instant-Updates erst nach dem ersten Commit eines Felds). Dazu Overlay-Label- und Nested-Path-Fixes in `sanity` selbst. Konsequenz: „alles offiziell" gilt für den Mechanismus, nicht für die Politur out-of-the-box. **Vor Phase A prüfen, ob die Fixes inzwischen upstream sind; sonst Patches übernehmen und Versionen exakt pinnen.**
- **Sein Hover-Preview nutzt BroadcastChannel, nicht comlink** – das funktioniert nur, weil Studio und Site bei ihm same-origin sind. Bei uns (Studio auf `*.sanity.studio`, Preview auf `kunde.preview.upgreight.dev`) ist BroadcastChannel unmöglich → unser geplanter comlink-Seitenkanal (Abschnitt 4) bleibt der richtige Weg. Sein Muster „Preview sendet, Studio (hält die Auth) schreibt den Patch" übernehmen wir.
- **Produktphilosophie bewusst NICHT kopieren:** remarkable ist kein Section-System, sondern ein Webflow-artiger Freiform-Canvas aus 12 generischen Primitiven (heading, paragraph, card, grid, slider, …). ~55–60 % des Codes (~4.900 von ~8.300 Zeilen) ist reine Editor-Maschinerie; kein i18n, keine Sitemap, OG-Image wird gequeryt aber nie emittiert, kein Deploy-Setup. Unser Modell (wenige pro Projekt designte Sections mit constrained Options) bleibt – wir übernehmen die Live-Editing-Technik, nicht das Freiform-Produktmodell.

**Antwort auf die Kernfrage** („ist unser Weg der beste oder komplett ändern?"): Der Weg ist richtig, die Basis besser als gedacht, aber die Preview-Schicht muss von Reload auf Live-Islands umgebaut werden, und das Grundsetup sollte diese Stufe ab Werk enthalten (dormant-fähig wie bisher, aktiviert sich mit dem Provisioning-Befehl). Danach ist das Editing-Erlebnis auf Webflow-Niveau, und in drei Punkten drüber: Hover-Previews über euer Token-System, echtes i18n, und ein statischer Prod-Output, den Webflow so nie liefert.
