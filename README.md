# tristanweithaler.com

1:1-Migration der Webflow-Site [tristanweithaler.com](https://tristanweithaler.com)
auf Astro + Sanity (upgreight-Starter). Einsprachig Deutsch, statisches
Produktions-Build, Live-Preview über den Preview-Worker. Webflow-Code diente nur
als Referenz; der Code hier ist sauberes Astro ohne Webflow-Klassen.

## Seiten

| Route | Inhalt |
|---|---|
| `/` | Home: Hero (Scroll-Wipe), Statement, Zahlen & Fakten, AIO-Teaser, Coachings (Tabs), Bekannt aus, USP-Liste, Testimonials, Erfolgs-Check (`#0-Euro-Angebot`), FAQ |
| `/ueber-mich/` | Portrait-Hero, Werdegang-Timeline (Pin-Scroll), Interessen + Wort-Marquees, Abschluss-CTA |
| `/all-in-one-coaching/` | Video-Hero (Vimeo, consent-gated), Säulen-Galerie, Module 1–5 (+ „Deine Resultate"), Bonusse, USPs, Testimonials, CTA, FAQ |
| `/datenschutz/`, `/impressum/` | Seitenkopf + Rechtstext (noindex, nicht in der Sitemap) |
| `/danke/` | Form.Taxi-Redirect-Fallback (noindex) |
| `404` | gebrandet (bewusste Abweichung: Live-404 war Webflow-Default) |

Nicht migriert (auf der Live-Site 404/leer): work, resources, projects/apple,
detail_service/testimonial.

## Content-Architektur

**EINE Inhaltsquelle:** `shared/site-content.mjs` (`buildContent({ img })`) hält
alle Texte wörtlich aus `docs/webflow-spec/*.md`. Zwei Konsumenten:

- `src/lib/content/seed.ts` → `img()` löst über die Glob-Registry
  (`src/lib/content/images.ts`) auf lokale Assets auf. Die Site baut komplett
  ohne Sanity (Sanity ist dormant, bis `PUBLIC_SANITY_PROJECT_ID` gesetzt ist).
- `studio/scripts/make-seed.mjs` → `img()` wird zur
  `_sanityAsset: image@file://…`-Upload-Referenz; `npm run import-seed` (im
  `studio/`) baut `seed.ndjson` (54 Dokumente) und importiert inkl. Bildern.

Sections-Kontrakt: Feldnamen in `src/lib/content/types.ts` ==
`src/lib/content/sections.ts` (GROQ-Projektion + browser-sicherer Mapper) ==
`studio/schemas/**`. Wer eine Section ergänzt, zieht alle drei plus
`SectionsList.tsx` und `shared/editor-blocks.ts` mit.

**18 Section-Typen** (+ generisches `sectionText`): HomeHero, ValueStatement,
Results, SplitCta (glow|plain), ServicesTabs, GalleryMarquee, UspList,
Testimonials, Faq, VideoHero, Module, Bonuses, FinalCta, PortraitHero, Timeline,
Interests, PageHeader, RichText. Layout-Sections (Heroes, Timeline, Results,
Module) verwalten ihr Layout selbst; Content-Sections tragen die geteilten
Studio-Regler (Farbton/Abstände/Ausrichtung) über
`src/components/sections/shell.ts`.

**CMS-Collections:** `service` (16 Coachings, Tabs nach Kategorie „Personal
Brands & Selbständige" / „Startups & Unternehmen") und `testimonial` (32).
Beide werden per GROQ-Subquery IN die Section-Daten eingebettet (Build, SSR und
Live-Island identisch); das Anfrage-Modal zieht seine Multiselect-Optionen aus
`getServices()`.

## Design & Verhalten

- **Dunkles Token-Theme** (`src/styles/tokens.css`): `--paper` #0C0C0C, `--ink`
  #F5F5F5, Gold `--brand` #806429, Creme `--brand-cream` #D8D3CC. Tone-Mapping:
  light = dunkler Default, alt = #1D1D1D, dark = invers hell, brand = Gold.
  Breakpoints 991/767/479 als Media-Query-Overrides der Größen-Tokens (keine
  clamps) - 1:1 wie Webflow.
- **Animationen** (`src/scripts/motion.ts`, GSAP + ScrollTrigger + SplitText):
  Zeilen-Reveals, Hero-Scroll-Wipe (300vh), Results-Fächer, Galerie-Drift,
  Banner-Gegenlauf, Timeline-Pin (1200vh), Glow-Follow. Initialzustände NUR per
  `gsap.set`; Scroll-Layouts sind hinter `html.has-motion` gegated → ohne
  JS/`prefers-reduced-motion` statisch und vollständig sichtbar.
- **Widgets** (`src/scripts/widgets.ts`): FAQ, Tabs, Read-More (216 Zeichen),
  Testimonials-Load-More (250ms-Stagger), Vimeo-Gate.
- **Cookie-Consent** (`CookieConsent.astro` + `src/scripts/consent.ts`):
  schlanker Finsweet-Nachbau, opt-in, 4 Kategorien, localStorage, Event
  `tw:consent`. Das Vimeo-Embed im AIO-Hero lädt erst nach Marketing-Zustimmung
  (Poster + „Video laden"-Button vorher).
- **Modals:** `CtaModal.astro` (Anfrage, choices.js 11.2.3 lazy, bedingte
  Radio-Logik, Coaching-Multiselect) + `AioModal.astro` (Bewerbung). Beide
  posten per fetch an Form.Taxi (Endpunkt `https://form.taxi/s/vvg9bvd4`,
  von Julian am 2026-07-21 geliefert).
- Kein Lenis/Smooth-Scroll, keine Seiten-Transition, kein jQuery/Typekit (auf
  der Live-Site tot). Fonts: selbst gehostetes Poppins (woff2, preloaded).

## Kommandos

```bash
npm run dev              # Seed-Modus, kein Sanity noetig
npm run build            # statisches Prod-Build (React-frei, verifiziert)
npm run build:preview    # SSR-Preview-Worker-Build
npm run deploy:prod      # vorher `npm run build`
npm run deploy:preview   # vorher `npm run build:preview`
npm run provision -- --name tristanweithaler --prod-domain tristanweithaler.com --studio-host tristanweithaler
                         # Dry-Run; mit --execute anlegen (Sanity + Worker)
cd studio && npm run import-seed   # seed.ndjson bauen + importieren (Bilder inkl.)
```

QA-Kette vor jedem Handoff: `npx astro check` · `cd studio && npx tsc --noEmit`
· `npx sanity schema validate` · `npm run build` ·
`node .claude/skills/upgreight-astro-website/scripts/preflight.mjs ./dist --site https://tristanweithaler.com`
· `wrangler dev`-Smoke.

## Deploy (Cloudflare, Tristans Konto!)

Beide Worker laufen in **Tristans Cloudflare-Konto**
(`Tristanweithaler@gmail.com`, Account-ID `ee216d2fdff2e29b5093ae6287b5eb8f` -
FEST GEPINNT in `wrangler.jsonc` + `wrangler.prod.jsonc`; Julians eigenes Konto
b6a131… nicht verwenden). Git-Remote: `trischi1993/tw-website`.

| Worker | Build | Config | Inhalt |
|---|---|---|---|
| `tristanweithaler-prod` | `npm run build` | `wrangler.prod.jsonc` | statisches `dist/`, published-only, kein Token |
| `tristanweithaler-preview` | `npm run build:preview` | generiert: `dist/server/wrangler.json` | SSR, Drafts hinter Preview-Cookie |

Beim manuellen Preview-Deploy muss die vom Astro-Adapter erzeugte Konfiguration
verwendet werden: `npm run deploy:preview`. `wrangler.jsonc` enthält die
Quell-Bindings, aber noch keinen Worker-Einstiegspunkt.

Workers-Builds-Anbindung, Custom Domain (erst beim Go-Live/DNS-Umstieg) und der
Sanity-Publish-Webhook → Prod-Deploy-Hook sind Dashboard-Schritte; `npm run
provision` druckt die genaue Anleitung. Live-Preview-Plumbing (zwei Builds,
`#sections-host`-Seam, Perspective-Patch): unverändert vom Starter - Details in
`docs/sanity-live-editing-architecture.md` und `patches/README.md`.

## Offene Platzhalter (vor Go-Live)

1. **Form.Taxi-Endpunkt** in `CtaModal.astro` + `AioModal.astro` ersetzen.
2. **Vimeo-Poster:** aktuell `og-aio.avif`; echtes Standbild von Tristan
   einsetzen (`posterImage` der Video-Hero-Section).
3. **Datenschutztext** wurde 1:1 übernommen und nennt noch Webflow/Google
   Fonts etc. - rechtlich prüfen und anpassen lassen.
4. **DNS:** `tristanweithaler.com` erst beim Go-Live auf den Prod-Worker
   umstellen.

## Referenz

Vollständige Webflow-Spezifikationen (Texte, Werte, Animationen):
`docs/webflow-spec/*.md`. Übergabe-Historie: `docs/HANDOVER.md`.
