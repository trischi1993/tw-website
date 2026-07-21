import type { SchemaTypeDefinition } from 'sanity';

/* --- Dokumente ------------------------------------------------------------ */
import siteSettings from './documents/siteSettings';
import homePage from './documents/homePage';
import page from './documents/page';
import service from './documents/service';
import testimonial from './documents/testimonial';

/* --- Objekte (Bausteine) -------------------------------------------------- */
import imageWithAlt from './objects/imageWithAlt';
import navItem from './objects/navItem';
import seo from './objects/seo';

/* --- Text-Elemente (pro Element anklickbar, tragen ihre Controls selbst) --- */
import textEyebrow from './objects/text/textEyebrow';
import textHeading from './objects/text/textHeading';
import textParagraph from './objects/text/textParagraph';
import cta from './objects/cta';

/* --- Abschnitte (für Startseite und Seiten) ------------------------------- */
/* Feldnamen == types.ts == Projektion (src/lib/content/sections.ts). */
import sectionText from './objects/sections/sectionText';
import sectionHomeHero from './objects/sections/sectionHomeHero';
import sectionValueStatement from './objects/sections/sectionValueStatement';
import sectionResults from './objects/sections/sectionResults';
import sectionSplitCta from './objects/sections/sectionSplitCta';
import sectionServicesTabs from './objects/sections/sectionServicesTabs';
import sectionGalleryMarquee from './objects/sections/sectionGalleryMarquee';
import sectionUspList from './objects/sections/sectionUspList';
import sectionTestimonials from './objects/sections/sectionTestimonials';
import sectionFaq from './objects/sections/sectionFaq';
import sectionVideoHero from './objects/sections/sectionVideoHero';
import sectionModule from './objects/sections/sectionModule';
import sectionBonuses from './objects/sections/sectionBonuses';
import sectionFinalCta from './objects/sections/sectionFinalCta';
import sectionPortraitHero from './objects/sections/sectionPortraitHero';
import sectionTimeline from './objects/sections/sectionTimeline';
import sectionInterests from './objects/sections/sectionInterests';
import sectionPageHeader from './objects/sections/sectionPageHeader';
import sectionRichText from './objects/sections/sectionRichText';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Dokumente
  siteSettings,
  homePage,
  page,
  service,
  testimonial,

  // Objekte
  imageWithAlt,
  navItem,
  seo,

  // Text-Elemente
  textEyebrow,
  textHeading,
  textParagraph,
  cta,

  // Abschnitte
  sectionText,
  sectionHomeHero,
  sectionValueStatement,
  sectionResults,
  sectionSplitCta,
  sectionServicesTabs,
  sectionGalleryMarquee,
  sectionUspList,
  sectionTestimonials,
  sectionFaq,
  sectionVideoHero,
  sectionModule,
  sectionBonuses,
  sectionFinalCta,
  sectionPortraitHero,
  sectionTimeline,
  sectionInterests,
  sectionPageHeader,
  sectionRichText,
];
