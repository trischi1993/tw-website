import { defineCliConfig } from 'sanity/cli';

/**
 * CLI-Konfiguration für `sanity dev`, `sanity build`, `sanity deploy`
 * und `sanity dataset import`.
 *
 * Die projectId wird aus der Umgebungsvariable SANITY_STUDIO_PROJECT_ID
 * gelesen. Nach `sanity init` trägt das CLI sie hier oder in einer
 * .env-Datei ein – siehe README.md.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Kein fester studioHost: `sanity deploy` fragt den Hostnamen pro Projekt ab.
  // (Die beim ersten Deploy ausgegebene appId ist projektspezifisch - optional
  // im KUNDENPROJEKT unter deployment.appId eintragen, nie im Template.)
  /** Automatische Aktualisierung der Studio-Version im Hosting. */
  deployment: { autoUpdates: true },
});
