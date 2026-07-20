/**
 * Snap-Skala für die On-Canvas-Section-Resizer (Phase c.2: Padding + Gap).
 * Gegenstück-Referenz: flowtricks/remarkable (spacingScale.ts + sectionSpacing.ts),
 * hier an unser Token-Modell angepasst.
 *
 * EINE Quelle: die Token→CSS-Maps leben in src/lib/content/sections.ts
 * (SECTION_PAD / SECTION_GAP). Hier lösen wir jeden Token zu seiner AKTUELLEN
 * Pixel-Größe auf - Section-Padding ist responsive (`clamp()`/`vw`), hängt also
 * vom Viewport ab und MUSS live gemessen werden (nicht raten). Der Resizer snappt
 * einen gezogenen Pixelwert auf den nächsten Token und schreibt den TOKEN-String,
 * nie px - so landet ein gezogener Wert exakt auf den Stufen, die auch die
 * Studio-Segmented-Buttons anbieten.
 *
 * Mirror-Hinweis: die Token-LISTEN pro Kante spiegeln die Optionslisten im
 * Studio (studio/schemas/objects/sections/shared.ts: paddingTop/​Bottom + gap).
 * Ändert sich dort die Skala, hier mitziehen.
 */
import { SECTION_PAD, SECTION_GAP, spaceVar } from '../lib/content/sections';
import type { SectionPadToken, GapToken, SpaceToken } from '../lib/content/types';

export interface SpacingStep {
  token: string;
  px: number;
}

/** Vertikale Section-Padding-Token je Kante. `pageTop` schafft Platz unter einer
 *  fixen Kopfzeile → nur oben sinnvoll (unten ausgelassen, wie im Schema). */
export const PAD_TOP_TOKENS: SectionPadToken[] = [
  'none',
  'even',
  'small',
  'medium',
  'large',
  'pageTop',
];
export const PAD_BOTTOM_TOKENS: SectionPadToken[] = ['none', 'even', 'small', 'medium', 'large'];

/** Gap-Token (Abstand zwischen den Content-Blöcken der Section). `none` = 0,
 *  damit man rein mit Element-Abständen arbeiten kann (Julians Wunsch). */
export const GAP_TOKENS: GapToken[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/** Bottom-Margin-Token eines Blocks (Überzeile/Überschrift/Absatz) - die volle
 *  Spacing-Skala inkl. `none` (0) und `3xl`; spiegelt marginBottomField. */
export const MARGIN_TOKENS: SpaceToken[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

/** Anzeige-Label je Token für die Drag-Anzeige (== Studio-Button-Beschriftung). */
export const SPACING_LABEL: Record<string, string> = {
  none: 'None',
  even: 'Even',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  pageTop: 'Page top',
  xs: 'XS',
  sm: 'SM',
  md: 'MD',
  lg: 'LG',
  xl: 'XL',
  '2xl': '2XL',
  '3xl': '3XL',
};

/**
 * Jeden Token zu seiner aktuellen Pixelhöhe auflösen: eine versteckte Probe-`div`
 * bekommt die echte CSS-Länge (`var(--section-pad-*)` bzw. `var(--space-*)`) als
 * Höhe, wir lesen die gerenderte px zurück. Deckt `clamp()`/`vw`/`calc()` und
 * `rem` gleichermaßen ab. Billig genug, um es einmal pro Drag zu rufen.
 */
function resolveScale(cssFor: (t: string) => string | undefined, tokens: string[]): SpacingStep[] {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;left:-9999px;top:0;width:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const steps = tokens.map((token) => {
    probe.style.height = cssFor(token) ?? '0px';
    return { token, px: probe.getBoundingClientRect().height };
  });
  probe.remove();
  return steps;
}

/** Aufgelöste Padding-Skala für eine Kante (Top hat `pageTop`, Bottom nicht). */
export function resolvePadScale(tokens: SectionPadToken[]): SpacingStep[] {
  return resolveScale((t) => SECTION_PAD[t as SectionPadToken], tokens);
}

/** Aufgelöste Gap-Skala (none…2xl). */
export function resolveGapScale(): SpacingStep[] {
  return resolveScale((t) => SECTION_GAP[t as GapToken], GAP_TOKENS);
}

/** Aufgelöste Block-Bottom-Margin-Skala (none…3xl), aus `spaceVar`. */
export function resolveMarginScale(): SpacingStep[] {
  return resolveScale((t) => spaceVar(t as SpaceToken) ?? '0', MARGIN_TOKENS);
}

/** Pixelwert auf den nächsten Schritt der Skala snappen (nearest-neighbor). */
export function snapSpacing(scale: SpacingStep[], px: number): SpacingStep {
  let best = scale[0];
  let bestDist = Infinity;
  for (const step of scale) {
    const dist = Math.abs(px - step.px);
    if (dist < bestDist) {
      bestDist = dist;
      best = step;
    }
  }
  return best;
}
