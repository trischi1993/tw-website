# E-Book-Live-Architektur — verbindlich

Stand: 13. August 2026

Diese Datei vor jeder Änderung an der E-Book-Seite, dem Checkout, Systeme.io,
Cloudflare oder den E-Book-URLs vollständig lesen.

## Zweck

Die öffentlich bekannte Adresse `https://ebook.tristanweithaler.com/` bleibt
unverändert. Unter derselben Domain werden zwei Quellen kombiniert:

| Öffentlicher Pfad | Quelle |
|---|---|
| `/` | neue Astro-E-Book-Landingpage aus `tristanweithaler-ebook` |
| `/bestellen/` | neue Astro-Bestellseite aus `tristanweithaler-ebook` |
| `/bestellformular` | bestehendes Systeme.io-Bestellformular |
| `/dankeseite` | bestehende Systeme.io-Dankeseite |
| `/agb` | bestehende Systeme.io-Seite |
| `/datenschutzerklaerung` | bestehende Systeme.io-Seite |
| `/impressum` | bestehende Systeme.io-Seite |
| alle anderen nicht lokalen Pfade | unverändert zum Systeme.io-Ursprung |

## Cloudflare- und Systeme.io-Vertrag

- Die Domain `ebook.tristanweithaler.com` bleibt in Systeme.io verbunden.
- Der DNS-Eintrag bleibt ein CNAME mit Name `ebook` und Ziel
  `d2cegqnkw9qs8o.cloudfront.net`.
- Der CNAME steht in Cloudflare auf **Proxied** (orange Wolke).
- Die Worker-Route `ebook.tristanweithaler.com/*` verweist auf
  `tristanweithaler-ebook`.
- Der Worker läuft als **Route vor dem bestehenden Ursprung**, nicht als
  Cloudflare Worker Custom Domain.
- Die maßgebliche Konfiguration ist `wrangler.ebook.jsonc`, der Router liegt in
  `src/workers/ebook.ts`.

Cloudflare entscheidet anhand des Pfades: Die zwei neuen Seiten und ihre
lokalen Assets kommen aus dem Astro-Build; alle übrigen Anfragen werden an den
weiterhin im DNS hinterlegten Systeme.io-/CloudFront-Ursprung durchgereicht.
Die frühere Systeme.io-Landingpage existiert dort weiterhin, wird öffentlich
unter `/` aber vom Worker überlagert.

## Checkout-Abhängigkeiten

Die Seite `/bestellen/` bettet `/bestellformular` unter demselben öffentlichen
Host ein. Diese Same-Origin-Eigenschaft ist beabsichtigt:

- UTM-, Affiliate- und Kampagnenparameter werden an das Formular weitergegeben.
- Systeme.io-Cookies und der Purchase-Prozess bleiben erhalten.
- Systeme.io leitet nach erfolgreichem Kauf automatisch zum nächsten
  Funnelschritt `/dankeseite` weiter.
- `src/components/EbookCheckout.astro` erkennt diese Navigation und öffnet die
  Dankeseite im gesamten Browser statt nur im zugeschnittenen iframe.

Darum `/bestellformular` nicht ohne gleichzeitige Überarbeitung und vollständige
Browser-/Kauftests auf eine andere Domain oder Systeme.io-URL umstellen.

## Nicht ohne ausdrückliche Freigabe ändern

1. Die E-Book-Domain nicht aus Systeme.io entfernen oder dort entknüpfen.
2. Den CNAME `ebook` nicht löschen und sein CloudFront-Ziel nicht ersetzen.
3. Den Proxy-Status nicht dauerhaft auf `DNS only` zurückstellen.
4. Die Worker-Route nicht durch eine Worker Custom Domain ersetzen.
5. Systeme.io-Pfade nicht versehentlich aus dem Worker selbst ausliefern.
6. Cookies, Query-Parameter oder die Dankeseiten-Erkennung nicht entfernen.

## Prüfung nach jeder relevanten Änderung

Mindestens kontrollieren:

1. `/` liefert die neue Landingpage mit Status 200.
2. `/bestellen/` liefert die neue Bestellseite mit Status 200.
3. `/bestellformular` liefert das Systeme.io-Formular mit Status 200 und setzt
   weiterhin den Purchase-Prozess-Cookie.
4. `/dankeseite`, `/agb`, `/datenschutzerklaerung` und `/impressum` liefern die
   bestehenden Systeme.io-Seiten mit Status 200.
5. Systeme.io enthält weiterhin
   `nextStepUrl: https://ebook.tristanweithaler.com/dankeseite`.
6. Kampagnenparameter erreichen `/bestellen/` und anschließend das Formular.
7. Nach Änderungen am Checkout einen echten Testkauf einschließlich Zahlung,
   E-Mail-Auslieferung und Vollseiten-Weiterleitung durchführen lassen.

## Rückfallweg

Wenn der neue E-Book-Worker Probleme verursacht, die Worker-Route
`ebook.tristanweithaler.com/*` entfernen. Da CNAME und Systeme.io-Verknüpfung
unverändert bleiben, wird anschließend wieder die bisherige Systeme.io-Seite
ausgeliefert. DNS und Systeme.io dafür nicht voreilig löschen oder neu
verbinden.
