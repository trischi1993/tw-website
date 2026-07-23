# ws-tristan — Astro-, Sanity- und Cloudflare-Website

## Vor jeder Änderung lesen

1. `docs/NEXT_SESSION.md` — jüngste operative Übergabe
2. `docs/HANDOVER.md` — historische Entscheidungen und Referenzdetails
3. `README.md` und bei Preview-Arbeiten zusätzlich
   `docs/sanity-live-editing-architecture.md`

`docs/HANDOVER.md` enthält ältere Zwischenstände mit bewusst rotem Build.
Diese Passagen sind historisch; der aktuelle Repository- und Live-Stand hat
Vorrang und muss vor Änderungen verifiziert werden.

## Aktueller technischer Stand

- Astro-Build, TypeScript und Sanity-Schema sind grün.
- GitHub-Branch: `main` im Repository `trischi1993/tw-website`.
- Cloudflare Worker: `tristanweithaler-prod`; die Hauptdomain zeigt bis zur
  ausdrücklich freigegebenen DNS-Umstellung weiterhin auf Webflow.
- Sanity-Projekt: `45zc9nhz`, Dataset: `production`.
- Sanity Studio: `https://tristanweithaler.sanity.studio`.
- Veröffentlichte CMS-Bilder und die fünf AIO-Video-Standbilder werden über
  `cdn.sanity.io` ausgeliefert.
- Die fünf AIO-Modul-Hintergrundvideos werden über Bunny CDN ausgeliefert.
- Formulare verwenden Form.taxi; es gibt aktuell kein Analytics-, Pixel- oder
  Werbetracking.

## Verbindliche Arbeitsregeln

- Vor Änderungen immer `git status` und den aktuellen Branch prüfen.
- Fremde oder parallele uncommittete Änderungen weder verändern noch stagen.
- Dateien immer explizit stagen; niemals pauschal `git add .` verwenden.
- Commits enthalten ausschließlich die Änderungen des aktuellen Auftrags.
- Für Git und GitHub native Terminal-Befehle verwenden. Composio oder andere
  GitHub-Connectoren niemals als Git-Fallback einsetzen. Falls native
  Authentifizierung fehlschlägt, stoppen und den Nutzer informieren.
- Template-Plumbing für Sanity Preview, Click-to-edit, CSP und die zwei
  Cloudflare-Builds nur bei einem ausdrücklich darauf bezogenen Auftrag ändern.
- Keine Domain-, DNS- oder Custom-Domain-Änderung ohne ausdrückliche Freigabe.
- Neue Sections halten den dokumentierten Vertrag synchron:
  `types.ts` ↔ `sections.ts` ↔ Studio-Schema ↔ `SectionsList` ↔
  `shared/editor-blocks.ts` ↔ `insertables.ts`.
- Webflow dient nur als historische Designreferenz. Keine neuen
  Webflow-Abhängigkeiten oder Webflow-CDN-URLs einführen.
