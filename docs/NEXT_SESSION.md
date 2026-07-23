# Übergabe für die nächste Codex-Session

Stand: 23. Juli 2026  
Branch: `main`

## Aktueller Stand

- GitHub: `https://github.com/trischi1993/tw-website`
- Cloudflare Workers Builds sind mit GitHub verbunden:
  - Prod: `tristanweithaler-prod`
  - Preview: `tristanweithaler-preview`
- Sanity Studio: `https://tristanweithaler.sanity.studio`
- Sanity-Projekt: `45zc9nhz`, Dataset: `production`
- Sanity-Publish-Webhook `cloudflare-production-rebuild` ist vorhanden.
- Click-to-edit und Live-Islands funktionieren im Studio.
- FOUC-Fix ist aktiv; die sichtbaren Website-Animationen wurden dadurch nicht
  verändert.
- Formulare funktionieren über Form.taxi.
- Kein Analytics-, Pixel- oder Werbetracking gefunden/eingebaut.
- Vimeo und Cookie-Banner wurden entfernt.
- Das AIO-Video ist ein direktes Bunny-MP4:
  - Autoplay stumm
  - Unmute-Button funktioniert
  - Neustart startet bei 0 mit Ton
  - URL ist in Sanity unter
    `ALL-IN-ONE Coaching → Hero → Bunny-Video-URL` editierbar
- Lokal wird absichtlich nur das Video-Standbild gerendert, damit keine
  Bunny-Bandbreite verbraucht wird.
- Deployte Preview-/Prod-Builds verwenden die veröffentlichte Sanity-URL.
- In Sanity steht aktuell die vorläufige Fake-URL:
  `https://upgreight-ws.b-cdn.net/platzhalter-fake-url.mp4`
- Datenschutz wurde auf Cloudflare, Sanity, Form.taxi und Bunny aktualisiert.
- Die Domain zeigt noch auf Webflow; die Umschaltung erfolgt erst beim Go-live.

## Nächste Schritte bis Go-live

1. Website-Inhalte und Gestaltung finalisieren.
2. Finales Kundenvideo zu Bunny hochladen.
3. Finale Bunny-MP4-URL im Sanity-Video-Hero eintragen und veröffentlichen.
4. Falls gewünscht, ein echtes Video-Standbild im selben Hero hinterlegen.
5. Finalen QA-Durchlauf machen:
   - Desktop und Mobile
   - Navigation, Links, Modals und Formulare
   - Video mit Ton/Neustart
   - Sanity Click-to-edit/Publish
   - Datenschutz und Impressum
   - Browser-Konsole und 404-Seite
6. Im Kunden-Call die Domain vom bisherigen Webflow-Setup auf den
   Cloudflare-Prod-Worker umstellen.
7. Direkt nach dem DNS-Wechsel prüfen:
   - Hauptdomain und `www`
   - HTTPS/SSL
   - alle wichtigen Seiten
   - Formulare
   - Sitemap und `robots.txt`
   - alte URLs/Weiterleitungen

## Wichtig für die nächste Session

- Keine Domain- oder DNS-Änderung ohne ausdrückliche Freigabe im Kunden-Call.
- Kein Cookie-Banner nötig, solange kein Tracking oder anderer
  einwilligungspflichtiger Dienst hinzukommt.
- Sanity-Inhalte werden erst nach Publish und anschließendem
  Cloudflare-Webhook-Build auf Prod sichtbar.
- Vor Änderungen zuerst `git status`, aktuellen Commit sowie die beiden
  Cloudflare-Checks prüfen.

Empfohlener Startprompt:

> Lies bitte zuerst `docs/NEXT_SESSION.md` vollständig. Prüfe dann den aktuellen
> Git-/Cloudflare-Stand und führe mich ab dem nächsten offenen Go-live-Schritt
> wieder einzeln, kurz und robust weiter. Mache alles selbst, was du sicher
> selbst erledigen kannst.
