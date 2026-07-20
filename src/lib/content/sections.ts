import type {
  Section,
  ContentEl,
  RichText,
  ToneToken,
  AlignToken,
  SectionPadToken,
  GapToken,
  HeadingSize,
  ParagraphSize,
  TextColor,
  TextWrapToken,
  SpaceToken,
  CtaVariant,
} from './types';

/* ---------------------------------------------------------------------------
   Sections-Contract: GROQ-Projektion + Mapper für das `sections[]`-Array.

   Bewusst BROWSER-SICHER (keine Client-Instanz, kein node:async_hooks):
   dieselben Funktionen laufen
    - serverseitig in src/lib/sanity.ts (Build/SSR), und
    - clientseitig in der Live-Vorschau-Island (src/preview/SectionsIsland.tsx),
      die pro Tastenanschlag ROHE Query-Resultate aus dem Studio bekommt und
      sie mit exakt demselben Mapper in die Komponenten-Typen übersetzt.

   Feldnamen hier == Studio-Schema (studio/schemas) == Typen in types.ts.
   Wer eine Section ergänzt, erweitert Projektion + mapSection + types.ts
   + SectionsList.tsx + das Studio-Schema zusammen.
   --------------------------------------------------------------------------- */

/** Gemeinsame Projektion: Startseite und jede `page` nutzen dieselbe. Der Inhalt
    ist EINE `content`-Liste aus Blöcken (eyebrow/heading/paragraph/cta), jeder mit
    eigenen Controls; `text` ist Rich Text (Portable-Text-Array). `anchor` ist ein
    Slug → auf den String heben. */
const CONTENT_PROJECTION = `content[]{ _type, _key, text, label, href, variant, newTab, level, size, color, textWrap, maxWidth, marginBottom }`;
export const SECTIONS_PROJECTION = `sections[]{ _type, _key, name, "anchor": anchor.current, tone, align, paddingTop, paddingBottom, gap, fullHeight, ${CONTENT_PROJECTION} }`;

/* ---------------------------------------------------------------------------
   Token → CSS. EINE Quelle für Section-Level-Controls: der Server-Render, die
   Live-Island und die Hover-Vorschau (hover-channel.ts) lesen exakt diese Maps,
   und (Phase c) die token-snappenden Resizer snappen an genau diese Stufen.
   Alles Editierbare ist ein TOKEN → CSS-Var, nie ein Freiform-Wert.
   Spiegelt src/styles/tokens.css (--section-pad-* / --space-*).
   --------------------------------------------------------------------------- */
export const SECTION_PAD: Record<SectionPadToken, string> = {
  none:    'var(--section-pad-none)',
  even:    'var(--section-pad-even)',
  small:   'var(--section-pad-small)',
  medium:  'var(--section-pad-medium)',
  large:   'var(--section-pad-large)',
  pageTop: 'var(--section-pad-page-top)',
};

export const SECTION_GAP: Record<GapToken, string> = {
  none: '0',
  xs:  'var(--space-xs)',
  sm:  'var(--space-sm)',
  md:  'var(--space-md)',
  lg:  'var(--space-lg)',
  xl:  'var(--space-xl)',
  '2xl': 'var(--space-2xl)',
};

/** Farbton → Kontextklasse (remappt die Surface-Tokens einmal; Kinder folgen). */
export const TONE_CLASS: Record<ToneToken, string> = {
  light: '',
  alt:   'is-alt',
  dark:  'on-dark',
  brand: 'on-brand',
};

/* Per-Element-Text-Controls → CSS-Klasse. Eine Quelle für Server + Island. */
export const HEADING_SIZE_CLASS: Record<HeadingSize, string> = {
  sm: 'h-sm', md: 'h-md', lg: 'h-lg', xl: 'h-xl', '2xl': 'h-2xl', '3xl': 'h-3xl', '4xl': 'h-4xl',
};
export const PARAGRAPH_SIZE_CLASS: Record<ParagraphSize, string> = {
  sm: 'p-sm', md: 'p-md', lg: 'p-lg', xl: 'p-xl',
};
export const COLOR_CLASS: Record<TextColor, string> = {
  default: 'c-default', muted: 'c-muted', brand: 'c-brand',
};
export const CTA_VARIANT_CLASS: Record<CtaVariant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  outline: 'btn--outline',
  link: 'btn--link',
};

/** Spacing-Token → CSS-Länge (`none` = 0). Für Element-marginBottom. */
export function spaceVar(token?: SpaceToken): string | undefined {
  if (!token) return undefined;
  return token === 'none' ? '0' : `var(--space-${token})`;
}

/** Ausrichtungs-Token → --alignment-Wert (`start`/`center`/`end`, gilt für
 *  text-align UND align-items). Undefiniert → kein Inline-Wert (CSS-Default =
 *  links). `right` → `end` (logisch, funktioniert für beide Properties). */
export function alignValue(token?: AlignToken): string | undefined {
  if (!token) return undefined;
  return token === 'center' ? 'center' : token === 'right' ? 'end' : 'start';
}

const DEFAULT_PAD: SectionPadToken = 'medium';

/**
 * Klassenliste + Inline-Style für den `<section>`-Root eines Abschnitts.
 * Aus dieser EINEN Funktion rendern Server, Island und Hover-/Resizer-Vorschau
 * byte-gleich. `tone` bleibt eine Klasse (Kaskade über Surface-Tokens);
 * padding/gap/full-height sind token-basierte Inline-Styles (Prod = statisches
 * HTML mit `style="padding-top: var(--section-pad-...)"`, null JS).
 */
export function sectionShellProps(s: {
  tone?: ToneToken;
  align?: AlignToken;
  paddingTop?: SectionPadToken;
  paddingBottom?: SectionPadToken;
  gap?: GapToken;
  fullHeight?: boolean;
}): { className: string; style: Record<string, string> } {
  const className = ['section', TONE_CLASS[s.tone ?? 'light'], s.fullHeight ? 'is-full-height' : '']
    .filter(Boolean)
    .join(' ');

  const top = SECTION_PAD[s.paddingTop ?? DEFAULT_PAD] ?? SECTION_PAD[DEFAULT_PAD];
  // pageTop ist nur oben gültig; ein versehentlich gesetzter Bottom-Wert fällt auf medium.
  const bottomToken = s.paddingBottom === 'pageTop' ? DEFAULT_PAD : s.paddingBottom ?? DEFAULT_PAD;
  const bottom = SECTION_PAD[bottomToken] ?? SECTION_PAD[DEFAULT_PAD];

  const style: Record<string, string> = { paddingTop: top, paddingBottom: bottom };
  if (s.gap && SECTION_GAP[s.gap]) style['--section-gap'] = SECTION_GAP[s.gap];
  const align = alignValue(s.align);
  if (align) style['--alignment'] = align;
  return { className, style };
}

/** text-wrap-Token → CSS-Wert (`none` = normaler Umbruch). EINE Quelle für
 *  Renderer und Hover-Preview. Undefiniert → kein Inline-Wert (CSS-Default). */
export function wrapStyle(token?: TextWrapToken): string | undefined {
  if (!token) return undefined;
  return token === 'pretty' ? 'pretty' : token === 'none' ? 'wrap' : 'balance';
}

/* Live-Queries der Vorschau-Island: gleiche Projektion, plus Dokument-Identität
   für Click-to-edit (createDataAttribute braucht _id/_type). */
export const HOME_SECTIONS_QUERY = `*[_type == "homePage"][0]{ _id, _type, ${SECTIONS_PROJECTION} }`;
export const PAGE_SECTIONS_QUERY = `*[_type == "page" && slug.current == $slug][0]{ _id, _type, ${SECTIONS_PROJECTION} }`;

/** Sanity-ID normalisieren: `drafts.`- und `versions.<release>.`-Präfixe ab. */
export function baseIdOf(id: string | undefined): string {
  return (id ?? '').replace(/^drafts\./, '').replace(/^versions\.[^.]+\./, '');
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/** Rohes Sanity-Rich-Text-Feld → RichText (leeres/ungültiges → []). */
function richText(raw: unknown): RichText {
  return Array.isArray(raw) ? (raw as RichText) : [];
}
/** Trägt der Rich-Text irgendwo tatsächlich Text? (sonst Element weglassen). */
function richHasText(rt: RichText): boolean {
  return rt.some(
    (b) =>
      b?._type === 'block' &&
      Array.isArray(b.children) &&
      b.children.some((c) => typeof c?.text === 'string' && c.text.trim() !== ''),
  );
}

/** Rohes content[]-Element → typisierter Content-Block (leere fallen weg). */
function mapContentEl(el: any): ContentEl | null {
  if (!el?._key || !el?._type) return null;
  switch (el._type) {
    case 'textEyebrow': {
      const text = str(el.text);
      return text ? { _key: el._key, _type: 'textEyebrow', text, marginBottom: el.marginBottom ?? undefined } : null;
    }
    case 'textHeading': {
      const text = richText(el.text);
      if (!richHasText(text)) return null;
      return {
        _key: el._key,
        _type: 'textHeading',
        text,
        level: el.level ?? undefined,
        size: el.size ?? undefined,
        textWrap: el.textWrap ?? undefined,
        maxWidth: num(el.maxWidth),
        marginBottom: el.marginBottom ?? undefined,
      };
    }
    case 'textParagraph': {
      const text = richText(el.text);
      if (!richHasText(text)) return null;
      return {
        _key: el._key,
        _type: 'textParagraph',
        text,
        size: el.size ?? undefined,
        color: el.color ?? undefined,
        textWrap: el.textWrap ?? undefined,
        maxWidth: num(el.maxWidth),
        marginBottom: el.marginBottom ?? undefined,
      };
    }
    case 'cta': {
      const label = str(el.label);
      const href = str(el.href);
      if (!label || !href) return null;
      return {
        _key: el._key,
        _type: 'cta',
        label,
        href,
        variant: el.variant ?? undefined,
        newTab: el.newTab === true || undefined,
        marginBottom: el.marginBottom ?? undefined,
      };
    }
    default:
      return null;
  }
}

/** Rohes content[]-Array → ContentEl[] (leere/unbekannte fallen weg). */
function mapContent(raw: unknown): ContentEl[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapContentEl).filter(Boolean) as ContentEl[];
}

/** Rohe Sanity-Section → Komponenten-Typ. Unbekannte Typen fallen weg.
    GROQ liefert `null` für fehlende Felder - hier auf `undefined` normalisieren. */
export function mapSection(s: any): Section | null {
  if (!s?._key) return null;
  const base = {
    _key: s._key,
    name: str(s.name),
    anchor: str(s.anchor),
    tone: s.tone ?? undefined,
    align: s.align ?? undefined,
    paddingTop: s.paddingTop ?? undefined,
    paddingBottom: s.paddingBottom ?? undefined,
    gap: s.gap ?? undefined,
    fullHeight: s.fullHeight ?? undefined,
  };
  switch (s._type) {
    case 'sectionText':
      return { ...base, _type: 'sectionText', content: mapContent(s.content) };
    default:
      return null;
  }
}

export function mapSections(raw: unknown): Section[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapSection).filter(Boolean) as Section[];
}
