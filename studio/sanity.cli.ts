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
  // Projektspezifische App-ID des ersten Deploys: verhindert Rueckfragen bei
  // spaeteren automatisierten Studio-Deploys.
  deployment: {
    appId: 's8ipqypo3ob9j0wvf1xec13b',
    autoUpdates: true,
  },
});
