# Kickoff: Template an remarkable angleichen (neue Session)

> **Auftrag für eine frische Session.** Dies ist ein **Mandat, kein Pflichtenheft**: du sollst
> `flowtricks/remarkable` (Timothy Ricks' Sanity-Starter) **komplett durchforsten** und pro Baustein
> selbst entscheiden, ob er in unser **schlankes, token-getriebenes, pro-Projekt-sicheres Astro-Template**
> passt — und das dann umsetzen. Nicht blind kopieren, nicht halbgar liegen lassen.
>
> Zuerst lesen: `docs/umbau-plan.md` (Protokoll = aktueller Stand) und
> `docs/sanity-live-editing-architecture.md` (Abschnitt 9 = verifizierte remarkable-Befunde).
> Keine Zeit-/Aufwandsschätzungen ([no-time-estimates]).

## Die Entscheidung (von Julian am 2026-07-09 getroffen)

Julian hat remarkables Editing-/Token-Reife gesehen (Screenshots: padding top/bottom als
none/even/small/medium/large/page-top, gap xs–2xl, theme light/dark/brand, text size/color/text-wrap/
max-width, semantic level vs. visual size, full-viewport-height — alles kompakt, gut benannt, wenig
Scrollen). Ziel: **so viel wie sinnvoll von remarkable ins Template holen, damit die Arbeit pro Kunde
nur noch „Token-Werte anpassen + Design-Sections bauen" ist** — nicht jedes Mal Padding/Editing neu
erfinden (kostet Zeit, Tokens, Konsistenz).

- **(A) Architektur: Astro behalten.** remarkable ist **Next.js** — NICHT auf Next wechseln. Der
  Zero-JS-Prod-Output, i18n/hreflang, die Cloudflare-Topologie und die Konsistenz mit den 3 Live-
  Projekten (frinighof/vita/hasenegg, alle Astro) bleiben. Wir übernehmen seine **Studio-, Editing-
  und Token-Schicht**, nicht sein Front-End/Framework.
- **(B) Produktmodell: „designed sections per project" behalten + seine reichen Controls draufsetzen.**
  NICHT sein Freiform-12-Primitive-Modell übernehmen ([lean-modular-sections] gilt weiter). Aber seine
  Section-/Text-Controls (Tokens) und Editing-UX adoptieren. Wenn du beim Durchforsten einen starken
  Grund findest, das anders zu sehen, **melde es an Julian**, entscheide es nicht selbst.

## Was portierbar ist (Framework-agnostisch oder schon in unserer Island-Schicht)

| Bereich | remarkable-Quelle | Vorgehen |
|---|---|---|
| **Token-System** (padding none/even/small/medium/large/page-top; gap xs–2xl; theme light/dark/brand; button primary/secondary/outline/ghost; text size/color/text-wrap) | `lib/spacingScale.ts`, `globals.css`, Schema | **Übernehmen** — reine CSS-Vars + Schema. Pro Projekt ändern sich nur die WERTE |
| **Section-Controls** (padding top/bottom, theme, alignment, gap, full-height, bg-image) | `schemaTypes/section.ts`, `shared/fields.ts` | Schema übernehmen, auf unsere Token-Klassen mappen; Renderer als Astro/React-Island |
| **Kompakte Segmented-Inputs, „?"-Tooltips, Size/Color/Text-wrap, Range-Slider** | `sanity/components/PreviewSelect`, `TooltipDescriptionField`, `RangeSliderInput`, `ResponsiveNumberInput` | **Studio-only → 100 % prod-sicher.** Styling ~1:1 übernehmen. Mit unseren `SegmentedInput`/`DescriptionTooltipField` konsolidieren (nicht doppeln) |
| **Canvas-Editing**: Entf/⌘D/⌘C/⌘V, ↑/↓-Reorder, kontextuelles „+", Resizer | `EditorShortcuts`, `KeyboardReorder`, `CanvasAddButton`, `CanvasResizer`, `SpacingResizer`, `CanvasAutofocusGuard` | In die Preview-Islands portieren (wie schon bei cmd+E). **Resizer SNAPPEN an die Token-Skala** (`snapSpacing`), nie Freiform-px. Studio↔Preview cross-origin via **comlink**, nicht BroadcastChannel |

## Was bleibt wie es ist (unsere Schicht)

Astro-Front-End + **Zero-JS-Prod** (Hook-erzwungen), i18n/hreflang + document-internationalization,
Cloudflare-Topologie, unser Daten-Layer (`lib/content/*`, loadQuery), das „designed sections"-Modell.
remarkable hat kein i18n — das ist unser Mehrwert, bleibt unangetastet.

## Leitplanken (nicht verhandelbar)

1. **Prod bleibt heilig**: `npm run build` → 0 React-Runtime im `dist/`, kein Token (die
   `astro:build:done`-Assertion bricht sonst den Build). Oberstes Abnahmekriterium.
2. **Alles Editierbare = TOKEN**, nie Freiform-Werte. Pro Projekt ändert man nur die CSS-Variablen-
   *Werte* (`--space-lg`, Brand-Farbe, …), die Sanity-Controls und das Verhalten stimmen dann schon.
3. **Resizer snappen an die Skala** (Julians Kern-Anforderung: darf pro Projekt nichts zerschießen).
   Max-Width darf frei bleiben (in `ch` = relative Lesbarkeits-Zeilenlänge, kein Token-Bruch).
4. **Studio-Styling/Inputs** so nah an remarkable wie möglich (kompakt, gut benannt, wenig Scrollen) —
   ist prod-sicher, weil das Studio eine eigene App ist.
5. **Nichts festschreiben, was pro Projekt das Design vorwegnimmt.** Das Template liefert Editing-Infra
   + Token-Gerüst; die konkreten Design-Werte/-Sections kommen pro Projekt.
6. Nach jedem Baustein: `astro check` + Studio `tsc` + `sanity schema validate` + Prod-Build-Check,
   committen, Protokoll in `docs/umbau-plan.md` ergänzen. Feel-Test-Punkte für Julian sammeln
   (Live-/Optimistic-Verhalten ist headless nicht fahrbar).

## Ausdrücklich mit Julian abstimmen, BEVOR festgeschrieben wird

- **Der konkrete Token-Katalog** (Namen + Stufen: padding-Skala, gap-Skala, theme-Namen, button-Styles,
  text-size/color-Stufen). Julians padding-Modell (none/even/small/medium/large/page-top) ist die
  Vorlage und gefällt ihm — aber die finale Token-Liste ist das Fundament, auf dem alles hängt: erst
  als Vorschlag zeigen, bestätigen lassen, dann verdrahten.
- Ob wir remarkables Design-Tokens/`globals.css` als **Startwerte** übernehmen (er baut pro Projekt eh um).

## Vorgehen (empfohlen)

1. **Durchforsten**: remarkable frisch klonen (`git clone --depth 1 https://github.com/flowtricks/remarkable`
   in den Scratchpad) und den ganzen `src/` + Schema + `globals.css` lesen (die Editing-Schicht ist in
   dieser Session schon analysiert — s. Protokoll; Schema/Tokens/CSS noch nicht vollständig). Recherche
   ruhig an Subagenten delegieren, Implementierung nicht (zu stark gekoppelt).
2. **Adopt/Adapt/Drop-Plan + Token-Vorschlag** schreiben → Julian bestätigen lassen (der Abstimm-Punkt oben).
3. **Inkrementell umsetzen**, Baustein für Baustein, jeweils grün + committen + Protokoll. Reihenfolge-
   Vorschlag: (a) Token-Katalog + Section-Controls (padding/theme/gap/alignment/full-height),
   (b) Text-Controls (size/color/text-wrap/max-width) + kompakte Inputs, (c) Canvas-Editing
   (keyboard + „+" + token-snappende Resizer + Autofocus-Guard via comlink), (d) Button-Styles.
   Das kontextuelle „+" lohnt erst mit verschachtelten Container-Sections — abwägen.

## Was in DIESER Session (Phase B) schon steht

- cmd+E als Canvas-Command-Palette (faithful Port), selektionsbewusst, optimistisch, Auto-Select;
  Studio→Vorschau-Forwarder via comlink. Schwache Studio-Form-Variante entfernt.
- SegmentedInput (tone/align), Hover-Preview-Kanal (comlink), Feld-Beschreibung als „?"-Tooltip.
- **Wichtige Einordnung aus der Analyse**: Löschen/Duplizieren/Insert-before/after gibt es schon über
  das eingebaute Overlay-Kontextmenü (Rechtsklick) — es fehlen die **Tastatur**-Shortcuts (Entf/⌘D/
  ⌘C/⌘V) und ↑/↓-Reorder (remarkables `EditorShortcuts`/`KeyboardReorder`). Das ist Teil von (c).
- remarkables Resizer sind **token-stufen-basiert** (`spacingScale.ts` + `snapSpacing`), also
  token-sicher baubar — nicht Freiform. (Frühere „kollidiert mit Philosophie"-Einschätzung korrigiert.)

Commit-Stand am Übergabe-Punkt: `Phase B: Studio-UX + cmd+E als Canvas-Palette (remarkable-Port)`.
