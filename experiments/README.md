# Pausierte Website-Entwürfe

Dieser Ordner bewahrt pausierte oder verworfene Website-Prototypen dauerhaft in
Git auf. Er liegt bewusst außerhalb von `src/` und `public/`; Astro baut seine
Inhalte daher weder als Route noch als öffentliches Asset aus.

## Verbindliche Ablagelogik

- Aktive größere Arbeiten bleiben auf einem passend benannten Feature-Branch
  und werden an sinnvollen Zwischenständen committed und nach GitHub gepusht.
- Wird ein Entwurf auf unbestimmte Zeit pausiert, kommt er mit Quellstand,
  benötigten Assets und einer Wiederherstellungsanleitung in einen eigenen
  Unterordner hier.
- Ein weiterzuführender Entwurf darf niemals ausschließlich in `/tmp`, einem
  nicht versionierten Testordner oder als uncommittete Datei verbleiben.
- Vor dem Entfernen eines Branches oder Worktrees wird geprüft, ob dort
  uncommittete beziehungsweise ungetrackte Dateien oder ein laufender
  Testserver vorhanden sind. Ein bereits gemergter Branch allein ist noch kein
  ausreichender Löschbeleg.

Jeder Unterordner benötigt eine `README.md` mit Status, ursprünglichem
Testpfad, Abhängigkeiten und konkretem Wiederherstellungsweg.
