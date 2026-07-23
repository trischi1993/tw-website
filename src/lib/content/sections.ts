import type {
  Section,
  SectionResults,
  ContentEl,
  RichText,
  ServiceItem,
  TestimonialItem,
  SiteImage,
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
import { imgFromOriginalFilename } from './images';

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

/** Gemeinsame Projektion: Startseite und jede `page` nutzen dieselbe. `anchor`
    ist ein Slug → auf den String heben. Bilder werden dereferenziert, damit der
    Mapper URL + Dimensionen bekommt (funktioniert auch in der Live-Island:
    groq-js im Presentation-Loader löst `asset->` lokal auf). */
const CONTENT_PROJECTION = `content[]{ _type, _key, text, label, href, variant, newTab, level, size, color, textWrap, maxWidth, marginBottom }`;
const IMG = `{ alt, caption, asset->{ url, originalFilename, metadata{ dimensions, lqip } } }`;

/* Eingebettete CMS-Collections: die Section liefert ihre Items gleich mit —
   eine Quelle für Build, SSR und Live-Island (Änderungen an Services/
   Testimonials erscheinen in der Vorschau live). */
/* _id als stabiler Zweitschluessel: bei gleichem order sortieren Build (Seed),
   Live-Island (groq-js) und Content-Lake identisch. */
const SERVICES_SUB = `"services": *[_type == "service"] | order(coalesce(order, 9999) asc, _id asc){ "id": _id, name, formName, category, description, image${IMG} }`;
const TESTIMONIALS_SUB = `"testimonials": *[_type == "testimonial"] | order(coalesce(order, 9999) asc, _id asc){ "id": _id, name, role, text, image${IMG} }`;

export const SECTIONS_PROJECTION = `sections[]{
  _type, _key, name, "anchor": anchor.current, tone, align, paddingTop, paddingBottom, gap, fullHeight,
  ${CONTENT_PROJECTION},
  _type == "sectionHomeHero" => { headingSmall, headingLarge, ctaLabel, image${IMG} },
  _type == "sectionValueStatement" => { text },
  _type == "sectionResults" => { title, images[]${IMG} },
  _type == "sectionSplitCta" => { heading, body, ctaLabel, ctaAction, ctaHref, ctaNewTab, layout, image${IMG} },
  _type == "sectionServicesTabs" => { heading, subtext, tabLabelPersonal, tabLabelBusiness, limit, ctaModalLabel, calendlyLabel, calendlyUrl, ${SERVICES_SUB} },
  _type == "sectionGalleryMarquee" => { heading, titlesVisible, ctaLabel, ctaHref, items[]{ _key, title, image${IMG} } },
  _type == "sectionUspList" => { heading, items[]{ _key, lead, text } },
  _type == "sectionTestimonials" => { heading, loadMoreLabel, initialCount, ${TESTIMONIALS_SUB} },
  _type == "sectionFaq" => { heading, items[]{ _key, question, answer } },
  _type == "sectionVideoHero" => { heading, intro, ctaLabel, videoUrl, mockupImage${IMG}, posterImage${IMG} },
  _type == "sectionModule" => { titleRowText, number, bannerWord, bannerGold, heading, bullets, bulletsNowrap, image${IMG}, imageWide, coachingHeading, coachingText, videoSrc, videoPoster },
  _type == "sectionBonuses" => { heading, intro, ctaLabel, cards[]{ _key, tag, title, text, image${IMG} } },
  _type == "sectionFinalCta" => { heading, text, ctaLabel, ctaAction, ctaHref, ctaNewTab },
  _type == "sectionPortraitHero" => { heading, intro, image${IMG}, socials[]{ _key, platform, href } },
  _type == "sectionTimeline" => { heading, items[]{ _key, year, title, titleSmall, description, image${IMG} } },
  _type == "sectionInterests" => { heading, introLine, highlights[]{ _key, icon, title, text }, marquee1, marquee2 },
  _type == "sectionPageHeader" => { heading, meta },
  _type == "sectionRichText" => { body },
}`;

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

/* --- Bilder ----------------------------------------------------------------
   Browser-sicherer Bild-Mapper (die Island nutzt ihn clientseitig):
   - Seed liefert bereits fertige SiteImage-Objekte (`kind` gesetzt) → durchreichen.
   - Sanity liefert das dereferenzierte Asset → wenn das Original im Repo liegt,
     als lokales Build-Asset ausliefern; sonst als Sanity-CDN-Fallback. */
const IMG_MAX_W = 2400;

/* Responsive-Breiten-Leiter (identisch zu resolveImage in sanity.ts): ohne
   srcset zieht der Browser immer die oberste w-Stufe - auf Mobile der
   LCP-Killer. Auf die tatsaechliche (gekappte) Bildbreite geklemmt, nie
   ueber die Quelle hochskalieren. */
const IMG_WIDTH_LADDER = [320, 480, 640, 828, 1080, 1280, 1600, 2000, 2400];

function buildSrcSet(url: string, maxWidth: number): string {
  const widths = IMG_WIDTH_LADDER.filter((w) => w < maxWidth);
  widths.push(maxWidth); // tatsaechliche Obergrenze immer als oberste Stufe
  return widths.map((w) => `${url}?w=${w}&q=80&auto=format&fit=max ${w}w`).join(', ');
}

export function mapImage(raw: any, fallbackAlt = ''): SiteImage | undefined {
  if (!raw) return undefined;
  if (raw.kind === 'local' || raw.kind === 'remote') return raw as SiteImage;
  const alt = str(raw.alt) ?? fallbackAlt;
  const caption = str(raw.caption);
  const local = imgFromOriginalFilename(str(raw.asset?.originalFilename), alt, caption);
  if (local) return local;
  const url: string | undefined = raw.asset?.url;
  const dim = raw.asset?.metadata?.dimensions;
  if (!url || !dim) return undefined;
  const scale = dim.width > IMG_MAX_W ? IMG_MAX_W / dim.width : 1;
  const width = Math.round(dim.width * scale);
  const height = Math.round(dim.height * scale);
  return {
    kind: 'remote',
    src: `${url}?w=${width}&q=80&auto=format&fit=max`,
    srcSet: buildSrcSet(url, width),
    width,
    height,
    alt,
    caption,
    lqip: raw.asset?.metadata?.lqip,
  };
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : [];
}

function keyed<T extends { _key?: string }>(v: unknown, map: (item: any, i: number) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  return v.map(map).filter(Boolean) as T[];
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

/** Eingebettete Service-Items einer Section (Seed und GROQ liefern dieselbe Form). */
function mapServices(raw: unknown): ServiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r): ServiceItem | null => {
      const name = str(r?.name);
      if (!r?.id || !name) return null;
      return {
        id: String(r.id),
        name,
        formName: str(r.formName) ?? name,
        category: r.category === 'business' ? 'business' : 'personal',
        description: str(r.description) ?? '',
        image: mapImage(r.image, name),
      };
    })
    .filter((s): s is ServiceItem => s !== null);
}

function mapTestimonials(raw: unknown): TestimonialItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r): TestimonialItem | null => {
      const name = str(r?.name);
      const text = str(r?.text);
      if (!r?.id || !name || !text) return null;
      return {
        id: String(r.id),
        name,
        role: str(r.role),
        text,
        image: mapImage(r.image, name),
      };
    })
    .filter((t): t is TestimonialItem => t !== null);
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

    case 'sectionHomeHero':
      return {
        ...base,
        _type: 'sectionHomeHero',
        headingSmall: str(s.headingSmall) ?? '',
        headingLarge: str(s.headingLarge) ?? '',
        ctaLabel: str(s.ctaLabel) ?? '',
        image: mapImage(s.image),
      };

    case 'sectionValueStatement':
      return { ...base, _type: 'sectionValueStatement', text: str(s.text) ?? '' };

    case 'sectionResults':
      return {
        ...base,
        _type: 'sectionResults',
        title: str(s.title) ?? '',
        images: (Array.isArray(s.images) ? s.images : [])
          .map((i: any) => mapImage(i))
          .filter(Boolean) as SectionResults['images'],
      };

    case 'sectionSplitCta':
      return {
        ...base,
        _type: 'sectionSplitCta',
        heading: str(s.heading) ?? '',
        body: richText(s.body),
        ctaLabel: str(s.ctaLabel) ?? '',
        ctaAction: s.ctaAction ?? undefined,
        ctaHref: str(s.ctaHref),
        ctaNewTab: s.ctaNewTab === true || undefined,
        layout: s.layout === 'plain' ? 'plain' : 'glow',
        image: mapImage(s.image),
      };

    case 'sectionServicesTabs':
      return {
        ...base,
        _type: 'sectionServicesTabs',
        heading: str(s.heading) ?? '',
        subtext: str(s.subtext),
        tabLabelPersonal: str(s.tabLabelPersonal) ?? 'Für Selbstständige',
        tabLabelBusiness: str(s.tabLabelBusiness) ?? 'Für Unternehmen',
        limit: num(s.limit),
        ctaModalLabel: str(s.ctaModalLabel) ?? '',
        calendlyLabel: str(s.calendlyLabel) ?? '',
        calendlyUrl: str(s.calendlyUrl) ?? '',
        services: mapServices(s.services),
      };

    case 'sectionGalleryMarquee':
      return {
        ...base,
        _type: 'sectionGalleryMarquee',
        heading: str(s.heading) ?? '',
        titlesVisible: s.titlesVisible === true || undefined,
        ctaLabel: str(s.ctaLabel),
        ctaHref: str(s.ctaHref),
        items: keyed(s.items, (r) =>
          r?._key ? { _key: r._key, title: str(r.title) ?? '', image: mapImage(r.image, str(r.title)) } : null,
        ),
      };

    case 'sectionUspList':
      return {
        ...base,
        _type: 'sectionUspList',
        heading: str(s.heading) ?? '',
        items: keyed(s.items, (r) =>
          r?._key && str(r.text) ? { _key: r._key, lead: str(r.lead), text: str(r.text)! } : null,
        ),
      };

    case 'sectionTestimonials':
      return {
        ...base,
        _type: 'sectionTestimonials',
        heading: str(s.heading) ?? '',
        loadMoreLabel: str(s.loadMoreLabel) ?? 'Mehr Testimonials laden',
        initialCount: num(s.initialCount),
        testimonials: mapTestimonials(s.testimonials),
      };

    case 'sectionFaq':
      return {
        ...base,
        _type: 'sectionFaq',
        heading: str(s.heading) ?? '',
        items: keyed(s.items, (r) =>
          r?._key && str(r.question)
            ? { _key: r._key, question: str(r.question)!, answer: richText(r.answer) }
            : null,
        ),
      };

    case 'sectionVideoHero':
      return {
        ...base,
        _type: 'sectionVideoHero',
        heading: str(s.heading) ?? '',
        intro: richText(s.intro),
        ctaLabel: str(s.ctaLabel) ?? '',
        videoUrl: str(s.videoUrl) ?? '',
        mockupImage: mapImage(s.mockupImage),
        posterImage: mapImage(s.posterImage),
      };

    case 'sectionModule':
      return {
        ...base,
        _type: 'sectionModule',
        titleRowText: str(s.titleRowText) ?? 'Modul',
        number: str(s.number),
        bannerWord: str(s.bannerWord) ?? '',
        bannerGold: s.bannerGold === true || undefined,
        heading: str(s.heading) ?? '',
        bullets: strArray(s.bullets),
        bulletsNowrap: s.bulletsNowrap === true || undefined,
        image: mapImage(s.image),
        imageWide: s.imageWide === true || undefined,
        coachingHeading: str(s.coachingHeading),
        coachingText: str(s.coachingText),
        videoSrc: str(s.videoSrc),
        videoPoster: str(s.videoPoster),
      };

    case 'sectionBonuses':
      return {
        ...base,
        _type: 'sectionBonuses',
        heading: str(s.heading) ?? '',
        intro: str(s.intro),
        ctaLabel: str(s.ctaLabel),
        cards: keyed(s.cards, (r) =>
          r?._key && str(r.title)
            ? {
                _key: r._key,
                tag: str(r.tag) ?? '',
                title: str(r.title)!,
                text: str(r.text) ?? '',
                image: mapImage(r.image, str(r.title)),
              }
            : null,
        ),
      };

    case 'sectionFinalCta':
      return {
        ...base,
        _type: 'sectionFinalCta',
        heading: str(s.heading) ?? '',
        text: str(s.text),
        ctaLabel: str(s.ctaLabel) ?? '',
        ctaAction: s.ctaAction ?? undefined,
        ctaHref: str(s.ctaHref),
        ctaNewTab: s.ctaNewTab === true || undefined,
      };

    case 'sectionPortraitHero':
      return {
        ...base,
        _type: 'sectionPortraitHero',
        heading: str(s.heading) ?? '',
        intro: str(s.intro) ?? '',
        image: mapImage(s.image),
        socials: keyed(s.socials, (r) =>
          r?._key && str(r.href)
            ? {
                _key: r._key,
                platform: r.platform === 'linkedin' ? ('linkedin' as const) : ('instagram' as const),
                href: str(r.href)!,
              }
            : null,
        ),
      };

    case 'sectionTimeline':
      return {
        ...base,
        _type: 'sectionTimeline',
        heading: str(s.heading) ?? '',
        items: keyed(s.items, (r) =>
          r?._key && str(r.year)
            ? {
                _key: r._key,
                year: str(r.year)!,
                title: str(r.title) ?? '',
                titleSmall: r.titleSmall === true || undefined,
                description: richText(r.description),
                image: mapImage(r.image),
              }
            : null,
        ),
      };

    case 'sectionInterests':
      return {
        ...base,
        _type: 'sectionInterests',
        heading: str(s.heading) ?? '',
        introLine: str(s.introLine),
        highlights: keyed(s.highlights, (r) =>
          r?._key && str(r.title)
            ? {
                _key: r._key,
                icon: r.icon === 'weiterbildung' ? ('weiterbildung' as const) : ('reisen' as const),
                title: str(r.title)!,
                text: str(r.text) ?? '',
              }
            : null,
        ),
        marquee1: strArray(s.marquee1),
        marquee2: strArray(s.marquee2),
      };

    case 'sectionPageHeader':
      return { ...base, _type: 'sectionPageHeader', heading: str(s.heading) ?? '', meta: str(s.meta) };

    case 'sectionRichText':
      return { ...base, _type: 'sectionRichText', body: richText(s.body) };

    default:
      return null;
  }
}

export function mapSections(raw: unknown): Section[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapSection).filter(Boolean) as Section[];
}
