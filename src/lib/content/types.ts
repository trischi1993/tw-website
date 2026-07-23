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
      srcSet?: string;
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
  /** Glow-CTA rechts in der Kopfzeile (z. B. Anker auf das 0-€-Angebot). */
  headerCta?: NavItem;
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

/* --- CMS-Collections ------------------------------------------------------- */
export type ServiceCategory = 'personal' | 'business';

export interface ServiceItem {
  id: string;
  name: string;
  /** Kürzerer Name für die Formular-Auswahl (Anfrage-Modal). */
  formName: string;
  category: ServiceCategory;
  description: string;
  image?: SiteImage;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  text: string;
  image?: SiteImage;
}

/* --- Sections (modular, reorderable page builder) ------------------------- */
/* Die Design-Sections der Website. Jede hat: Komponente + Fall in
   SectionsList.tsx, Projektion + Mapper-Fall in lib/content/sections.ts,
   Studio-Schema und einen Eintrag in shared/editor-blocks.ts. */
export type Section =
  | SectionText
  | SectionHomeHero
  | SectionValueStatement
  | SectionResults
  | SectionSplitCta
  | SectionServicesTabs
  | SectionGalleryMarquee
  | SectionUspList
  | SectionTestimonials
  | SectionFaq
  | SectionVideoHero
  | SectionModule
  | SectionBonuses
  | SectionFinalCta
  | SectionPortraitHero
  | SectionTimeline
  | SectionInterests
  | SectionPageHeader
  | SectionRichText;

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
  /** Listen (nur im vollen Rich Text der Rechtstexte genutzt). */
  listItem?: string;
  level?: number;
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

/* --- Projekt-Sections (Tristan Weithaler) ---------------------------------- */

/** CTA-Verhalten: Link, globales Anfrage-Modal oder AIO-Bewerbungs-Modal. */
export type CtaAction = 'link' | 'modal' | 'modal-aio';

/** Startseiten-Hero: zweizeilige H1, CTA (öffnet Anfrage-Modal), Bild mit
 *  Scroll-Wipe-Reveal (300vh-Strecke). */
export interface SectionHomeHero extends SectionBase {
  _type: 'sectionHomeHero';
  headingSmall: string;
  headingLarge: string;
  ctaLabel: string;
  image?: SiteImage;
}

/** Großes Statement (Zeilen-Reveal-Animation). */
export interface SectionValueStatement extends SectionBase {
  _type: 'sectionValueStatement';
  text: string;
}

/** „Zahlen & Fakten": geprägter Titel + 4 aufgefächerte Beweis-Karten. */
export interface SectionResults extends SectionBase {
  _type: 'sectionResults';
  title: string;
  images: SiteImage[];
}

/** Text links, Bild rechts, mit CTA. layout 'glow' = Gold-Blur hinterm Bild
 *  (AIO-Teaser), 'plain' = schlicht (Erfolgs-Check). */
export interface SectionSplitCta extends SectionBase {
  _type: 'sectionSplitCta';
  heading: string;
  body?: RichText;
  ctaLabel: string;
  ctaAction?: CtaAction;
  ctaHref?: string;
  ctaNewTab?: boolean;
  layout?: 'glow' | 'plain';
  image?: SiteImage;
}

/** „Spezifische Coachings": Tabs je Zielgruppe, Karten aus der
 *  Service-Collection (per GROQ eingebettet). */
export interface SectionServicesTabs extends SectionBase {
  _type: 'sectionServicesTabs';
  heading: string;
  subtext?: string;
  tabLabelPersonal: string;
  tabLabelBusiness: string;
  /** Max. Karten je Tab (Original: 8). 0/undefined = alle. */
  limit?: number;
  ctaModalLabel: string;
  calendlyLabel: string;
  calendlyUrl: string;
  services: ServiceItem[];
}

/** Horizontale Bild-Galerie (Bekannt aus / ALL-IN-ONE-Säulen). */
export interface SectionGalleryMarquee extends SectionBase {
  _type: 'sectionGalleryMarquee';
  heading: string;
  items: { _key: string; title: string; image?: SiteImage }[];
  /** true = Titel als Overlay (Bekannt aus); false = nur Screenreader (Säulen). */
  titlesVisible?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

/** USP-Liste, 2-spaltig mit animierten Trennlinien. */
export interface SectionUspList extends SectionBase {
  _type: 'sectionUspList';
  heading: string;
  items: { _key: string; lead?: string; text: string }[];
}

/** Testimonials: zweilagige Banner-Headline + 3er-Grid + „Mehr laden". */
export interface SectionTestimonials extends SectionBase {
  _type: 'sectionTestimonials';
  heading: string;
  loadMoreLabel: string;
  /** Initial sichtbare Karten (Original: 3). */
  initialCount?: number;
  testimonials: TestimonialItem[];
}

/** FAQ-Accordion. */
export interface SectionFaq extends SectionBase {
  _type: 'sectionFaq';
  heading: string;
  items: { _key: string; question: string; answer: RichText }[];
}

/** AIO-Hero: direktes Bunny-MP4 im iPhone-Mockup, CTA → AIO-Modal. */
export interface SectionVideoHero extends SectionBase {
  _type: 'sectionVideoHero';
  heading: string;
  intro?: RichText;
  ctaLabel: string;
  videoUrl: string;
  mockupImage?: SiteImage;
  posterImage?: SiteImage;
}

/** Programm-Abschnitt (Modul bzw. „Deine Resultate"): Titelzeile + Laufband +
 *  Bullets + Bild auf Gold-Quadrat, optional 1:1-Coaching-Teil mit
 *  Hintergrundvideo. */
export interface SectionModule extends SectionBase {
  _type: 'sectionModule';
  titleRowText: string;
  number?: string;
  bannerWord: string;
  /** Letztes Laufband-Wort in Gold (Original: „Deine Resultate"). */
  bannerGold?: boolean;
  heading: string;
  bullets: string[];
  bulletsNowrap?: boolean;
  image?: SiteImage;
  imageWide?: boolean;
  coachingHeading?: string;
  coachingText?: string;
  videoSrc?: string;
  /** In Sanity hochgeladenes Standbild; wird über das Sanity Image CDN ausgeliefert. */
  videoPosterImage?: SiteImage;
  /** Legacy-/Seed-Fallback für ältere Inhalte. */
  videoPoster?: string;
}

/** Bonus-Karten (3er-Reihe) + CTA. */
export interface SectionBonuses extends SectionBase {
  _type: 'sectionBonuses';
  heading: string;
  intro?: string;
  cards: { _key: string; tag: string; title: string; text: string; image?: SiteImage }[];
  ctaLabel?: string;
}

/** Abschluss-CTA (schmale Spalte). */
export interface SectionFinalCta extends SectionBase {
  _type: 'sectionFinalCta';
  heading: string;
  text?: string;
  ctaLabel: string;
  ctaAction?: CtaAction;
  ctaHref?: string;
  ctaNewTab?: boolean;
}

/** Über-mich-Hero: Vorstellung + Portrait (2:3) + Social-Icons. */
export interface SectionPortraitHero extends SectionBase {
  _type: 'sectionPortraitHero';
  heading: string;
  intro: string;
  image?: SiteImage;
  socials: { _key: string; platform: 'instagram' | 'linkedin'; href: string }[];
}

/** Werdegang-Timeline: horizontaler Pin-Scroll mit 9 Stationen. */
export interface SectionTimeline extends SectionBase {
  _type: 'sectionTimeline';
  heading: string;
  items: {
    _key: string;
    year: string;
    /** Zeilenumbruch im Titel über \n. */
    title: string;
    titleSmall?: boolean;
    description: RichText;
    image?: SiteImage;
  }[];
}

/** Interessen: 2 Highlights + zwei endlose Wort-Marquees. */
export interface SectionInterests extends SectionBase {
  _type: 'sectionInterests';
  heading: string;
  introLine?: string;
  highlights: {
    _key: string;
    icon: 'reisen' | 'weiterbildung';
    title: string;
    text: string;
  }[];
  marquee1: string[];
  marquee2: string[];
}

/** Seitenkopf (Legal-Seiten): H1 + Meta-Zeile. */
export interface SectionPageHeader extends SectionBase {
  _type: 'sectionPageHeader';
  heading: string;
  meta?: string;
}

/** Freier Rich-Text (Rechtstexte): volle Portable-Text-Palette. */
export interface SectionRichText extends SectionBase {
  _type: 'sectionRichText';
  body: RichText;
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
