/**
 * ch-Grenzen der Lese-Breite (Measure) für den Canvas-Resizer. MUSS mit
 * studio/schemas/objects/text/controls.ts (CH_MAX_WIDTH) übereinstimmen -
 * beide Seiten (Studio-Slider + Canvas-Griff) nutzen dieselben Bounds, damit
 * der gezogene Wert exakt dem Regler entspricht.
 *
 * Über `max` hinaus ziehen = Constraint fällt ganz weg (Auto / max-width: none).
 */
export const CH_MAX_WIDTH = {
  heading: { min: 8, max: 40, step: 0.5 },
  paragraph: { min: 20, max: 90, step: 1 },
} as const;

export type ResizableKind = keyof typeof CH_MAX_WIDTH;

export function isResizableKind(k: string | null | undefined): k is ResizableKind {
  return k === 'heading' || k === 'paragraph';
}
