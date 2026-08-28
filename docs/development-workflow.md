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

1. Vor dem Release alle betroffenen Ausgabeflächen bestimmen:
   - Website-Code, Design oder Layout: Produktions-Build **und** den separaten
     Sanity-Preview-Worker aktualisieren.
   - Sanity-Schema oder Darstellung der Eingabefelder: Sanity Studio neu bauen
     und deployen.
   - Redaktionelle Inhalte: betroffene veröffentlichte Datensätze aktualisieren
     und anschließend den statischen Produktions-Build beziehungsweise den
     Sanity-Webhook bis zur Live-Auslieferung verfolgen.
   Sobald mehrere Punkte betroffen sind, werden alle zugehörigen Releases als
   ein gemeinsamer Abschluss behandelt.
2. Den vollständigen resultierenden `main`-Stand prüfen; jeder Push nach
   `main` kann einen Cloudflare-Produktionsbuild auslösen.
3. Den Produktions-Build lokal ausführen und nur die beauftragten Dateien
   explizit committen.
4. `main` nach GitHub pushen und den automatischen beziehungsweise bewusst
   gestarteten Cloudflare-Build abwarten.
5. Bei einer Website-Änderung die Sanity-Vorschau mit
   `npm run build:preview` und `npm run deploy:preview` synchronisieren. Bei
   einer Studio-/Schemaänderung zusätzlich `npm run build:studio` und
   `npm run deploy:studio` ausführen. Betroffene veröffentlichte Inhaltsfelder
   werden danach read-only gegen den erwarteten Stand abgefragt.
6. Im normalen Projektordner `npm run verify:release-sync` ausführen. Der Befehl
   aktualisiert `origin/main` und bestätigt erst dann Erfolg, wenn lokales
   `main`, GitHub und `/release-status.json` der Live-Seite exakt denselben
   Commit ausweisen. Standardmäßig wartet er bis zu zehn Minuten auf
   Cloudflare.
7. Erst nach erfolgreicher Prüfung aller betroffenen Website-, Preview-,
   Studio-, Schema- und Inhaltsstände gilt der Release als abgeschlossen. Der
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
