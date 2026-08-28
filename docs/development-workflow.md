# Entwicklungs-, Entwurfs- und Release-Workflow

Dieser Ablauf verhindert, dass aktive Entwürfe nur lokal existieren oder nach
einem Release lokales `main`, GitHub und die tatsächlich ausgelieferte Website
unterschiedliche Stände zeigen.

## 1. Arbeit beginnen

1. Im normalen Projektordner `git status`, aktuellen Branch und `origin/main`
   prüfen beziehungsweise aktualisieren.
2. Kleine, risikoarme Änderungen können direkt auf dem sauberen `main`
   erfolgen. Größere Seiten-, Layout-, CMS- oder Animationsarbeiten erhalten
   einen eigenen, vom aktuellen `main` abgeleiteten Feature-Branch und bei
   paralleler Arbeit einen eigenen Worktree.
3. Der lokale Testlink muss eindeutig dem aktiven Branch zugeordnet sein. Nach
   Abschluss einer Arbeit wird der kanonische Testserver wieder aus dem
   aktuellen `main` gestartet.

## 2. Zwischenstände und Entwürfe sichern

- Bei größeren Arbeiten werden fachlich sinnvolle Zwischenstände committed und
  der Feature-Branch nach GitHub gepusht. Ein lokaler Worktree ist keine
  Datensicherung.
- Soll ein Entwurf später fortgesetzt werden, bleibt er entweder als aktiver
  Remote-Feature-Branch erhalten oder wird bei längerer Pause mit Quellcode,
  Assets und Wiederherstellungsanleitung unter `experiments/` archiviert.
- Weiterzuführende Arbeit darf niemals ausschließlich in `/tmp`, auf einem
  lokalen Testserver oder in uncommitteten Dateien verbleiben.

## 3. Veröffentlichen

1. Den vollständigen resultierenden `main`-Stand prüfen; jeder Push nach
   `main` kann einen Cloudflare-Produktionsbuild auslösen.
2. Den Produktions-Build lokal ausführen und nur die beauftragten Dateien
   explizit committen.
3. `main` nach GitHub pushen und den automatischen beziehungsweise bewusst
   gestarteten Cloudflare-Build abwarten.
4. Im normalen Projektordner `npm run verify:release-sync` ausführen. Der Befehl
   aktualisiert `origin/main` und bestätigt erst dann Erfolg, wenn lokales
   `main`, GitHub und `/release-status.json` der Live-Seite exakt denselben
   Commit ausweisen. Standardmäßig wartet er bis zu zehn Minuten auf
   Cloudflare.
5. Erst nach erfolgreicher Prüfung gilt der Release als abgeschlossen. Der
   normale Projektordner und der kanonische Testserver stehen anschließend auf
   dem aktuellen `main`.

## 4. Branches und Worktrees bereinigen

Vor jeder Löschung werden für jeden betroffenen Worktree geprüft:

- uncommittete und ungetrackte Dateien,
- noch nicht in `main` enthaltene Commits,
- laufende lokale Testserver mit diesem Arbeitsordner,
- bewusst pausierte Entwürfe und zugehörige Assets.

Erst wenn aktive Arbeit entweder in `main`, auf einem Remote-Feature-Branch
oder unter `experiments/` gesichert ist, dürfen Worktree und integrierter Branch
entfernt werden. „Branch ist gemergt“ allein reicht nicht als Prüfung.
