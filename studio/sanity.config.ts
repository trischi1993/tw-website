import { createElement, Fragment } from 'react';
import { defineConfig, type LayoutProps } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { structure, SINGLETONS } from './structure';
import { resolve } from './resolve';
import PagesNavigator from './components/PagesNavigator';
import { DescriptionTooltipField } from './components/DescriptionTooltipField';
import { EditorKeyForwarder } from './components/EditorKeyForwarder';
import { CompactFormStyles } from './components/CompactFormStyles';
import { CanvasAutofocusGuard } from './components/CanvasAutofocusGuard';

/**
 * Studio-weites Layout: injiziert die kompakte Formular-CSS (CompactFormStyles
 * schreibt sie imperativ in document.head - React 19 rendert ein `<style>` im
 * Layout-Baum nicht zuverlässig) und hängt den EditorKeyForwarder an (cmd+E
 * öffnet die Insert-Palette in der Vorschau, auch bei Fokus im Studio-Fenster;
 * Gegenstück: src/preview/InsertPalette.tsx). Rendert sonst das Default.
 */
function studioLayout(props: LayoutProps) {
  return createElement(
    Fragment,
    null,
    createElement(CompactFormStyles),
    props.renderDefault(props),
    createElement(EditorKeyForwarder),
    createElement(CanvasAutofocusGuard),
  );
}

/**
 * Studio-Konfiguration (Platzhalter, pro Projekt anpassen).
 *
 * projectId und dataset kommen aus Umgebungsvariablen, damit keine
 * projektspezifischen Werte im Code stehen:
 *   SANITY_STUDIO_PROJECT_ID   wird bei `sanity init` gesetzt
 *   SANITY_STUDIO_DATASET      Standard: „production“
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

const singletonSet = new Set<string>(SINGLETONS);

export default defineConfig({
  name: 'tristanweithaler',
  title: 'Tristan Weithaler',

  projectId: projectId || 'missing-project-id',
  dataset,

  plugins: [
    structureTool({ structure }),

    /**
     * Live-Vorschau (Stufe 2): zeigt die Webseite neben dem Formular und
     * aktualisiert sich beim Editieren. Die Vorschau-URL zeigt auf den
     * separaten Cloudflare-Worker (SANITY_STUDIO_PREVIEW_URL); lokal auf den
     * Astro-Dev-Server (`npm run dev:preview`, Port 4321).
     */
    presentationTool({
      resolve,
      /**
       * Seiten-Wechsler in der linken Spalte: feste Liste aller bearbeitbaren
       * Seiten (statt sich über die Website-Navigation oder die „verwendet
       * auf"-Hinweise durchzuklicken). Siehe components/PagesNavigator.tsx.
       */
      components: {
        unstable_navigator: {
          component: PagesNavigator,
          minWidth: 160,
          maxWidth: 240,
        },
      },
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),

    // Abfrage-Werkzeug (GROQ) – praktisch zum Testen, kann später entfernt werden.
    visionTool({ defaultApiVersion: '2024-10-01' }),
  ],

  schema: {
    types: schemaTypes,

    /**
     * Singletons aus dem „Neues Dokument“-Menü ausblenden – sie existieren
     * bereits genau einmal und sollen nicht neu angelegt werden.
     */
    templates: (templates) =>
      templates.filter((tpl) => !singletonSet.has(tpl.schemaType)),
  },

  document: {
    /**
     * Für Singletons die Aktionen „Löschen“ und „Duplizieren“ entfernen,
     * damit der Kunde die festen Dokumente nicht versehentlich entfernt
     * oder vervielfacht.
     */
    actions: (prev, { schemaType }) =>
      singletonSet.has(schemaType)
        ? prev.filter(({ action }) => action !== 'delete' && action !== 'duplicate')
        : prev,
  },

  form: {
    components: {
      /**
       * Feld-Beschreibungen global als „?“-Icon-Tooltip neben dem Titel statt
       * als grauer Fließtext unter dem Titel (siehe DescriptionTooltipField).
       */
      field: DescriptionTooltipField,
    },
  },

  studio: {
    components: {
      layout: studioLayout,
    },
  },
});
