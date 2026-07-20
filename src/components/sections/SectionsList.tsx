import TextSection from './TextSection';
import HomeHeroSection from './HomeHeroSection';
import ValueStatementSection from './ValueStatementSection';
import ResultsSection from './ResultsSection';
import SplitCtaSection from './SplitCtaSection';
import ServicesTabsSection from './ServicesTabsSection';
import GalleryMarqueeSection from './GalleryMarqueeSection';
import UspListSection from './UspListSection';
import TestimonialsSection from './TestimonialsSection';
import FaqSection from './FaqSection';
import VideoHeroSection from './VideoHeroSection';
import ModuleSection from './ModuleSection';
import BonusesSection from './BonusesSection';
import FinalCtaSection from './FinalCtaSection';
import PortraitHeroSection from './PortraitHeroSection';
import TimelineSection from './TimelineSection';
import InterestsSection from './InterestsSection';
import PageHeaderSection from './PageHeaderSection';
import RichTextSection from './RichTextSection';
import type { Section } from '../../lib/content/types';

/**
 * Mappt das modulare `sections[]`-Array (Startseite + jede Seite) auf
 * Komponenten - der editierbare Page-Builder: Abschnitte sind sortier- und
 * wiederverwendbar.
 *
 * React statt .astro, damit dieselbe Liste zweimal läuft:
 *  - Produktion: statisch zur Buildzeit gerendert (SectionsHost.astro,
 *    kein client:-Directive) → null React-JS im Output.
 *  - Vorschau: hydriert in der Live-Island (src/preview/SectionsIsland.tsx),
 *    die pro Tastenanschlag neue Daten aus dem Studio pusht.
 *
 * Neue Design-Abschnitte: neuer case hier, Komponente daneben, Studio-Schema +
 * Registrierung, Projektion/Mapper in lib/content/sections.ts, Typ in
 * lib/content/types.ts, Eintrag in shared/editor-blocks.ts + insertables.ts.
 */

/** data-sanity-Attribute für einen GROQ-Pfad - nur in der Vorschau gesetzt. */
export type EditAttr = (path: string) => Record<string, string> | undefined;

export default function SectionsList({
  sections,
  edit,
}: {
  sections: Section[];
  edit?: EditAttr;
}) {
  return (
    <>
      {sections.map((s) => {
        switch (s._type) {
          case 'sectionText':
            return <TextSection key={s._key} section={s} edit={edit} />;
          case 'sectionHomeHero':
            return <HomeHeroSection key={s._key} section={s} edit={edit} />;
          case 'sectionValueStatement':
            return <ValueStatementSection key={s._key} section={s} edit={edit} />;
          case 'sectionResults':
            return <ResultsSection key={s._key} section={s} edit={edit} />;
          case 'sectionSplitCta':
            return <SplitCtaSection key={s._key} section={s} edit={edit} />;
          case 'sectionServicesTabs':
            return <ServicesTabsSection key={s._key} section={s} edit={edit} />;
          case 'sectionGalleryMarquee':
            return <GalleryMarqueeSection key={s._key} section={s} edit={edit} />;
          case 'sectionUspList':
            return <UspListSection key={s._key} section={s} edit={edit} />;
          case 'sectionTestimonials':
            return <TestimonialsSection key={s._key} section={s} edit={edit} />;
          case 'sectionFaq':
            return <FaqSection key={s._key} section={s} edit={edit} />;
          case 'sectionVideoHero':
            return <VideoHeroSection key={s._key} section={s} edit={edit} />;
          case 'sectionModule':
            return <ModuleSection key={s._key} section={s} edit={edit} />;
          case 'sectionBonuses':
            return <BonusesSection key={s._key} section={s} edit={edit} />;
          case 'sectionFinalCta':
            return <FinalCtaSection key={s._key} section={s} edit={edit} />;
          case 'sectionPortraitHero':
            return <PortraitHeroSection key={s._key} section={s} edit={edit} />;
          case 'sectionTimeline':
            return <TimelineSection key={s._key} section={s} edit={edit} />;
          case 'sectionInterests':
            return <InterestsSection key={s._key} section={s} edit={edit} />;
          case 'sectionPageHeader':
            return <PageHeaderSection key={s._key} section={s} edit={edit} />;
          case 'sectionRichText':
            return <RichTextSection key={s._key} section={s} edit={edit} />;
          default:
            return null;
        }
      })}
    </>
  );
}
