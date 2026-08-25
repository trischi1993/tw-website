import TextSection from './TextSection';
import HomeHeroSection from './HomeHeroSection';
import ValueStatementSection from './ValueStatementSection';
import ResultsSection from './ResultsSection';
import HomeProofCarouselSection from './HomeProofCarouselSection';
import SplitCtaSection from './SplitCtaSection';
import ServicesTabsSection from './ServicesTabsSection';
import GalleryMarqueeSection from './GalleryMarqueeSection';
import UspListSection from './UspListSection';
import TestimonialsSection from './TestimonialsSection';
import FaqSection from './FaqSection';
import VideoHeroSection from './VideoHeroSection';
import ModuleSection from './ModuleSection';
import AioProgrammeSection from './AioProgrammeSection';
import AioCustomerResultsSection from './AioCustomerResultsSection';
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
  const aioModules = sections.filter(
    (section): section is Extract<Section, { _type: 'sectionModule' }> =>
      section._type === 'sectionModule' && Boolean(section.number),
  );
  const isAioConcept =
    sections.some((section) => section._type === 'sectionVideoHero') && aioModules.length === 5;
  /* Reine lokale Konzeptlogik: Die fuenf einzeln gerenderten Module an ihrer
     ersten Position durch eine kompakte Journey ersetzen. Direkt danach folgen
     die Bonusse und erst anschliessend Ergebnisse sowie Kundenresultate.
     CMS-Reihenfolge und Sanity-Daten bleiben unangetastet. */
  const displaySections = isAioConcept
    ? (() => {
        const result = sections.find(
          (section) => section._type === 'sectionModule' && !section.number,
        );
        const bonuses = sections.find((section) => section._type === 'sectionBonuses');
        const remainingSections = sections.filter(
          (section) => section !== result && section !== bonuses,
        );
        const programmeIndex = remainingSections.findIndex(
          (section) => section._key === aioModules[0]?._key,
        );
        if (!result || programmeIndex < 0) return sections;
        return [
          ...remainingSections.slice(0, programmeIndex + 1),
          ...(bonuses ? [bonuses] : []),
          result,
          ...remainingSections.slice(programmeIndex + 1),
        ];
      })()
    : sections;

  return (
    <>
      {displaySections.map((s) => {
        switch (s._type) {
          case 'sectionText':
            return <TextSection key={s._key} section={s} edit={edit} />;
          case 'sectionHomeHero':
            return <HomeHeroSection key={s._key} section={s} edit={edit} />;
          case 'sectionValueStatement':
            return <ValueStatementSection key={s._key} section={s} edit={edit} />;
          case 'sectionResults':
            return s._key === 'results'
              ? <HomeProofCarouselSection key={s._key} section={s} edit={edit} />
              : <ResultsSection key={s._key} section={s} edit={edit} />;
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
            if (isAioConcept && !s.number) {
              return <AioCustomerResultsSection key="aio-customer-results" />;
            }
            if (isAioConcept && s.number) {
              return s._key === aioModules[0]?._key ? (
                <AioProgrammeSection key="aio-programme" modules={aioModules} edit={edit} />
              ) : null;
            }
            return <ModuleSection key={s._key} section={s} edit={edit} />;
          case 'sectionBonuses':
            return (
              <BonusesSection
                key={s._key}
                section={s}
                edit={edit}
                animate={isAioConcept}
              />
            );
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
