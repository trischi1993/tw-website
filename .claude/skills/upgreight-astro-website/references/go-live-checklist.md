# Astro Go-Live Checkliste (Template, projektunabhängig)

> Wiederverwendbare, vollständige Launch-Checkliste für jede Astro-Webseite (Erstlaunch & Relaunch).
> Diese Datei lebt im Template-Repo und wird bei jedem Kundenprojekt vor dem Go-Live komplett durchgeprüft.
> Sie ist bewusst generisch: keine projektspezifischen Daten, nur prüfbare Kriterien.
>
> Ziel: ein sauberer Livegang ohne SEO-Ranking-Einbrüche, ohne Rechtslücken, ohne kaputte Funktionen, mit gutem Gewissen gegenüber dem Kunden.

---

## So benutzt der Agent diese Checkliste

In einer neuen Session genügt:
> "Arbeite `ASTRO-GO-LIVE-CHECKLIST.md` durch und prüfe Punkt für Punkt, was dieses Projekt schon erfüllt."

**Regeln für den Agent (strikt befolgen):**

1. **Verifizieren statt behaupten.** Jeder Haken braucht einen echten Beleg: eine geöffnete Datei, ein Befehl mit Ergebnis, ein Tool-Report. Niemals "sieht gut aus" ohne Prüfung.
2. **Reihenfolge:** von oben nach unten. Erst Grundlagen (PREP, CFG), dann der Rest. 🔴-Punkte sind echte Blocker, ohne die nicht live gegangen wird.
3. **Status pro Punkt setzen:** `- [x]` erledigt (mit 1 Zeile Beleg/Datum + Wie und wo Julian oder der Projektmanager das nachprüfen kann), `- [~]` blockiert/in Arbeit (Grund dahinter), `- [ ]` offen. Nicht zutreffende Punkte auf `- [x]` mit Notiz "n/a, weil ...".
4. **Bei externen Diensten** (Domain, DNS, Hosting, Form-Provider, CMS, Analytics) niemals raten oder eigenmächtig Accounts anlegen: erst Ist-Zustand erfragen, Optionen mit Empfehlung nennen, dann Schritt für Schritt durchführen, aktuelle Preise/Limits/UI live prüfen.
5. **Erstlaunch vs. Relaunch:** Punkte mit `[Relaunch]` nur bei einer Seite, die eine bestehende Seite ablöst. Bei Erstlaunch übersprungen (mit Notiz).
6. **Nach Code-Fixes** immer `npm run build` (und `astro check`) laufen lassen und das Ergebnis nennen.
7. **Hausregeln:** keine Em-Dashes in sichtbarem Text, keine dekorativen Striche vor Eyebrow-Labels, "Created by upgreight" bleibt Englisch, lean bleiben (keine neuen Dependencies ohne Grund).

**Status-Konvention:** `- [ ]` offen · `- [x]` erledigt · `- [~]` in Arbeit/blockiert

**Schweregrad-Legende:**
| Marker | Bedeutung |
|---|---|
| 🔴 | Blocker. Ohne das wird nicht live gegangen (Ranking-, Rechts- oder Funktionsbruch). |
| 🟠 | Wichtig. Vor Launch erledigen. |
| 🟡 | Empfohlen. Sollte sitzen, kein harter Blocker. |
| ⚪ | Optional / kontextabhängig. Bewusst entscheiden. |

---

## Bereiche

1. [PREP · Build- und Projekt-Grundlagen](#prep--build--und-projekt-grundlagen)
2. [CFG · Astro-Konfiguration](#cfg--astro-konfiguration)
3. [SEO · SEO technisch (Meta, robots, Sitemap, OG)](#seo--seo-technisch)
4. [ONP · SEO On-Page und Content](#onp--seo-on-page-und-content)
5. [I18N · Mehrsprachigkeit, Content und Verlinkung](#i18n--mehrsprachigkeit-content-und-verlinkung)
6. [SD · Structured Data / Schema Markup](#sd--structured-data--schema-markup)
7. [AI · AI- und LLM-Sichtbarkeit (GEO/AEO)](#ai--ai--und-llm-sichtbarkeit-geoaeo)
8. [PERF · Performance und Core Web Vitals](#perf--performance-und-core-web-vitals)
9. [A11Y · Accessibility (WCAG 2.2 AA)](#a11y--accessibility-wcag-22-aa)
10. [RWD · Responsive, Mobile, Cross-Browser](#rwd--responsive-mobile-cross-browser)
11. [DSGN · Design- und Code-Konsistenz](#dsgn--design--und-code-konsistenz)
12. [ICON · Favicon und App-Icons](#icon--favicon-und-app-icons)
13. [SEC · Sicherheit](#sec--sicherheit)
14. [LEGAL · Datenschutz, DSGVO, Cookie-Consent, Recht](#legal--datenschutz-dsgvo-cookie-consent-recht)
15. [ANALYTICS · Analytics, Tracking, Search Console](#analytics--analytics-tracking-search-console)
16. [LINK · Links, Navigation, Fehlerseiten](#link--links-navigation-fehlerseiten)
17. [MIG · Relaunch und Migration](#mig--relaunch-und-migration)
18. [FORM · Formulare und Conversion](#form--formulare-und-conversion)
19. [CMS · Sanity und CMS-Inhalte](#cms--sanity-und-cms-inhalte)
20. [QA · Inhalt, Redaktion, finale QA](#qa--inhalt-redaktion-finale-qa)
21. [HOST · Hosting, Deployment, DNS, Infrastruktur](#host--hosting-deployment-dns-infrastruktur)
22. [MAIL · E-Mail-Zustellbarkeit der Domain](#mail--e-mail-zustellbarkeit-der-domain)
23. [MON · Monitoring und Post-Launch](#mon--monitoring-und-post-launch)
24. [DAY · Launch-Day-Sequenz](#day--launch-day-sequenz)
25. [Tooling-Anhang](#tooling-anhang)

---

## PREP · Build- und Projekt-Grundlagen

- [ ] 🔴 **PREP-01 Produktions-Build läuft fehlerfrei.**
  Prüfen: `npm run build`. Pass: Exit-Code 0, keine Fehler, idealerweise keine Warnungen.
- [ ] 🔴 **PREP-02 Typ-/Astro-Check sauber.**
  Prüfen: `npm run astro -- check` (oder `astro check`). Pass: 0 Errors. Warnungen dokumentieren.
- [ ] 🟠 **PREP-03 Prod-Build lokal vorschau-getestet.**
  Prüfen: `npm run preview`, Startseite und Kernseiten manuell öffnen. Pass: rendert wie erwartet, keine Konsolenfehler.
- [ ] 🟠 **PREP-04 Node-Version festgelegt und = Host.**
  Prüfen: `engines` in `package.json` und/oder `.nvmrc`; Host-Build-Setting vergleichen. Pass: identische Major-Version.
- [ ] 🟠 **PREP-05 Lockfile committet.**
  Prüfen: `package-lock.json` (bzw. `pnpm-lock.yaml`/`yarn.lock`) ist im Repo. Pass: vorhanden, aktuell zum `package.json`.
- [ ] 🟡 **PREP-06 Keine Debug-Reste im Output.**
  Prüfen: `grep -rn "console.log\|debugger\|TODO\|FIXME\|XXX" src/`. Pass: nichts Sichtbares/Funktionales übrig (bewusste Logs dokumentiert).
- [ ] 🟠 **PREP-07 Keine ungenutzten Schwergewichte in `public/`.**
  Prüfen: große Dateien in `public/` mit `du -ah public/ | sort -rh | head`; gegen Referenzen abgleichen. Pass: alles in `dist/` ist referenziert; verwaiste Roh-Assets gelöscht (sie wären sonst öffentlich abrufbar).
- [ ] 🟡 **PREP-08 Dependencies aktuell genug, keine kritischen CVEs in Prod.**
  Prüfen: `npm audit`. Pass: keine kritischen/hohen Lücken im Prod-Pfad; reine Dev-Tool-Findings notiert (kein Blocker).
- [ ] 🟠 **PREP-09 Secrets nicht im Repo, `.env` ignoriert.**
  Prüfen: `.gitignore` enthält `.env`, `node_modules`, `dist`; `git log -p` / `git grep -i "api_key\|secret\|token"` stichprobenartig. Pass: keine Secrets versioniert; `.env.example` mit leeren Keys vorhanden.
- [ ] ⚪ **PREP-10 README/Runbook für Build, Deploy, Env vorhanden.**
  Prüfen: `README.md` beschreibt Setup, Build, Deploy, benötigte Env-Vars. Pass: ein Fremder könnte deployen.

---

## CFG · Astro-Konfiguration

- [ ] 🔴 **CFG-01 `site` auf finale Produktions-URL gesetzt.**
  Prüfen: `astro.config.*` → `site`. Pass: exakte kanonische Domain inkl. Protokoll (z. B. `https://www.example.com`). Davon hängen Canonical, Sitemap, OG, JSON-LD ab. Kein Platzhalter.
- [ ] 🟠 **CFG-02 `trailingSlash`-Strategie festgelegt und konsistent.**
  Prüfen: `astro.config.*` → `trailingSlash`; mit Host-Verhalten und internen Links abgleichen. Pass: eine Variante (mit oder ohne Slash), überall gleich, keine Redirect-Pingpongs.
- [ ] 🔴 **CFG-03 Sitemap-Integration aktiv.**
  Prüfen: `@astrojs/sitemap` in `package.json` und in `integrations` von `astro.config.*`. Pass: Build erzeugt `dist/sitemap-index.xml` + `sitemap-0.xml`.
- [ ] 🟠 **CFG-04 Output-Modus korrekt.**
  Prüfen: `output` (default static). Pass: `static` wenn keine Serverlogik nötig; `server`/`hybrid` nur mit Grund und passendem Adapter.
- [ ] 🟠 **CFG-05 Adapter passend zum Host (nur bei SSR).**
  Prüfen: `adapter` in der Config vs. Zielhost (Cloudflare/Vercel/Netlify/Node). Pass: korrekt; bei rein statisch kein Adapter nötig.
- [ ] 🟠 **CFG-06 Bildoptimierung (astro:assets) genutzt.**
  Prüfen: Bilder kommen via `import` + `<Image>/<Picture>` aus `astro:assets`, nicht als rohe `<img>` aus `public/`. Pass: optimierte Formate, `width`/`height` gesetzt. Remote-Bilder: erlaubte Domains in `image.domains`/`remotePatterns`.
- [ ] 🟡 **CFG-07 Prefetch konfiguriert.**
  Prüfen: `prefetch` in der Config bzw. `data-astro-prefetch` an Links. Pass: sinnvolle Strategie (`hover`/`viewport`), kein Over-Prefetch.
- [ ] 🟡 **CFG-08 HTML/CSS/JS minifiziert.**
  Prüfen: `compressHTML` (default true); `dist/`-HTML inspizieren. Pass: HTML komprimiert, Assets gehasht (Cache-Busting greift).
- [ ] 🟠 **CFG-09 Redirects gepflegt (falls nötig).**
  Prüfen: `redirects` in der Config oder Host-Datei (`public/_redirects` etc.). Pass: gewünschte Weiterleitungen vorhanden, als 301 wo dauerhaft.
- [ ] ⚪ **CFG-10 Base-Path korrekt (nur Subpfad-Deploys).**
  Prüfen: `base` in der Config. Pass: nur gesetzt, wenn unter Unterpfad gehostet; sonst leer.

---

## SEO · SEO technisch

> Häufigster Launch-Killer: eine Seite geht versehentlich mit `noindex` oder `Disallow: /` aus dem Staging live. SEO-08, SEO-09, SEO-10 daher immer gegen die echte Domain prüfen.

- [ ] 🔴 **SEO-01 Jede Seite hat einen einzigartigen, sinnvollen `<title>`.**
  Prüfen: `<title>` pro Seite im `dist/`-HTML; auf Duplikate prüfen. Pass: unique, ca. 50 bis 60 Zeichen, konsistentes Brand-Suffix, beschreibt die Seite.
- [ ] 🔴 **SEO-02 Jede Seite hat eine einzigartige `meta description`.**
  Prüfen: `<meta name="description">` pro Seite. Pass: unique, ca. 150 bis 160 Zeichen, kein leeres/dupliziertes Feld.
- [ ] 🔴 **SEO-03 Canonical absolut und self-referencing.**
  Prüfen: `<link rel="canonical">` pro Seite. Pass: absolute URL auf die eigene finale Adresse, konsistent zur Trailing-Slash-Strategie, keine Staging-Domain.
- [ ] 🔴 **SEO-04 `<html lang>` korrekt.**
  Prüfen: `<html lang="...">`. Pass: korrekte Sprache (z. B. `de`, `de-DE`, `it`), passend zum Inhalt.
- [ ] 🟠 **SEO-05 `charset` und `viewport` vorhanden.**
  Prüfen: `<meta charset="utf-8">` und `<meta name="viewport" content="width=device-width, initial-scale=1">`. Pass: beide gesetzt, viewport ohne `user-scalable=no`.
- [ ] 🔴 **SEO-06 Indexierbare Seiten ohne `noindex`.**
  Prüfen: `grep -rn "noindex" dist/`; jede Kernseite manuell. Pass: alle Seiten, die ranken sollen, sind indexierbar.
- [ ] 🟠 **SEO-07 Nicht-Indexierbares korrekt auf `noindex`.**
  Prüfen: Danke-/Bestätigungsseiten, interne Tools, ggf. Impressum/Datenschutz, 404. Pass: bewusst `noindex` gesetzt, wo gewünscht.
- [ ] 🔴 **SEO-08 `robots.txt` erlaubt Crawling und verweist auf Sitemap.**
  Prüfen: `src/pages/robots.txt.ts` (Starter; leitet aus `site` ab) bzw. `public/robots.txt`, und live `https://<domain>/robots.txt`. Pass: kein `Disallow: /`, `Sitemap:` mit absoluter URL auf die echte Domain.
- [ ] 🔴 **SEO-09 `sitemap.xml` enthält nur indexierbare 200-URLs.**
  Prüfen: live Sitemap öffnen; gegen noindex-/404-/Redirect-URLs abgleichen. Pass: absolute URLs, kanonische Domain, keine noindex-/Staging-/Danke-Seiten, keine 404.
- [ ] 🔴 **SEO-10 Keine Staging-Reste live.**
  Prüfen: Staging-`robots.txt`, Passwortschutz, `<meta robots noindex>`, Basic-Auth gegen die Prod-Domain. Pass: alles entfernt, Prod ist frei crawlbar.
- [ ] 🟠 **SEO-11 Open Graph komplett.**
  Prüfen: `og:title`, `og:description`, `og:type`, `og:url` (absolut), `og:image` (absolut), `og:site_name`, `og:locale`. Pass: alle vorhanden und korrekt pro Seite.
- [ ] 🟠 **SEO-12 OG-Image existiert und hat korrekte Maße.**
  Prüfen: Bild aufrufen; Maße und Größe. Pass: ca. 1200x630 px, unter ca. 1 MB, absolute URL, lädt fehlerfrei.
- [ ] 🟡 **SEO-13 Twitter/X Cards gesetzt.**
  Prüfen: `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`. Pass: vorhanden und konsistent zu OG.
- [ ] 🟠 **SEO-14 hreflang korrekt (nur mehrsprachig).**
  Prüfen: `<link rel="alternate" hreflang="...">` je Sprache plus `x-default`. Pass: absolute URLs, bidirektional (jede Sprache verweist auf alle), self-referencing, korrekte Sprach-/Regions-Codes.
- [ ] 🟠 **SEO-15 Keine Duplicate-Content-Fallen.**
  Prüfen: www vs. apex, http vs. https, mit/ohne Trailing Slash, `/index.html` erreichbar. Pass: jeweils 301 auf die kanonische Variante; nur eine indexierbare Adresse pro Inhalt.
- [ ] 🟡 **SEO-16 Pagination/Filter-URLs sauber behandelt.**
  Prüfen: paginierte Listen, Filter-Parameter. Pass: kanonische Strategie definiert, keine endlosen indexierbaren Parameter-URLs.

---

## ONP · SEO On-Page und Content

- [ ] 🔴 **ONP-01 Genau eine `<h1>` pro Seite, saubere Hierarchie.**
  Prüfen: `grep -c "<h1" dist/<seite>.html`; Heading-Reihenfolge h1→h2→h3. Pass: exakt eine h1, keine übersprungenen Ebenen.
- [ ] 🔴 **ONP-02 Inhaltliche Bilder haben sinnvolle `alt`-Texte.**
  Prüfen: alle `<img>`/`<Image>`; dekorative mit `alt=""`. Pass: beschreibende Alts für inhaltstragende Bilder, leeres Alt für reine Deko.
- [ ] 🟠 **ONP-03 Sprechende, kurze URLs/Slugs.**
  Prüfen: alle Routen/Slugs. Pass: lowercase, Bindestriche, keine IDs/Query-Müll, lesbar.
- [ ] 🟠 **ONP-04 Sinnvolle interne Verlinkung, aussagekräftiger Ankertext.**
  Prüfen: wichtige Seiten verlinkt; Ankertexte. Pass: keine "hier klicken"-Anker, Kernseiten gut intern verlinkt.
- [ ] 🟠 **ONP-05 Keine verwaisten Seiten.**
  Prüfen: jede gebaute Seite ist über Navigation/Links erreichbar. Pass: keine Insel-Seiten (außer bewusst noindex).
- [ ] 🟡 **ONP-06 Title, H1 und Description je Seite konsistent zum Intent.**
  Prüfen: stimmen Keyword/Thema überein. Pass: keine Themen-Diskrepanz, kein Keyword-Stuffing.
- [ ] 🟠 **ONP-07 Inhalt ist ohne JavaScript sichtbar.**
  Prüfen: JS deaktivieren oder gerendertes `dist/`-HTML lesen. Pass: Kerninhalt/Text steht im HTML (Crawler- und AI-relevant).
- [ ] 🟡 **ONP-08 Beschreibende Bild-Dateinamen.**
  Prüfen: Asset-Namen. Pass: `zimmer-suedseite.jpg` statt `IMG_2031.jpg`.
- [ ] ⚪ **ONP-09 Breadcrumbs wo sinnvoll (plus Schema).**
  Prüfen: tiefe Seitenstruktur. Pass: sichtbare Breadcrumbs und `BreadcrumbList` (siehe SD-03).
- [ ] 🟡 **ONP-10 Kein Thin Content auf Kernseiten.**
  Prüfen: Kernseiten haben ausreichend echten Inhalt. Pass: keine Leer-/Platzhalterseiten im Index.

---

## I18N · Mehrsprachigkeit, Content und Verlinkung

> Nur bei mehrsprachigen Seiten. Ergänzt die technische SEO-Seite (SEO-04 `<html lang>`, SEO-14 hreflang) um inhaltliche Vollständigkeit und korrekte Verlinkung. Bei einsprachigen Seiten komplett überspringen (mit Notiz).

- [ ] 🟠 **I18N-01 Jede Sprachversion inhaltlich vollständig.**
  Prüfen: jede indexierbare Seite existiert in allen angebotenen Sprachen (oder bewusste Ausnahme dokumentiert). Pass: keine Seite fehlt in einer Sprache, kein 404 beim Sprachwechsel.
- [ ] 🟠 **I18N-02 Sprachumschalter verlinkt auf das echte Pendant.**
  Prüfen: Language-Switcher auf mehreren Seiten. Pass: führt zur selben Seite in der anderen Sprache (nicht pauschal zur Startseite), aktuelle Sprache ist markiert.
- [ ] 🟠 **I18N-03 Keine untranslated/gemischtsprachigen Reste.**
  Prüfen: gerendertes HTML je Sprache auf Default-Sprache-Reste, Platzhalter, fehlende Übersetzungen. Pass: durchgehend in der Zielsprache, keine Fallback-Strings sichtbar.
- [ ] 🟡 **I18N-04 Übersetzte Slugs/URLs korrekt verlinkt.**
  Prüfen: lokalisierte Slugs (falls genutzt) und interne Links je Sprache. Pass: interne Links bleiben innerhalb der Sprache (kein ungewollter Sprung), Slugs sprechend und in der jeweiligen Sprache.
- [ ] 🟠 **I18N-05 hreflang spiegelt die echten Übersetzungen.**
  Prüfen: hreflang-Paare gegen die tatsächlich existierenden Seiten (siehe SEO-14). Pass: jede hreflang-URL liefert 200, bidirektional, `x-default` gesetzt, keine Verweise auf fehlende Übersetzungen.
- [ ] 🟡 **I18N-06 Metadaten je Sprache lokalisiert.**
  Prüfen: `<title>`, `meta description`, OG je Sprache. Pass: übersetzt, nicht aus der Default-Sprache durchgereicht.
- [ ] 🟡 **I18N-07 Sprach-/regionsgerechte Formate.**
  Prüfen: Datum, Zahlen, Währung, Telefon, Adressformat je Locale. Pass: passend zur Sprache/Region, keine hartcodierten Formate.
- [ ] 🟠 **I18N-08 Default-Sprache und Wurzel-Routing sauber.**
  Prüfen: Default-Locale, Verhalten der Wurzel-URL `/`, ggf. Sprach-Redirect. Pass: klar definierte Default-Sprache, kein Doppelindex von `/` und `/<default>/`, Canonical eindeutig.
- [ ] ⚪ **I18N-09 RTL korrekt (nur bei RTL-Sprachen).**
  Prüfen: `dir="rtl"` und Layout-Spiegelung. Pass: korrekt, falls Arabisch/Hebräisch o. Ä. dabei.

---

## SD · Structured Data / Schema Markup

- [ ] 🟠 **SD-01 Organization oder LocalBusiness vorhanden.**
  Prüfen: JSON-LD im `<head>`. Pass: `name`, `url`, `logo` (absolut, erreichbar), bei lokal `address`/`telephone`/`geo`/`openingHours`, `sameAs` (Social-Profile).
- [ ] 🟡 **SD-02 WebSite-Markup (optional SearchAction).**
  Prüfen: `WebSite`-JSON-LD. Pass: `url` und `name`; `SearchAction` nur falls echte Suche existiert.
- [ ] 🟡 **SD-03 BreadcrumbList auf Unterseiten.**
  Prüfen: JSON-LD auf tieferen Seiten. Pass: korrekte `itemListElement`-Reihenfolge mit absoluten URLs.
- [ ] 🟠 **SD-04 Seitentyp-spezifisches Schema je nach Inhalt.**
  Prüfen: passend zu Inhalt: `Article`/`BlogPosting`, `Product`+`Offer`, `Event`, `Recipe`, `Service`, `JobPosting`, `LodgingBusiness` etc. Pass: relevante Typen vorhanden, Pflichtfelder gefüllt.
- [ ] 🟡 **SD-05 FAQPage-Schema bei echten FAQ.**
  Prüfen: FAQ-Bereich plus `FAQPage`-JSON-LD. Pass: Fragen/Antworten im Markup spiegeln den sichtbaren Inhalt.
- [ ] 🔴 **SD-06 Strukturierte Daten valide.**
  Prüfen: Google Rich Results Test und Schema.org Validator gegen die Live-/Preview-URLs. Pass: 0 Fehler (Warnungen bewertet).
- [ ] 🔴 **SD-07 Keine erfundenen/irreführenden Schema-Werte.**
  Prüfen: `aggregateRating`/`review`/Preise/Verfügbarkeit. Pass: nur echte, sichtbare Daten; keine Fake-Bewertungen (Markup-Spam, rechtlich heikel und Penalty-Risiko).

---

## AI · AI- und LLM-Sichtbarkeit (GEO/AEO)

> Generative Engines (ChatGPT, Claude, Perplexity, Google AI Overviews) bevorzugen klar strukturierte, gut zitierbare, ohne JS lesbare Inhalte. Vieles überschneidet sich mit klassischem SEO.

- [ ] 🟠 **AI-01 Entscheidung zu AI-Crawlern dokumentiert.**
  Prüfen: `robots.txt` für `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `CCBot`. Pass: bewusst erlaubt (mehr AI-Sichtbarkeit) oder blockiert (nach Kundenwunsch), Entscheidung notiert.
- [ ] ⚪ **AI-02 `llms.txt` bereitgestellt (optional).**
  Prüfen: `public/llms.txt`. Pass: kurze, strukturierte Markdown-Übersicht der Seite (Zweck, Kernseiten, Kontakt) für LLM-Konsum. Nur wenn gewünscht.
- [ ] 🟠 **AI-03 Kerninhalt ist echter, extrahierbarer Text.**
  Prüfen: Text nicht in Bilder eingebrannt, ohne JS lesbar (siehe ONP-07). Pass: Fakten/Antworten stehen als Text im HTML.
- [ ] 🟡 **AI-04 Klare Frage/Antwort-Blöcke.**
  Prüfen: FAQ und prägnante, eigenständige Absätze. Pass: gut zitierfähige, in sich verständliche Antworten plus FAQPage-Schema (SD-05).
- [ ] 🟡 **AI-05 Eindeutige Entitäten und Quellenangaben.**
  Prüfen: Organization-Schema + `sameAs`, benannte Autoren, klare NAP-Daten. Pass: die Marke/der Anbieter ist als Entität eindeutig identifizierbar.
- [ ] ⚪ **AI-06 Aktualität sichtbar.**
  Prüfen: Veröffentlichungs-/Aktualisierungsdatum sichtbar und im Schema (`datePublished`/`dateModified`). Pass: vorhanden bei datierten Inhalten.

---

## PERF · Performance und Core Web Vitals

- [ ] 🔴 **PERF-01 LCP-Element bewusst priorisiert.**
  Prüfen: Hero-/größtes Bild mit `loading="eager"` + `fetchpriority="high"` (bzw. `priority` bei `<Image>`); restliche Bilder `lazy`. Pass: nur das LCP-Asset lädt sofort.
- [ ] 🔴 **PERF-02 Alle Bilder optimiert, ohne Layout-Shift.**
  Prüfen: WebP/AVIF, `srcset`/`sizes`, gesetzte `width`/`height`. Pass: keine Riesen-Originale, CLS durch Bilder = 0.
- [ ] 🟠 **PERF-03 CLS gering.**
  Prüfen: feste Maße für Bilder/Embeds/Anzeigen; Webfont-Swap ohne Sprung; kein nachträglich injizierter Content über dem Fold. Pass: CLS < 0,1.
- [ ] 🟠 **PERF-04 Minimal Client-JS / INP gut.**
  Prüfen: Astro Islands nur wo nötig (`client:*`-Direktiven gezielt); keine großen Render-Blocker. Pass: schlankes JS-Budget, INP unkritisch.
- [ ] 🟠 **PERF-05 Fonts performant.**
  Prüfen: selbst gehostet als `woff2`, `font-display: swap`, Preload der kritischen Schnitte; bei externen Fonts `preconnect`. Pass: kein blockierendes Font-Laden, kein FOIT.
- [ ] 🟠 **PERF-06 Drittanbieter-Requests minimiert.**
  Prüfen: Netzwerk-Tab / `dist/`-HTML nach externen Hosts. Pass: so wenig Third-Party wie möglich; Skripte `async`/`defer`.
- [ ] 🟠 **PERF-07 Caching-Header korrekt.**
  Prüfen: Host-/`_headers`-Config. Pass: gehashte statische Assets `Cache-Control: public, max-age=31536000, immutable`; HTML kurz/revalidierend.
- [ ] 🟠 **PERF-08 Kompression aktiv.**
  Prüfen: Response-Header live (`content-encoding`). Pass: Brotli oder Gzip aktiv.
- [ ] 🟡 **PERF-09 HTTP/2 oder HTTP/3 aktiv.**
  Prüfen: Response-Protokoll. Pass: moderne Protokollversion am Host/CDN.
- [ ] 🟡 **PERF-10 Preload sparsam und gezielt.**
  Prüfen: `<link rel="preload">`. Pass: nur wirklich kritische Ressourcen, kein Over-Preload.
- [ ] 🟠 **PERF-11 Lighthouse mobil grün.**
  Prüfen: Lighthouse (Mobile) oder PageSpeed Insights gegen die Live-/Preview-URL. Pass: Performance möglichst ≥ 90, keine roten Core Web Vitals.
- [ ] 🟡 **PERF-12 Reduced-motion respektiert.**
  Prüfen: `@media (prefers-reduced-motion: reduce)` schaltet Animationen/Parallax/Autoplay ab. Pass: ruhige Ausgabe für entsprechende Nutzer (auch A11Y-relevant).
- [ ] 🟡 **PERF-13 Below-the-fold lazy.**
  Prüfen: iframes/Videos/weit unten liegende Bilder. Pass: `loading="lazy"` bzw. erst bei Bedarf gemountet.

---

## A11Y · Accessibility (WCAG 2.2 AA)

- [ ] 🔴 **A11Y-01 Farbkontrast erfüllt AA.**
  Prüfen: gemessene Kontrastwerte (Tool oder Berechnung) für Text und UI. Pass: normaler Text ≥ 4,5:1; großer Text (ab 24px bzw. 18,66px bold) ≥ 3:1; UI-/Grafikelemente ≥ 3:1.
- [ ] 🔴 **A11Y-02 Alt-Texte korrekt (inhaltlich vs. dekorativ).**
  Prüfen: siehe ONP-02. Pass: jedes Bild hat passendes `alt` bzw. bewusst leeres `alt`.
- [ ] 🔴 **A11Y-03 Alles per Tastatur bedienbar.**
  Prüfen: nur mit Tab/Shift+Tab/Enter/Space/Escape durch die Seite. Pass: alle interaktiven Elemente erreichbar, logische Reihenfolge, keine Fokusfalle (außer gewollt in Modals).
- [ ] 🔴 **A11Y-04 Sichtbarer Fokus.**
  Prüfen: Fokus-Outline beim Tabben; `:focus-visible`-Styles nicht entfernt. Pass: jederzeit erkennbar, wo der Fokus steht.
- [ ] 🟠 **A11Y-05 Skip-to-content-Link.**
  Prüfen: erster Tab-Stop springt zu `#main`/Hauptinhalt. Pass: vorhanden und funktional.
- [ ] 🟠 **A11Y-06 Landmarks korrekt.**
  Prüfen: `header`, `nav`, genau ein `main`, `footer`. Pass: semantische Struktur vorhanden.
- [ ] 🔴 **A11Y-07 Formulare zugänglich.**
  Prüfen: jedes Feld mit `<label>`/`aria-label`; Fehler programmatisch verknüpft (`aria-describedby`); `required` korrekt. Pass: Screenreader nennt Beschriftung und Fehler.
- [ ] 🟠 **A11Y-08 ARIA korrekt eingesetzt.**
  Prüfen: Menü-Toggles (`aria-expanded`/`aria-controls`), Akkordeons, Modals (Fokusfalle + Hintergrund `inert`/`aria-hidden` + Escape). Pass: kein widersprüchliches/überflüssiges ARIA; geschlossene Inhalte nicht im Accessibility-Tree.
- [ ] 🟠 **A11Y-09 Touch-Targets ausreichend groß.**
  Prüfen: interaktive Elemente. Pass: mindestens 24x24 px (WCAG 2.2), besser 44x44, ohne Überlappung.
- [ ] 🟡 **A11Y-10 Information nicht nur über Farbe.**
  Prüfen: Status/Fehler/Links. Pass: zusätzlich Text/Symbol/Unterstreichung, nicht nur Farbe.
- [ ] 🟡 **A11Y-11 Zoom und Reflow.**
  Prüfen: 200% Zoom und 320px Breite. Pass: kein Inhalts-/Funktionsverlust, kein erzwungenes horizontales Scrollen.
- [ ] 🟠 **A11Y-12 Automatisierter A11y-Scan ohne kritische Verstöße.**
  Prüfen: axe DevTools oder Lighthouse-A11y gegen Kernseiten. Pass: keine kritischen Violations (Rest dokumentiert).
- [ ] ⚪ **A11Y-13 Medien mit Alternativen.**
  Prüfen: Video/Audio. Pass: Untertitel/Transkript vorhanden, kein automatisches Audio-Autoplay.

---

## RWD · Responsive, Mobile, Cross-Browser

- [ ] 🔴 **RWD-01 Viewport-Meta korrekt.**
  Prüfen: siehe SEO-05. Pass: `width=device-width, initial-scale=1`, kein `maximum-scale`/`user-scalable=no`.
- [ ] 🟠 **RWD-02 Layout über Standard-Breakpoints geprüft.**
  Prüfen: 320, 768, 1024, 1440 px. Pass: kein Überlauf, kein Abschneiden, lesbar auf allen Stufen.
- [ ] 🟠 **RWD-03 Keine horizontalen Scrollbars.**
  Prüfen: jede Seite mobil. Pass: nichts ragt seitlich heraus.
- [ ] 🟠 **RWD-04 Reale Geräte / Cross-Browser getestet.**
  Prüfen: Chrome, Firefox, Safari, Edge (Desktop) plus iOS Safari und Android Chrome. Pass: konsistente Darstellung und Funktion.
- [ ] 🟡 **RWD-05 Hover-Funktionen haben Touch-Äquivalent.**
  Prüfen: Menüs/Tooltips, die nur per Hover öffnen. Pass: auf Touch bedienbar.
- [ ] 🟡 **RWD-06 Sticky/Fixed-Header verdeckt keine Sprungziele.**
  Prüfen: Anker-Links mit Offset. Pass: `scroll-margin-top` gesetzt, Ziel sichtbar.

---

## DSGN · Design- und Code-Konsistenz

> Kein Launch-Blocker, aber Qualitäts- und Wartbarkeitssignal: hardcodete Werte und uneinheitliche Abstände machen die Pflege teuer und das Bild unruhig. Nur soweit prüfen, wie das Projekt eine eigene Design-Sprache/Tokens hat.

- [ ] 🟡 **DSGN-01 Farben über Tokens, nicht hardcodet.**
  Prüfen: `grep -rin "#[0-9a-f]\{3,6\}\|rgb(\|hsl(" src/` gegen die zentralen CSS-Custom-Properties/Theme-Tokens. Pass: Farben kommen aus den semantischen Tokens (z. B. `--surface`/`--on-surface`/`--line`/`--brand`), nicht direkt aus Primitiven und keine verstreuten Hex-Werte abseits der Token-Definition.
- [ ] 🟡 **DSGN-02 Fonts zentral definiert.**
  Prüfen: `font-family`-Vorkommen in `src/`. Pass: über Variablen/eine zentrale Stelle gesetzt, kein wiederholtes Hardcoden einzelner Font-Stacks, nur genutzte Schnitte geladen (siehe PERF-05, LEGAL-05).
- [ ] 🟡 **DSGN-03 Konsistente Spacing-Skala.**
  Prüfen: Abstände (margin/padding/gap) gegen eine definierte Skala/Tokens. Pass: Abstände folgen einem System (z. B. 4/8-Schritte oder `--space-*`), keine zufälligen Magic Numbers (`13px`, `27px`) ohne Grund.
- [ ] 🟡 **DSGN-04 Einheitliche Typo-Skala.**
  Prüfen: `font-size`/`line-height` über die Seiten. Pass: definierte Stufen statt beliebiger Werte, lesbare Zeilenlängen.
- [ ] ⚪ **DSGN-05 Radius, Schatten, Breakpoints tokenisiert.**
  Prüfen: `border-radius`, `box-shadow`, Media-Query-Grenzen. Pass: aus zentralen Werten, über Komponenten hinweg konsistent.
- [ ] 🟡 **DSGN-06 Kein toter oder duplizierter Style.**
  Prüfen: ungenutzte Klassen, doppelte Komponenten, auskommentierte Style-Blöcke. Pass: aufgeräumt, keine offensichtlichen Leichen.
- [ ] ⚪ **DSGN-07 Theme-Varianten konsistent (falls vorhanden).**
  Prüfen: alle Tokens in jedem Theme (z. B. Dark/Light) gesetzt. Pass: keine fehlenden Variablen, kein gebrochener Kontrast in einer Variante.

---

## ICON · Favicon und App-Icons

- [ ] 🔴 **ICON-01 `favicon.ico` vorhanden und referenziert.**
  Prüfen: Datei im Root von `public/`, Link im `<head>`; Tab im Browser. Pass: Favicon erscheint, keine 404 auf `/favicon.ico`.
- [ ] 🟠 **ICON-02 `favicon.svg` (skalierbar).**
  Prüfen: `<link rel="icon" type="image/svg+xml">`. Pass: scharf in allen Größen; optional dark-mode-tauglich.
- [ ] 🟠 **ICON-03 `apple-touch-icon.png` (180x180).**
  Prüfen: `<link rel="apple-touch-icon">` und Datei. Pass: vorhanden, korrekt dimensioniert, sauberer Hintergrund.
- [ ] 🟡 **ICON-04 Web-App-Manifest.**
  Prüfen: `site.webmanifest`/`manifest.json` mit `name`, `short_name`, `icons` (192 und 512 px), `theme_color`, `background_color`, `display`. Pass: verlinkt und valide.
- [ ] 🟡 **ICON-05 `theme-color` gesetzt.**
  Prüfen: `<meta name="theme-color">`. Pass: passende Markenfarbe.
- [ ] ⚪ **ICON-06 Maskable-Icon (nur bei PWA-Anspruch).**
  Prüfen: maskable Icon mit Safe-Zone im Manifest. Pass: vorhanden, falls Installierbarkeit gewünscht.
- [ ] 🟡 **ICON-07 Icons visuell verifiziert.**
  Prüfen: Browser-Tab, Lesezeichen, Mobile-Homescreen. Pass: konsistent zur Marke, nichts abgeschnitten/verpixelt.

---

## SEC · Sicherheit

- [ ] 🔴 **SEC-01 HTTPS erzwungen.**
  Prüfen: `http://`-Aufruf der Domain. Pass: 301 auf `https://`, keine erreichbare unverschlüsselte Variante.
- [ ] 🟠 **SEC-02 HSTS-Header.**
  Prüfen: Response-Header `Strict-Transport-Security`. Pass: lange `max-age` (z. B. 1 Jahr), idealerweise `includeSubDomains`.
- [ ] 🟠 **SEC-03 `X-Content-Type-Options: nosniff`.**
  Prüfen: Response-Header. Pass: gesetzt.
- [ ] 🟠 **SEC-04 `Referrer-Policy` gesetzt.**
  Prüfen: Response-Header. Pass: z. B. `strict-origin-when-cross-origin`.
- [ ] 🟠 **SEC-05 `Permissions-Policy` restriktiv.**
  Prüfen: Response-Header. Pass: nicht benötigte Features aus (z. B. `camera=(), microphone=(), geolocation=()`).
- [ ] 🟠 **SEC-06 Content-Security-Policy vorhanden.**
  Prüfen: Response-Header `Content-Security-Policy`; gegen den realen Build testen (Inline-Styles, JSON-LD, Form-Ziele, Bild-CDNs beachten). Pass: so streng wie möglich (`default-src 'self'`, `frame-ancestors 'self'`), Seite funktioniert ohne CSP-Konsolenfehler.
  Ausnahme Live-Vorschau: Das gilt für die Produktionsseite. Der separate Vorschau-Worker (Sanity-Presentation) MUSS in `frame-ancestors` die Studio- und Dashboard-Hosts erlauben, sonst kann Presentation die Vorschau nicht einbetten: `frame-ancestors 'self' https://*.sanity.studio https://sanity.io https://*.sanity.io http://localhost:3333`. Nur dieser Worker, nie die Produktion. Siehe sanity.md, Abschnitt "Live preview / Visual editing".
- [ ] 🟠 **SEC-07 Clickjacking-Schutz.**
  Prüfen: `frame-ancestors` in CSP bzw. `X-Frame-Options`. Pass: Einbetten in fremde Frames unterbunden. Ausnahme: der Live-Vorschau-Worker erlaubt bewusst die Sanity-Hosts (siehe SEC-06); das betrifft nur die Vorschau, nicht die Produktion.
- [ ] 🔴 **SEC-08 Keine Secrets im Client/Repo.**
  Prüfen: `dist/`-JS und Repo nach Keys/Tokens (`git grep -i "secret\|api_key\|token\|password"`). Pass: keine privaten Schlüssel im ausgelieferten Code oder in der Git-History.
- [ ] 🟠 **SEC-09 Externe `_blank`-Links abgesichert.**
  Prüfen: `target="_blank"`-Links. Pass: `rel="noopener noreferrer"` gesetzt.
- [ ] 🟡 **SEC-10 SRI für externe Skripte.**
  Prüfen: per CDN eingebundene Skripte. Pass: `integrity` + `crossorigin` gesetzt (oder Skript selbst gehostet).
- [ ] 🟠 **SEC-11 Kein Mixed Content.**
  Prüfen: Konsole/Netzwerk live. Pass: keine `http://`-Ressourcen auf einer https-Seite.
- [ ] 🔴 **SEC-12 SSL-Zertifikat gültig und vollständig.**
  Prüfen: SSL Labs (ssllabs.com) oder Browser-Zertifikatsinfo. Pass: gültige, vollständige Kette, Auto-Renew, kein baldiger Ablauf, Note A.
- [ ] 🟡 **SEC-13 Security-Header-Scan bestanden.**
  Prüfen: securityheaders.com / Mozilla Observatory gegen die Live-Domain. Pass: gute Note (A/B), keine fehlenden Kern-Header.
- [ ] 🟠 **SEC-14 Formular-Missbrauchsschutz.**
  Prüfen: Spam-Schutz (Honeypot/Captcha/Provider), Rate-Limit. Pass: kein offener Spam-/Versandmissbrauch (siehe FORM-03).
- [ ] 🟠 **SEC-15 Admin-/CMS-/Studio-Zugänge abgesichert (falls vorhanden).**
  Prüfen: CMS-Login, Studio-Deploy, Preview-Endpunkte. Pass: Auth aktiv, nicht öffentlich erratbar, keine offenen Default-Credentials.
- [ ] 🟡 **SEC-16 Eingabevalidierung bei SSR/Endpoints (nur dynamisch).**
  Prüfen: API-Routen/Actions. Pass: Input validiert, keine offensichtliche Injection-/SSRF-Fläche. Bei rein statisch n/a.

---

## LEGAL · Datenschutz, DSGVO, Cookie-Consent, Recht

> Rechtsdetails sind länderabhängig (DE/AT/CH/IT). Im Zweifel juristisch prüfen lassen. Diese Punkte sichern die typischen Pflichten für DACH/EU.

- [ ] 🔴 **LEGAL-01 Impressum vollständig.**
  Prüfen: Impressumsseite gegen die Pflichtangaben des jeweiligen Landes (Inhaber/Firma, ladungsfähige Anschrift, Kontakt, Vertretungsberechtigte, Register/USt-ID bzw. Partita IVA, ggf. branchenspezifische Angaben). Pass: alle Pflichtfelder echt und korrekt.
- [ ] 🔴 **LEGAL-02 Datenschutzerklärung vollständig und aktuell.**
  Prüfen: Verantwortlicher, Rechtsgrundlagen, eingesetzte Dienste (Hosting, Formular-Provider, CMS, Analytics, Maps, Fonts), Betroffenenrechte, Stand-Datum. Pass: spiegelt die real eingesetzten Tools, nichts Fiktives.
- [ ] 🔴 **LEGAL-03 Cookie-/Consent-Banner falls einwilligungspflichtig.**
  Prüfen: werden einwilligungspflichtige Cookies/Tools genutzt (Analytics, Maps, YouTube, externe Fonts, Marketing)? Wenn ja: Consent-Banner. Pass: Opt-in vor dem Laden, Ablehnen so einfach wie Zustimmen, granulare Auswahl, Widerruf möglich, Auswahl wird gespeichert. Wenn keine zustimmungspflichtigen Tools: bewusst keinen Banner (Notiz).
- [ ] 🔴 **LEGAL-04 Keine zustimmungspflichtigen Tools vor Consent geladen.**
  Prüfen: Netzwerk-Tab im Initialzustand (vor Klick). Pass: Analytics/Maps/YouTube/externe Fonts/Marketing-Skripte feuern erst nach Einwilligung.
- [ ] 🔴 **LEGAL-05 Schriften lokal gehostet.**
  Prüfen: keine Requests an `fonts.googleapis.com`/`fonts.gstatic.com` o. Ä. Pass: Fonts liegen lokal (kein ungefragter US-Transfer der IP).
- [ ] 🟠 **LEGAL-06 Externe Embeds erst nach Consent / 2-Klick.**
  Prüfen: Karten, Videos, Social-Embeds. Pass: laden erst nach Zustimmung oder als Platzhalter mit Klick-Freigabe. Reine Link-Buttons (z. B. `<a>` zu Google Maps) sind unkritisch.
- [ ] 🟠 **LEGAL-07 Auftragsverarbeitung (AVV) geklärt.**
  Prüfen: AVV mit Hoster, Formular-Provider, CMS, Analytics abgeschlossen und in der Datenschutzerklärung benannt. Pass: vorhanden für alle Verarbeiter.
- [ ] 🔴 **LEGAL-08 Kontaktformular datenschutzkonform.**
  Prüfen: Datenschutzhinweis/Consent am Formular, Zweckbindung, nur nötige Felder, TLS-Übertragung. Pass: alles vorhanden (siehe FORM-05).
- [ ] 🔴 **LEGAL-09 Impressum und Datenschutz von überall erreichbar.**
  Prüfen: Footer-Links auf jeder Seite (inkl. Landing/Danke). Pass: beide jederzeit mit einem Klick erreichbar.
- [ ] 🟠 **LEGAL-10 Newsletter rechtskonform (falls vorhanden).**
  Prüfen: Double-Opt-in, Abmeldelink, Datenschutzhinweis. Pass: vorhanden, falls Newsletter existiert.
- [ ] 🟡 **LEGAL-11 IP-Anonymisierung / Datensparsamkeit beim Tracking.**
  Prüfen: Analytics-Konfiguration. Pass: anonymisiert/cookieless wo möglich, keine unnötige Datensammlung.
- [ ] 🔴 **LEGAL-12 Rechtstexte freigegeben.**
  Prüfen: Impressum und Datenschutz vom Kunden bzw. juristisch final freigegeben. Pass: Freigabe dokumentiert, keine Platzhalter.

---

## ANALYTICS · Analytics, Tracking, Search Console

- [ ] 🟠 **ANALYTICS-01 Analytics consent-konform eingebunden.**
  Prüfen: gewähltes Tool (cookieless wie Plausible/Fathom oder consent-gebunden wie GA4). Pass: lädt erst nach Consent, falls einwilligungspflichtig; in Datenschutz benannt.
- [ ] 🟠 **ANALYTICS-02 Google Search Console verifiziert.**
  Prüfen: Property in GSC. Pass: Domain-Property verifiziert (bevorzugt) oder URL-Präfix.
- [ ] 🟡 **ANALYTICS-03 Bing Webmaster Tools verifiziert.**
  Prüfen: Bing-Property. Pass: verifiziert (hilft auch Copilot/AI-Suche). Optional.
- [ ] 🔴 **ANALYTICS-04 Sitemap in GSC eingereicht (am Launch-Tag).**
  Prüfen: GSC → Sitemaps. Pass: Sitemap-URL eingereicht und ohne Fehler gelesen.
- [ ] 🟡 **ANALYTICS-05 Conversion-/Event-Tracking definiert.**
  Prüfen: Formular-Submit, Anrufe, wichtige Klicks. Pass: Events sauber gemessen, falls gewünscht.
- [ ] 🔴 **ANALYTICS-06 Keine Test-/Dev-Tracking-IDs in Produktion.**
  Prüfen: Mess-IDs im Build. Pass: echte Prod-IDs, keine Platzhalter/Sandbox-IDs.
- [ ] 🟡 **ANALYTICS-07 Tag Manager sauber (falls genutzt).**
  Prüfen: Container, Trigger. Pass: kein Tracking-Tag feuert vor Consent.

---

## LINK · Links, Navigation, Fehlerseiten

- [ ] 🔴 **LINK-01 Keine internen toten Links.**
  Prüfen: Broken-Link-Scan (Crawler) über die ganze Seite. Pass: keine internen 404, korrekte Trailing-Slash-Form.
- [ ] 🟠 **LINK-02 Externe Links funktionieren und sind korrekt attribuiert.**
  Prüfen: externe Links anklicken; `rel`/`target`. Pass: Ziel erreichbar, `_blank` mit `rel="noopener noreferrer"` (siehe SEC-09).
- [ ] 🔴 **LINK-03 Custom 404-Seite vorhanden.**
  Prüfen: `src/pages/404.astro`; live eine Nonsens-URL aufrufen. Pass: gebrandete 404 mit echtem HTTP-Status 404, Navigationsweg zurück, `noindex`.
- [ ] 🟡 **LINK-04 Fehlerseite bei SSR (falls dynamisch).**
  Prüfen: 500-/Error-Handling bei Server-Output. Pass: saubere Fehlerseite. Bei rein statisch n/a.
- [ ] 🟠 **LINK-05 Keine Redirect-Ketten oder -Loops.**
  Prüfen: wichtige Einstiegs-URLs mit `curl -IL`. Pass: maximal ein Hop, keine Schleifen.
- [ ] 🟠 **LINK-06 Navigation vollständig, aktiver Zustand korrekt.**
  Prüfen: Haupt- und Footer-Navigation. Pass: alle Zielseiten verlinkt, aktiver Menüpunkt markiert.
- [ ] 🔴 **LINK-07 `tel:`/`mailto:`-Links echt.**
  Prüfen: `grep -rn "tel:\|mailto:" dist/`. Pass: echte Nummer/Adresse, keine Platzhalter, funktionieren.
- [ ] 🟠 **LINK-08 Social-Links zeigen auf echte Profile.**
  Prüfen: alle Social-Icons. Pass: echte Profile, keine Sackgassen auf Plattform-Startseiten.

---

## MIG · Relaunch und Migration

> `[Relaunch]` Nur bei Ablösung einer bestehenden Seite. Diese Sektion entscheidet, ob Rankings den Umzug überleben. Bei Erstlaunch komplett überspringen (mit Notiz).

- [ ] 🔴 **MIG-01 [Relaunch] Vollständiges URL-Inventar der alten Seite.**
  Prüfen: Crawl der alten Seite + alte Sitemap + GSC-Seiten + Server-Logs zusammenführen. Pass: Liste aller alten indexierten/verlinkten URLs liegt vor.
- [ ] 🔴 **MIG-02 [Relaunch] 301-Redirect-Map alt → neu.**
  Prüfen: für jede relevante alte URL eine Zielregel (`_redirects`/Host-Config). Pass: jede alte URL führt per 301 auf das beste neue Pendant (oder bewusst zur passenden Oberseite), nicht pauschal alles auf die Startseite.
- [ ] 🟠 **MIG-03 [Relaunch] URL-Struktur möglichst beibehalten.**
  Prüfen: neue Slugs vs. alte. Pass: gleiche URLs wo möglich; Änderungen sauber per 301 abgefangen.
- [ ] 🟠 **MIG-04 [Relaunch] Keine Redirect-Ketten.**
  Prüfen: alte URLs mit `curl -IL`. Pass: alt → direkt final (kein alt → alt2 → neu).
- [ ] 🔴 **MIG-05 [Relaunch] Redirects live stichprobenartig getestet.**
  Prüfen: nach DNS-Umstellung mehrere Top-URLs live aufrufen. Pass: 301 auf korrektes Ziel, Status 200 am Ende.
- [ ] 🟠 **MIG-06 [Relaunch] Backlink-Ziele erhalten.**
  Prüfen: am stärksten verlinkte alte URLs (aus Backlink-Tool/GSC) gezielt prüfen. Pass: alle leiten korrekt weiter (Linkkraft bleibt erhalten).
- [ ] 🟠 **MIG-07 [Relaunch] Ranking-Inhalte mindestens gleichwertig.**
  Prüfen: Titel, Descriptions, Hauptinhalt, interne Verlinkung der bisher rankenden Seiten. Pass: inhaltlich gleichwertig oder besser, nicht abgespeckt.
- [ ] 🟠 **MIG-08 [Relaunch] Strukturierte Daten übernommen.**
  Prüfen: Schema der wichtigen alten Seiten. Pass: auf den neuen Pendants vorhanden.
- [ ] 🔴 **MIG-09 [Relaunch] GSC-Adressänderung bei Domainwechsel.**
  Prüfen: bei echtem Domainwechsel GSC-Tool "Adressänderung". Pass: durchgeführt; alte und neue Property parallel überwacht.
- [ ] 🟠 **MIG-10 [Relaunch] Alte Sitemap kurzfristig behalten.**
  Prüfen: alte Sitemap bleibt vorübergehend erreichbar/eingereicht. Pass: hilft Google, die 301 schneller zu entdecken.
- [ ] 🟠 **MIG-11 [Relaunch] Baseline dokumentiert.**
  Prüfen: vor Launch Rankings, Top-Seiten, Traffic, indexierte URL-Zahl festhalten. Pass: Vergleichswerte gesichert.
- [ ] 🟠 **MIG-12 [Relaunch] Indexierbare URLs alt vs. neu abgeglichen.**
  Prüfen: Anzahl/Set der indexierbaren URLs vergleichen. Pass: keine wichtige Seite unbeabsichtigt verloren.
- [ ] 🟠 **MIG-13 [Relaunch] DNS-TTL vor Umzug gesenkt.**
  Prüfen: TTL einige Stunden/Tage vorher reduzieren. Pass: schneller, sauberer Cutover möglich.
- [ ] 🟠 **MIG-14 [Relaunch] 404-Monitoring nach Launch geplant.**
  Prüfen: GSC-Abdeckung + Server-Logs in den Tagen danach. Pass: Plan steht, vergessene URLs werden nachgeroutet.

---

## FORM · Formulare und Conversion

- [ ] 🔴 **FORM-01 Jedes Formular real getestet.**
  Prüfen: echte Test-Submission. Pass: Danke-/Erfolgszustand erscheint und die Mail kommt tatsächlich an (auch Spam-Ordner checken).
- [ ] 🔴 **FORM-02 Endpoint/Provider-ID ist echt.**
  Prüfen: Form-Action/Endpoint im Code. Pass: echte ID/URL, kein Platzhalter (z. B. kein `DEIN-FORM-ID`).
- [ ] 🟠 **FORM-03 Spam-Schutz aktiv.**
  Prüfen: Honeypot/Captcha/Provider-Schutz. Pass: vorhanden und funktioniert (siehe SEC-14).
- [ ] 🟠 **FORM-04 Validierung und Fehlerzustände.**
  Prüfen: leeres/fehlerhaftes Absenden. Pass: Pflichtfeld-Validierung, klare und a11y-verknüpfte Fehlermeldungen (siehe A11Y-07), Fehlerfall sauber behandelt.
- [ ] 🔴 **FORM-05 Datenschutz am Formular.**
  Prüfen: Consent-Hinweis/Checkbox, nur nötige Felder. Pass: DSGVO-konform (siehe LEGAL-08).
- [ ] 🟠 **FORM-06 Danke-/Bestätigungsseite korrekt.**
  Prüfen: Redirect-Ziel nach Submit. Pass: existiert, `noindex`, sinnvoller Weiterweg.
- [ ] 🟠 **FORM-07 Empfängeradresse korrekt und überwacht.**
  Prüfen: Zieladresse im Provider/Code. Pass: echte, gelesene Mailbox; Zustellung verifiziert.
- [ ] ⚪ **FORM-08 Autoresponder/Bestätigung an Absender (optional).**
  Prüfen: Bestätigungsmail. Pass: vorhanden, falls gewünscht.

---

## CMS · Sanity und CMS-Inhalte

> Nur wenn ein CMS (z. B. Sanity) angebunden ist. Sicherheit und Recht des CMS stehen separat (SEC-15, LEGAL-02, LEGAL-07). Ohne CMS komplett überspringen (mit Notiz).

- [ ] 🟠 **CMS-01 Nur veröffentlichte Inhalte live.**
  Prüfen: Query-Perspektive (Produktion fix auf `perspective: 'published'` bzw. `useCdn: true`), Build gegen das Prod-Dataset. Pass: keine Entwürfe/unpublished Dokumente im Live-Build, kein Preview-Token in Produktion. Entwürfe nur im separaten Vorschau-Build (eigener Worker), nie im statischen Output. Dort kommt die Perspektive aus dem Studio-Cookie (`perspectiveCookieName`): Einzelwert bleibt String (`'drafts'`), ein kommagetrennter Stack (`'drafts,published'`) wird zum `string[]`; kein hartcodiertes `previewDrafts`. Siehe sanity.md, Abschnitt "Live preview / Visual editing".
- [ ] 🟠 **CMS-02 Pflichtfelder gefüllt.**
  Prüfen: Kerninhalte (Titel, Slug, Bild, Text) über alle Dokumente. Pass: keine leeren Pflichtfelder, keine leeren Blöcke im gerenderten HTML.
- [ ] 🟠 **CMS-03 References lösen auf.**
  Prüfen: verlinkte Dokumente (Autor, Kategorie, interne Verweise). Pass: keine kaputten Referenzen, kein 404 aus CMS-Links.
- [ ] 🟠 **CMS-04 Queries fangen fehlende Felder ab.**
  Prüfen: GROQ/Query-Code und Templates auf optionale Felder. Pass: fehlende optionale Werte führen nicht zu Crash oder leerem Markup, sondern werden sauber behandelt.
- [ ] 🟠 **CMS-05 CMS-Bilder optimiert, kein Layout-Shift.**
  Prüfen: Bilder laufen über die Bild-Pipeline (Sanity-Image-URL mit Maßen/Format bzw. `astro:assets`), nicht als rohe Vollauflösung. Pass: passende Größen, `width`/`height` gesetzt (siehe CFG-06, PERF-02).
- [ ] 🟡 **CMS-06 Portable Text / Rich Text rendert vollständig.**
  Prüfen: alle Block-Typen (Überschriften, Listen, Links, Embeds, Bilder) im Serializer abgedeckt. Pass: kein unrendered Block, keine rohen Marks, Links korrekt.
- [ ] 🟡 **CMS-07 Slugs eindeutig und stabil.**
  Prüfen: Slug-Feld je Dokumenttyp. Pass: eindeutig, keine Kollisionen, keine leeren Slugs (passt zu ONP-03).
- [ ] 🟡 **CMS-08 Redaktioneller Workflow funktioniert.**
  Prüfen: Studio-Login, Bearbeiten, Rebuild/Webhook. Pass: Kunde kann editieren und Änderungen erscheinen live (Build-/Deploy-Pfad verifiziert).
- [ ] 🟡 **CMS-09 Datenmodell kundentauglich.**
  Prüfen: verständliche Feldtitel/Beschreibungen, Validierungen, sinnvolle Defaults im Studio. Pass: ein Redakteur findet sich ohne Entwickler zurecht.
- [ ] 🟠 **CMS-10 Build bei leerem/teildefektem Dataset robust.**
  Prüfen: Build mit minimalen oder fehlenden Daten. Pass: bricht nicht hart ab, zeigt sinnvolle Leerzustände statt kaputter Seiten.

---

## QA · Inhalt, Redaktion, finale QA

- [ ] 🔴 **QA-01 Keine Platzhalter mehr.**
  Prüfen: `grep -rni "PLATZHALTER\|lorem ipsum\|dummy\|TODO\|TBD\|XXX\|DEIN-" src/`. Pass: keine Treffer im sichtbaren Inhalt.
- [ ] 🔴 **QA-02 Echte Kontaktdaten überall.**
  Prüfen: Telefon, E-Mail, Adresse, Öffnungszeiten in Footer, Kontaktseite, Impressum, Schema. Pass: konsistent und echt (siehe LINK-07, SD-01).
- [ ] 🟠 **QA-03 Rechtschreibung und Grammatik geprüft.**
  Prüfen: Korrektur der Hauptseiten. Pass: keine offensichtlichen Fehler.
- [ ] 🔴 **QA-04 Bildrechte geklärt.**
  Prüfen: Lizenz/Quelle aller Bilder. Pass: Nutzungsrechte vorhanden; keine ungeklärten Stockfotos, die ein echtes Objekt/Personen vortäuschen (Vertrauens- und Rechtsrisiko).
- [ ] 🔴 **QA-05 Keine erfundenen Testimonials/Bewertungen.**
  Prüfen: alle Stimmen/Reviews. Pass: echt oder entfernt (Fake-Bewertungen sind irreführende Werbung).
- [ ] 🟡 **QA-06 Markenname/Schreibweise konsistent.**
  Prüfen: über alle Seiten. Pass: einheitliche Schreibweise.
- [ ] 🟡 **QA-07 Jahres-/Copyright-Angabe aktuell.**
  Prüfen: Footer-Jahr. Pass: aktuell bzw. dynamisch generiert.
- [ ] ⚪ **QA-08 Druckansicht grob brauchbar (optional).**
  Prüfen: Browser-Druckvorschau der Kernseiten. Pass: nichts grob zerbrochen.
- [ ] 🟠 **QA-09 Keine internen Notizen/Kommentare sichtbar.**
  Prüfen: gerendertes HTML auf Entwickler-/Redaktionskommentare. Pass: nichts Internes im Output.

---

## HOST · Hosting, Deployment, DNS, Infrastruktur

- [ ] 🔴 **HOST-01 Finale Domain und kanonische Variante bestätigt.**
  Prüfen: mit Kunde abgestimmt: www vs. apex. Pass: festgelegt; entspricht `site` (CFG-01) und allen Verweisen.
- [ ] 🔴 **HOST-02 DNS korrekt und propagiert.**
  Prüfen: A/AAAA/CNAME-Records; `dig`/whatsmydns. Pass: zeigen auf den richtigen Host, weltweit propagiert.
- [ ] 🔴 **HOST-03 SSL/TLS aktiv mit Auto-Renew.**
  Prüfen: Zertifikat am Host (siehe SEC-12). Pass: gültig, automatische Verlängerung aktiv.
- [ ] 🔴 **HOST-04 www↔apex-Redirect auf kanonische Variante.**
  Prüfen: beide Varianten live aufrufen. Pass: nicht-kanonische leitet per 301 auf die kanonische.
- [ ] 🟠 **HOST-05 Build-Pipeline korrekt konfiguriert.**
  Prüfen: Build-Command (`npm run build`), Output-Verzeichnis (`dist`), Node-Version (siehe PREP-04). Pass: Auto-Deploy läuft sauber.
- [ ] 🔴 **HOST-06 Produktions-Env-Vars gesetzt.**
  Prüfen: Env im Host-Dashboard. Pass: alle benötigten Variablen mit Prod-Werten, keine Dev-Keys, keine fehlenden.
- [ ] 🟠 **HOST-07 Header-/Redirect-Dateien deployen mit.**
  Prüfen: `public/_headers`, `public/_redirects` (oder Host-Config) landen im Deploy. Pass: live wirksam (siehe SEC-Header, PERF-07).
- [ ] 🟡 **HOST-08 CDN/Edge aktiv.**
  Prüfen: Host-/CDN-Einstellungen. Pass: globale Auslieferung, Caching greift.
- [ ] 🟡 **HOST-09 Rollback-Möglichkeit vorhanden.**
  Prüfen: vorheriges Deployment/Backup verfügbar. Pass: schnelles Zurückrollen möglich.
- [ ] 🟠 **HOST-10 [Relaunch] Backup des alten Stands.**
  Prüfen: alte Seite und Daten gesichert. Pass: vollständiges Backup vor Umstellung vorhanden.

---

## MAIL · E-Mail-Zustellbarkeit der Domain

> Nur relevant, wenn über die Domain Mails versendet (Formular/Transaktion) oder empfangen werden. Sonst mit Notiz überspringen.

- [ ] 🟠 **MAIL-01 SPF-Record korrekt.**
  Prüfen: DNS TXT (SPF). Pass: erlaubt die tatsächlichen Versender, keine Syntaxfehler.
- [ ] 🟠 **MAIL-02 DKIM eingerichtet.**
  Prüfen: DKIM-DNS-Eintrag des Versenders. Pass: vorhanden und signierend.
- [ ] 🟡 **MAIL-03 DMARC-Policy vorhanden.**
  Prüfen: `_dmarc` TXT-Record. Pass: Policy gesetzt (mind. `p=none` mit Reporting).
- [ ] 🟠 **MAIL-04 MX-Records korrekt (falls Mailbox an der Domain).**
  Prüfen: MX-Records. Pass: zeigen auf den richtigen Mailprovider.
- [ ] 🟠 **MAIL-05 Zustellbarkeit getestet.**
  Prüfen: mail-tester.com oder echte Test-Mail an Gmail/Outlook. Pass: landet im Posteingang, nicht im Spam.

---

## MON · Monitoring und Post-Launch

- [ ] 🟠 **MON-01 Uptime-Monitoring eingerichtet.**
  Prüfen: Monitor auf die Live-URL. Pass: Benachrichtigung bei Ausfall aktiv.
- [ ] 🟡 **MON-02 Error-Tracking (bei SSR/JS-Apps).**
  Prüfen: Fehler-Logging/Sentry o. Ä. Pass: aktiv, falls dynamische Logik vorhanden.
- [ ] 🟠 **MON-03 GSC-Indexierung nach Launch beobachten.**
  Prüfen: GSC-Abdeckung in den Tagen nach Launch. Pass: Seiten werden indexiert, keine massiven Fehler.
- [ ] 🟠 **MON-04 Crawl-/404-Fehler überwachen.**
  Prüfen: GSC + Server-Logs. Pass: auftretende 404 werden nachgeroutet (besonders [Relaunch]).
- [ ] 🟡 **MON-05 Core Web Vitals im Feld beobachten.**
  Prüfen: GSC-CWV / CrUX. Pass: keine Verschlechterung im Feld.
- [ ] 🟠 **MON-06 [Relaunch] Rankings/Traffic gegen Baseline.**
  Prüfen: Vergleich zur MIG-11-Baseline in den Wochen nach Launch. Pass: kein nachhaltiger Einbruch; Auffälligkeiten untersucht.
- [ ] 🟡 **MON-07 Indexierung wichtiger Seiten anstoßen.**
  Prüfen: GSC "URL-Prüfung → Indexierung beantragen" für Kernseiten. Pass: angefragt.
- [ ] 🟡 **MON-08 Backup-Routine aktiv.**
  Prüfen: regelmäßige Sicherung (Repo + ggf. CMS-Daten). Pass: automatisiert oder dokumentiert.

---

## DAY · Launch-Day-Sequenz

> Empfohlene Reihenfolge am eigentlichen Go-Live-Tag. Erst ausführen, wenn alle 🔴-Punkte oben grün sind.

- [ ] 🔴 **DAY-01 Finaler Build, alle Blocker grün.**
  Pass: `npm run build` sauber, alle 🔴 erledigt oder begründet n/a.
- [ ] 🔴 **DAY-02 Staging-noindex / Passwortschutz entfernt.**
  Pass: Prod ist frei crawlbar (siehe SEO-06, SEO-10).
- [ ] 🔴 **DAY-03 robots.txt und Canonicals gegen echte Domain final geprüft.**
  Pass: kein `Disallow: /`, absolute self-referencing Canonicals (siehe SEO-03, SEO-08).
- [ ] 🔴 **DAY-04 DNS umgestellt / Domain verbunden.**
  Pass: Domain zeigt auf das neue Deployment (siehe HOST-02).
- [ ] 🔴 **DAY-05 HTTPS und Redirects live verifiziert.**
  Pass: http→https und www↔apex korrekt (siehe SEC-01, HOST-04); [Relaunch] alte URLs leiten weiter (siehe MIG-05).
- [ ] 🔴 **DAY-06 Live-Smoke-Test.**
  Pass: Startseite, Kernseiten, Formular (echte Test-Submission), 404 funktionieren live.
- [ ] 🟠 **DAY-07 Sitemap in GSC einreichen und Indexierung anstoßen.**
  Pass: Sitemap eingereicht (siehe ANALYTICS-04), Kernseiten zur Indexierung angefragt.
- [ ] 🟠 **DAY-08 Analytics-Echtzeit prüfen.**
  Pass: consent-konform, Daten kommen an (siehe ANALYTICS-01).
- [ ] 🟠 **DAY-09 Cache/CDN purgen.**
  Pass: alter Cache geleert, frische Version wird ausgeliefert.
- [ ] 🟠 **DAY-10 OG-Preview und Rich Results live nachtesten.**
  Pass: Social-Vorschau korrekt, Rich Results Test ohne Fehler (siehe SEO-11, SD-06).

---

## Tooling-Anhang

**Lokale Befehle:**
- Build: `npm run build`
- Vorschau des Prod-Builds: `npm run preview`
- Astro-/Typcheck: `npm run astro -- check`
- Audit: `npm audit`
- Astro-Skill-Preflight (falls im Repo): `node .claude/skills/upgreight-astro-website/scripts/preflight.mjs ./dist --site https://<domain>`
- Platzhalter/Reste suchen: `grep -rni "PLATZHALTER\|lorem\|dummy\|TODO\|DEIN-\|noindex\|http://" src/ dist/`
- Hardcodete Farben finden (siehe DSGN-01): `grep -rin "#[0-9a-f]\{3,6\}\|rgb(\|hsl(" src/`
- Font-Hardcoding finden (siehe DSGN-02): `grep -rin "font-family" src/`
- Header/Redirects live prüfen: `curl -sI https://<domain>` und `curl -sIL https://<alte-url>`
- Headings zählen: `grep -c "<h1" dist/<seite>.html`

**Externe Validatoren:**
- Lighthouse (in Chrome DevTools) und PageSpeed Insights: `pagespeed.web.dev`
- Accessibility: axe DevTools, WAVE (`wave.webaim.org`), Kontrast: `webaim.org/resources/contrastchecker`
- Structured Data: Google Rich Results Test (`search.google.com/test/rich-results`), Schema Markup Validator (`validator.schema.org`)
- robots.txt und Sitemap: GSC-Tools; XML-Sitemap-Validator
- Security-Header: `securityheaders.com`, Mozilla Observatory
- SSL/TLS: SSL Labs (`ssllabs.com/ssltest`)
- Open Graph / Social-Preview: `opengraph.xyz`, `metatags.io`, plattformeigene Debugger
- Broken Links: Screaming Frog (Free bis 500 URLs) oder ein Link-Checker
- DNS-Propagation: `whatsmydns.net`, `dig`
- E-Mail-Zustellbarkeit: `mail-tester.com`
- Detail-Performance: `webpagetest.org`

---

## Erweiterung dieser Liste

Wenn beim Durchlauf eines Projekts ein wichtiger Punkt fehlt, hier ergänzen (mit ID-Schema der jeweiligen Sektion), damit das Template über die Projekte hinweg besser wird. Diese Datei ist als lebendes Dokument gedacht.
