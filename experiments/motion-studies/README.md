# Motion-Studien – archivierter Entwicklungsstand

Status: am 28. August 2026 pausiert und aus einem temporären Ordner dauerhaft
in Git gesichert. Die Dateien sind nicht Teil des Astro-Builds und erzeugen
keine öffentlichen Routen oder Assets.

## Enthaltene Entwürfe

- `sources/motion-study.astro.source`: Startseitenstudie der animierten
  „Erfolgswelten“.
- `sources/motion-statement-study.astro.source`: Phone-to-Statement-Studie,
  zuletzt lokal über
  `/motion-statement-study/?qa=live-statement-final` betrachtet.
- `assets/motion-study/`: 14 zugehörige WebP-Dateien der Erfolgswelten-Studie.

Die Endung `.astro.source` verhindert, dass Prüf- oder Buildwerkzeuge diese
pausierten Seiten versehentlich als aktive Astro-Routen behandeln. Der Inhalt
entspricht unverändert den ursprünglichen `.astro`-Dateien.

## Später lokal wieder aktivieren

1. Den gewünschten Quelldateinamen von `.astro.source` auf `.astro` ändern und
   nach `src/pages/` kopieren.
2. Für die Erfolgswelten-Studie `assets/motion-study/` nach
   `public/images/motion-study/` kopieren.
3. Einen eigenen Feature-Branch vom aktuellen `main` anlegen und die Importe
   gegen den dann aktuellen Projektstand prüfen.
4. Den lokalen Dev-Server starten und den Entwurf erst nach erneuter
   responsiver Prüfung weiterentwickeln.

Ursprüngliche temporäre Sicherung:
`/private/tmp/aio-migration-excluded.M8bMsY/`. Dieser Pfad ist ausdrücklich
nicht mehr die Source of Truth; maßgeblich ist die versionierte Kopie hier.
