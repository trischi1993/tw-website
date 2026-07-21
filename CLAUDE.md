# ws-tristan — Webflow→Astro-Migration tristanweithaler.com

**ZUERST LESEN: `docs/HANDOVER.md`** — die vollständige Übergabe der laufenden
Migration (Session 1, 2026-07-20/21): alle Entscheidungen, was fertig ist, was
offen ist, und die Schritt-für-Schritt-Restliste (1–11). Ohne dieses Dokument
nichts an der Migration weiterbauen.

Kurzfassung des Stands:

- **Projekt:** 1:1-Migration der Live-Site https://tristanweithaler.com (Webflow)
  auf dieses upgreight-Astro+Sanity-Starter-Template. Julians Anforderungen und
  seine Antworten auf die Startfragen stehen im HANDOVER.
- **Build ist aktuell bewusst ROT** (WIP-Stopp): `src/preview/insertables.ts`
  unvollständig + Studio-Schemas für die 18 neuen Section-Typen fehlen noch.
  Das ist Schritt 1–2 der Restliste, kein Unfall.
- **Referenz-Specs:** `docs/webflow-spec/*.md` (komplette Dekodierung des
  Webflow-Exports: Design-System, alle Seiten mit wörtlichen Texten, Animationen,
  CMS-Daten, Rechtstexte). Webflow-Export selbst liegt außerhalb des Repos unter
  `../tristan-webflow-code/`.
- **Template-Plumbing (Live-Preview, Click-to-edit, Zwei-Builds, CSP/SEO-Hooks)
  NICHT umbauen** — siehe README.md + docs/sanity-live-editing-architecture.md.
  Neue Sections folgen dem dokumentierten Kontrakt (types.ts ↔ sections.ts ↔
  Studio-Schema ↔ SectionsList ↔ shared/editor-blocks.ts ↔ insertables.ts).
- **Cloudflare:** IMMER Tristans Konto (account_id `ee216d2f…`, in beiden
  wrangler-Configs gepinnt), NIE Julians Konto (b6a131…).
- **Form.Taxi-Endpunkt ist Platzhalter**, bis Julian ihn liefert.
