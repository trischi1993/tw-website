import type { SchemaTypeDefinition } from 'sanity';

/* --- Dokumente ------------------------------------------------------------ */
import siteSettings from './documents/siteSettings';
import homePage from './documents/homePage';
import page from './documents/page';

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
/* Der Starter liefert EINEN neutralen Abschnittstyp. Pro Projekt die Sektionen
   des Designs als weitere Typen hier registrieren (+ Komponente, Renderer-Fall,
   Eintrag in den `sections`-Arrays von Home/Seite). */
import sectionText from './objects/sections/sectionText';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Dokumente
  siteSettings,
  homePage,
  page,

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
];
