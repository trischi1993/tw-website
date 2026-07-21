import { SECTION_PAD, SECTION_GAP, TONE_CLASS, alignValue } from '../../lib/content/sections';
import type {
  AlignToken,
  GapToken,
  SectionPadToken,
  ToneToken,
} from '../../lib/content/types';

/* ---------------------------------------------------------------------------
   Shell der Content-Sections: macht die Section-Tokens (tone/align/padding/
   gap/fullHeight) wirksam, ohne die gewachsenen CSS-Defaults zu verändern.

   Unterschied zu sectionShellProps (TextSection): Padding wird NUR inline
   gesetzt, wenn ein Token gesetzt ist oder die Komponente einen Fallback
   übergibt. Sections wie value-stmt/legal-text tragen ihr Default-Padding
   (inkl. Breakpoint-Overrides) im CSS - ein unbedingtes Inline-Padding würde
   diese Werte überschreiben. `base: false` lässt zusätzlich die `.section`-
   Klasse weg (deren padding-block würde solche CSS-Defaults überstimmen,
   global.css lädt nach sections.css).
   --------------------------------------------------------------------------- */

interface ShellTokens {
  tone?: ToneToken;
  align?: AlignToken;
  paddingTop?: SectionPadToken;
  paddingBottom?: SectionPadToken;
  gap?: GapToken;
  fullHeight?: boolean;
}

export function contentShell(
  s: ShellTokens,
  d: { top?: SectionPadToken; bottom?: SectionPadToken; base?: boolean } = {},
): { className: string; style: Record<string, string> } {
  const base = d.base !== false;
  // is-full-height wirkt nur als .section.is-full-height - bei base:false wird
  // .section darum nur im (explizit gewählten) fullHeight-Fall mitgegeben.
  const withSection = base || s.fullHeight === true;
  const className = [
    withSection ? 'section' : '',
    TONE_CLASS[s.tone ?? 'light'] ?? '',
    s.fullHeight ? 'is-full-height' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: Record<string, string> = {};
  const top = s.paddingTop ?? d.top;
  if (top && SECTION_PAD[top]) style.paddingTop = SECTION_PAD[top];
  // pageTop ist nur oben gültig; unten fällt ein versehentlicher Wert auf medium.
  const bottom = (s.paddingBottom === 'pageTop' ? 'medium' : s.paddingBottom) ?? d.bottom;
  if (bottom && SECTION_PAD[bottom]) style.paddingBottom = SECTION_PAD[bottom];
  if (s.gap && SECTION_GAP[s.gap]) style['--section-gap'] = SECTION_GAP[s.gap];
  const align = alignValue(s.align);
  if (align) style['--alignment'] = align;
  return { className, style };
}
