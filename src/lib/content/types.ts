import type { ImageMetadata } from 'astro';

/* ---------------------------------------------------------------------------
   Component-facing content types.

   These are the shapes the Astro components consume. The local seed (seed.ts)
   produces them directly; once Sanity is connected, the GROQ queries + image
   resolver in `sanity.ts` map Sanity documents into these exact shapes, so no
   component needs to change. One contract, two sources.
   --------------------------------------------------------------------------- */

/** A picture, source-agnostic. `local` = optimised at build via astro:assets;
 *  `remote` = a Sanity CDN URL once the CMS is connected. */
export type SiteImage =
  | { kind: 'local'; asset: ImageMetadata; alt: string; caption?: string }
  | {
      kind: 'remote';
      src: string;
      width: number;
      height: number;
      alt: string;
      caption?: string;
      lqip?: string;
    };

export interface NavItem {
  label: string;
  href: string;
}

/* --- Site settings (singleton) -------------------------------------------- */
export interface SiteSettings {
  siteName: string;
  tagline?: string;
  contact: {
    ownerName: string;
    addressLines: string[];
    locality: string;
    region: string;
    postalCode: string;
    country: string;
    countryCode: string;
    email: string;
    phone: string;
    phoneHref: string;
    geo?: { lat: number; lng: number };
  };
  nav: NavItem[];
  legalLinks: NavItem[];
  social: NavItem[];
  footerNote?: string;
}

/* --- SEO ------------------------------------------------------------------ */
export interface PageSeo {
  title: string;
  description: string;
  image?: SiteImage;
  noindex?: boolean;
}

/* --- Sections (modular, reorderable page builder) ------------------------- */
/* The starter ships ONE neutral section type. Per project, add the design's
   sections as new interfaces + members of this union — each with a component +
   case in SectionsList.tsx, projection + mapper case in lib/content/sections.ts,
   and a matching Studio schema. */
export type Section = SectionText;

/* Section-level control tokens — canonical here, consumed by the token→CSS maps
   in lib/content/sections.ts, the Studio schema (shared.ts), and the hover-
   preview flip (src/preview/hover-channel.ts). Everything editable is a TOKEN;
   the renderer maps token → CSS var, never a freeform value. */
/* Section-level control tokens. */
export type ToneToken = 'light' | 'alt' | 'dark' | 'brand';
export type AlignToken = 'left' | 'center' | 'right';
export type SectionPadToken = 'none' | 'even' | 'small' | 'medium' | 'large' | 'pageTop';
export type GapToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/* Per-element text-control tokens (live on the heading/paragraph elements, not
   the section — remarkable model: clickable in the canvas, each carries its own
   controls). Everything editable is a TOKEN → CSS class/var, never freeform,
   except the measure (max-width in `ch`, which the mandate allows). */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type ParagraphSize = 'sm' | 'md' | 'lg' | 'xl';
export type TextColor = 'default' | 'muted' | 'brand';
export type TextWrapToken = 'balance' | 'pretty' | 'none';
export type SpaceToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type CtaVariant = 'primary' | 'secondary' | 'outline' | 'link';

/* --- Rich text (constrained Portable Text: normal blocks, strong/em, link) --- */
export interface RichSpan {
  _key?: string;
  _type?: string;
  text?: string;
  /** decorator values ('strong'/'em') and/or markDef _keys (link annotations). */
  marks?: string[];
}
export interface RichLink {
  _key: string;
  _type: 'link';
  href?: string;
  newTab?: boolean;
}
export interface RichBlock {
  _key?: string;
  _type: string;
  style?: string;
  children?: RichSpan[];
  markDefs?: RichLink[];
}
export type RichText = RichBlock[];

/** The content blocks of a section — a discriminated union keyed by `_type`.
 *  Each is clickable in the canvas and carries its own controls. */
export type ContentEl = EyebrowEl | HeadingEl | ParagraphEl | CtaEl;

/** An eyebrow: a small plain-text label (look comes from `.eyebrow`). */
export interface EyebrowEl {
  _key: string;
  _type: 'textEyebrow';
  text: string;
  marginBottom?: SpaceToken;
}

/** A heading element: its own semantic level + visual size + measure + wrap.
 *  `text` is rich text (bold/italic/link inline). */
export interface HeadingEl {
  _key: string;
  _type: 'textHeading';
  text: RichText;
  level?: HeadingLevel;
  size?: HeadingSize;
  textWrap?: TextWrapToken;
  /** measure in `ch`; unset → CSS default (full width). */
  maxWidth?: number;
  marginBottom?: SpaceToken;
}

/** A paragraph element: own size + colour + measure + wrap, per paragraph. */
export interface ParagraphEl {
  _key: string;
  _type: 'textParagraph';
  text: RichText;
  size?: ParagraphSize;
  color?: TextColor;
  textWrap?: TextWrapToken;
  maxWidth?: number;
  marginBottom?: SpaceToken;
}

/** A reusable call-to-action link with a token-based visual variant. */
export interface CtaEl {
  _key: string;
  _type: 'cta';
  label: string;
  href: string;
  variant?: CtaVariant;
  newTab?: boolean;
  marginBottom?: SpaceToken;
}

interface SectionBase {
  _key: string;
  /** Internal name (Studio-only: section list + preview title). */
  name?: string;
  /** Optional anchor id: when set, the section renders `id="…"` for #-links. */
  anchor?: string;
  /** Surface theme; maps to a context class that remaps the surface tokens once. */
  tone?: ToneToken;
  /** Horizontal alignment of the section content (cascades via `--alignment`). */
  align?: AlignToken;
  /** Vertical padding, chosen independently per edge (pageTop only valid on top). */
  paddingTop?: SectionPadToken;
  paddingBottom?: SectionPadToken;
  /** Space between the section's own blocks (exposed as `--section-gap`). */
  gap?: GapToken;
  /** Fill at least the viewport height (hero sections). */
  fullHeight?: boolean;
}

export interface SectionText extends SectionBase {
  _type: 'sectionText';
  /** Ordered content blocks (eyebrow / heading / paragraph). */
  content: ContentEl[];
}

/* --- Pages ---------------------------------------------------------------- */

/** Home page (singleton): a sections-composed page like any other. */
export interface HomeContent {
  /**
   * Sanity-Dokument-ID (Basis-ID ohne drafts.-Präfix). Nur gesetzt, wenn der
   * Inhalt aus Sanity kommt; die Live-Vorschau-Island braucht sie für
   * Click-to-edit + Live-Query. Der Seed hat keine (undefined → die Vorschau
   * rendert statisch wie Produktion).
   */
  documentId?: string;
  seo: PageSeo;
  sections: Section[];
}

export interface SitePage {
  /** Sanity-Dokument-ID (Basis-ID) - siehe HomeContent.documentId. */
  documentId?: string;
  title: string;
  slug: string;
  seo: PageSeo;
  sections: Section[];
}
