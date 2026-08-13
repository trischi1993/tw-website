# ws-tristan — Astro-, Sanity- und Cloudflare-Website (migriert von Webflow tristan93.webflow.io)

## Aktueller technischer Stand

- Astro-Build, TypeScript und Sanity-Schema sind grün.
- GitHub-Branch: `main` im Repository `trischi1993/tw-website`.
- Cloudflare Worker: `tristanweithaler-prod`; die Website ist live.
- Sanity-Projekt: `45zc9nhz`, Dataset: `production`.
- Sanity Studio: `https://tristanweithaler.sanity.studio`.
- Veröffentlichte CMS-Bilder und die fünf AIO-Video-Standbilder werden über
  `cdn.sanity.io` ausgeliefert.
- Die fünf AIO-Modul-Hintergrundvideos werden über Bunny CDN ausgeliefert.
- Allgemeine Anfrageformulare verwenden Form.taxi. Der Instagram-Erfolgs-Check
  überträgt Leads serverseitig über den Produktions-Worker an Systeme.io und
  weist dort den Tag `Freebies - Download` zu; der API-Key liegt ausschließlich
  als Cloudflare-Secret `SYSTEME_API_KEY`. Es gibt aktuell kein Analytics-,
  Pixel- oder Werbetracking.

## Verbindliche Arbeitsregeln

- Vor Änderungen immer `git status` und den aktuellen Branch prüfen.
- Fremde oder parallele uncommittete Änderungen weder verändern noch stagen.
- Dateien immer explizit stagen; niemals pauschal `git add .` verwenden.
- Commits enthalten ausschließlich die Änderungen des aktuellen Auftrags.
- Für Git und GitHub native Terminal-Befehle verwenden. Composio oder andere
  GitHub-Connectoren niemals als Git-Fallback einsetzen ausser sinnvoll und freigegeben. Falls native
  Authentifizierung fehlschlägt, stoppen und den Nutzer informieren.
- Template-Plumbing für Sanity Preview, Click-to-edit, CSP und die zwei
  Cloudflare-Builds nur bei einem ausdrücklich darauf bezogenen Auftrag ändern.
- Keine Domain-, DNS- oder Custom-Domain-Änderung ohne ausdrückliche Freigabe.
- Neue Sections halten den dokumentierten Vertrag synchron:
  `types.ts` ↔ `sections.ts` ↔ Studio-Schema ↔ `SectionsList` ↔
  `shared/editor-blocks.ts` ↔ `insertables.ts`.
- Der Repo-Inhaber Tristan ist kein Developer und hat das Projekt übernommen, nicht selbst gebaut. Er wird mit AI-Unterstützung Änderungen vornehmen. Verstehe seine Prompts pragmatisch, setze sie zuverlässig um und antworte klar, prägnant und ohne unnötigen Fachjargon.
- Bei neuen Features oder größeren Änderungen, für die ein eigener Git-Branch sinnvoll ist, Tristan vorher kurz fragen und den Nutzen einfach erklären (getrennt testen, mehrere Varianten parallel ermöglichen und `main` stabil halten); bei kleinen, risikoarmen Änderungen auf dem aktuellen Branch bleiben und verwendete Git-Begriffe kurz erklären.

## Kritische E-Book-Live-Architektur

Vor **jeder** Änderung an der E-Book-Landingpage, Bestellseite, Systeme.io,
Cloudflare, DNS oder den zugehörigen Links zuerst
`docs/ebook-live-architecture.md` vollständig lesen.

Kurzfassung: `ebook.tristanweithaler.com` bleibt weiterhin in Systeme.io
verbunden. Der bestehende CNAME `ebook` zeigt weiterhin auf
`d2cegqnkw9qs8o.cloudfront.net` und steht in Cloudflare auf **Proxied**. Die
Worker-Route `ebook.tristanweithaler.com/*` zeigt auf
`tristanweithaler-ebook`. Der Worker liefert nur die neue Landingpage und die
gestaltete Bestellseite selbst aus; Bestellformular, Dankeseite und Rechtstexte
werden unverändert an Systeme.io durchgereicht.

Ohne ausdrückliche Freigabe niemals die Domain aus Systeme.io entfernen, den
CNAME ersetzen/löschen, die Route durch eine Worker-Custom-Domain ersetzen
oder `/bestellformular` auf einen fremden Host umstellen. Die Same-Origin-Logik
der eingebetteten Bestellseite und die automatische Vollseiten-Weiterleitung
zur Systeme.io-Dankeseite hängen von dieser Architektur ab.
