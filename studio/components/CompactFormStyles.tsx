import { useEffect } from 'react';

/**
 * Kompaktere vertikale Feld-Abstände im Formular (remarkable-Dichte).
 *
 * WARUM imperativ statt eines `<style>`-Elements im Layout-Baum: React 19
 * behandelt `<style>` als hoistbare Ressource und rendert sie im Studio-Layout
 * NICHT zuverlässig ins DOM (Julians „hat auch nach Neustart nichts bewirkt").
 * Ein `useEffect`, der ein `<style id>` in `document.head` schreibt, landet
 * garantiert im DOM (idempotent, überlebt HMR beim Remount).
 *
 * Der Abstand zwischen zwei Formularfeldern ist der `grid-gap` des @sanity/ui
 * `RootStack` (`space={6}` = 52px = 3.25rem) - headless gegen die echte
 * Komponente verifiziert: `[data-ui="Stack"]:has(> [data-testid^="field-"])`
 * trifft ihn und `!important` überschreibt den styled-components-Default
 * (52px → 0.85rem). `:has(> …)` greift NUR bei Containern mit direkten Feld-
 * Kindern (Objekt-/Dokument-Formulare, auch verschachtelte Objekte), nie bei
 * Navbar/Menüs, und lässt den inneren Label↔Input-Stack (`space={2}`) in Ruhe.
 */
const CSS = `
:root { --form-field-gap: 0.85rem; }
/* Members-Container: Felder sind DIREKTE Kinder ODER eine Ebene tief gewrappt
   (Sanity huellt Feld-Zeilen bedingt in einen change-bar-Wrapper, deshalb reicht
   "> field-" allein nicht; "> * > field-" faengt den gewrappten Fall). Trifft nur
   Container mit Feldern, nie Navbar/Menues. */
[data-ui="Stack"]:has(> [data-testid^="field-"]),
[data-ui="Grid"]:has(> [data-testid^="field-"]),
[data-ui="Stack"]:has(> * > [data-testid^="field-"]),
[data-ui="Grid"]:has(> * > [data-testid^="field-"]) {
  gap: var(--form-field-gap) !important;
  row-gap: var(--form-field-gap) !important;
}
[data-testid^="field-"] + [data-testid^="field-"] { margin-top: 0 !important; }

/* Portable-Text-Editor (Rich-Text-Feld): AUTO-Hoehe statt der fixen ~300px-Box.
   Gemessen: [data-testid=pt-editor] hat height:304px + resize:vertical (Sanity-
   Default) -> deshalb griff min-height nicht (height gewinnt). height:auto laesst
   ihn mit dem Text wachsen; min-height ist der Boden fuer den leeren Zustand. Nur
   im Nicht-Vollbild (data-fullscreen=false), sonst braeche der Fullscreen-Modus
   (der height:100% braucht). */
[data-testid="pt-editor"][data-fullscreen="false"] {
  height: auto !important;
  min-height: 4em !important;
}
`;

const STYLE_ID = 'upgreight-compact-form';

export function CompactFormStyles() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }, []);
  return null;
}
