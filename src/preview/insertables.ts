import {
  EDITOR_BLOCKS,
  type EditorBlockCategory,
  type EditorBlockType,
} from '../../shared/editor-blocks';
import { randomKey } from './editor-ops';

export interface Insertable {
  type: string;
  title: string;
  category: EditorBlockCategory;
}

/** Shared with the Studio schema through shared/editor-blocks.ts. */
export const INSERTABLES: Insertable[] = EDITOR_BLOCKS.map((block) => ({
  type: block.type,
  title: block.title.de,
  category: block.category,
}));

function portableText(text: string) {
  return [
    {
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: randomKey(), text, marks: [] }],
    },
  ];
}

function heading() {
  return {
    _type: 'textHeading',
    _key: randomKey(),
    text: portableText('Heading'),
    level: 'h2',
    size: 'xl',
    textWrap: 'balance',
  };
}

function paragraph() {
  return {
    _type: 'textParagraph',
    _key: randomKey(),
    text: portableText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    size: 'md',
    color: 'default',
    textWrap: 'pretty',
    maxWidth: 60,
  };
}

/**
 * Canvas insertions bypass Sanity schema initial values, so every type gets a
 * complete, immediately visible value here.
 */
/** Ein Bild-Feld bleibt beim Einfügen leer (Upload im Studio); Alt kommt mit. */

const INSERT_FACTORIES: Record<EditorBlockType, () => Record<string, unknown>> = {
  sectionText: () => ({
    _type: 'sectionText',
    _key: randomKey(),
    name: 'Text-Abschnitt',
    tone: 'light',
    align: 'left',
    content: [heading(), paragraph()],
  }),
  sectionHomeHero: () => ({
    _type: 'sectionHomeHero',
    _key: randomKey(),
    name: 'Hero',
    headingSmall: 'Kleine Zeile',
    headingLarge: 'Große Zeile',
    ctaLabel: 'Jetzt anfragen',
  }),
  sectionValueStatement: () => ({
    _type: 'sectionValueStatement',
    _key: randomKey(),
    name: 'Statement',
    tone: 'light',
    text: 'Ein großes Statement, das beim Scrollen Zeile für Zeile erscheint.',
  }),
  sectionResults: () => ({
    _type: 'sectionResults',
    _key: randomKey(),
    name: 'Zahlen & Fakten',
    title: 'Zahlen & Fakten',
    images: [],
  }),
  sectionSplitCta: () => ({
    _type: 'sectionSplitCta',
    _key: randomKey(),
    name: 'Text + Bild mit CTA',
    tone: 'light',
    heading: 'Überschrift',
    ctaLabel: 'Mehr erfahren',
    ctaAction: 'modal',
    layout: 'glow',
  }),
  sectionServicesTabs: () => ({
    _type: 'sectionServicesTabs',
    _key: randomKey(),
    name: 'Coachings',
    tone: 'light',
    heading: 'Spezifische Coachings',
    tabLabelPersonal: 'Für Selbstständige',
    tabLabelBusiness: 'Für Unternehmen',
    limit: 8,
    ctaModalLabel: 'Unverbindlich anfragen',
    calendlyLabel: 'Kennenlern-Gespräch buchen',
    calendlyUrl: 'https://calendly.com/',
  }),
  sectionGalleryMarquee: () => ({
    _type: 'sectionGalleryMarquee',
    _key: randomKey(),
    name: 'Bild-Galerie',
    tone: 'light',
    heading: 'Bekannt aus',
    titlesVisible: true,
    items: [
      { _type: 'item', _key: randomKey(), title: 'Eintrag 1' },
      { _type: 'item', _key: randomKey(), title: 'Eintrag 2' },
    ],
  }),
  sectionUspList: () => ({
    _type: 'sectionUspList',
    _key: randomKey(),
    name: 'USP-Liste',
    tone: 'light',
    heading: 'Warum mit mir arbeiten?',
    items: [
      { _type: 'item', _key: randomKey(), lead: 'Stichwort', text: 'Der Text zum ersten Punkt.' },
      { _type: 'item', _key: randomKey(), lead: 'Stichwort', text: 'Der Text zum zweiten Punkt.' },
    ],
  }),
  sectionTestimonials: () => ({
    _type: 'sectionTestimonials',
    _key: randomKey(),
    name: 'Testimonials',
    tone: 'light',
    heading: 'Testimonials',
    loadMoreLabel: 'Mehr Testimonials laden',
    initialCount: 3,
  }),
  sectionFaq: () => ({
    _type: 'sectionFaq',
    _key: randomKey(),
    name: 'FAQ',
    tone: 'light',
    heading: 'Häufige Fragen',
    items: [
      {
        _type: 'item',
        _key: randomKey(),
        question: 'Eine häufige Frage?',
        answer: portableText('Die Antwort darauf.'),
      },
    ],
  }),
  sectionVideoHero: () => ({
    _type: 'sectionVideoHero',
    _key: randomKey(),
    name: 'Video-Hero',
    heading: 'Überschrift',
    ctaLabel: 'Jetzt bewerben',
    videoUrl: 'https://upgreight-ws.b-cdn.net/webinarwonders-preview.mp4',
  }),
  sectionModule: () => ({
    _type: 'sectionModule',
    _key: randomKey(),
    name: 'Modul',
    titleRowText: 'Modul',
    number: '01',
    bannerWord: 'Thema',
    heading: 'Überschrift des Moduls',
    bullets: ['Erster Punkt', 'Zweiter Punkt'],
  }),
  sectionBonuses: () => ({
    _type: 'sectionBonuses',
    _key: randomKey(),
    name: 'Bonusse',
    tone: 'light',
    heading: 'Deine Bonusse',
    cards: [
      { _type: 'card', _key: randomKey(), tag: 'Bonus 1', title: 'Titel', text: 'Beschreibung.' },
    ],
  }),
  sectionFinalCta: () => ({
    _type: 'sectionFinalCta',
    _key: randomKey(),
    name: 'Abschluss-CTA',
    tone: 'light',
    heading: 'Bereit loszulegen?',
    ctaLabel: 'Jetzt anfragen',
    ctaAction: 'modal',
  }),
  sectionPortraitHero: () => ({
    _type: 'sectionPortraitHero',
    _key: randomKey(),
    name: 'Portrait-Hero',
    heading: 'Hi, ich bin …',
    intro: 'Kurze Vorstellung.',
    socials: [],
  }),
  sectionTimeline: () => ({
    _type: 'sectionTimeline',
    _key: randomKey(),
    name: 'Timeline',
    heading: 'Mein Werdegang',
    items: [
      {
        _type: 'item',
        _key: randomKey(),
        year: '2025',
        title: 'Station',
        description: portableText('Beschreibung der Station.'),
      },
    ],
  }),
  sectionInterests: () => ({
    _type: 'sectionInterests',
    _key: randomKey(),
    name: 'Interessen',
    tone: 'light',
    heading: 'Meine Interessen',
    highlights: [
      { _type: 'highlight', _key: randomKey(), icon: 'reisen', title: 'Reisen', text: 'Text.' },
    ],
    marquee1: ['Wort 1', 'Wort 2'],
    marquee2: ['Wort 3', 'Wort 4'],
  }),
  sectionPageHeader: () => ({
    _type: 'sectionPageHeader',
    _key: randomKey(),
    name: 'Seitenkopf',
    tone: 'light',
    paddingTop: 'pageTop',
    paddingBottom: 'small',
    heading: 'Seitentitel',
  }),
  sectionRichText: () => ({
    _type: 'sectionRichText',
    _key: randomKey(),
    name: 'Rich Text',
    tone: 'light',
    paddingTop: 'none',
    body: portableText('Fließtext …'),
  }),
  textEyebrow: () => ({ _type: 'textEyebrow', _key: randomKey(), text: 'Eyebrow' }),
  textHeading: heading,
  textParagraph: paragraph,
  cta: () => ({
    _type: 'cta',
    _key: randomKey(),
    label: 'Button',
    href: '#',
    variant: 'primary',
  }),
};

export function createInsertable(type: string): Record<string, unknown> | null {
  return type in INSERT_FACTORIES ? INSERT_FACTORIES[type as EditorBlockType]() : null;
}
