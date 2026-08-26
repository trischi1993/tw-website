import { AIO_PROGRAMME } from '../../../shared/aio-programme.mjs';
import type { AioProgrammeContent } from './types';

export const DEFAULT_AIO_PROGRAMME = AIO_PROGRAMME as AioProgrammeContent;

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

/** Defensiver Mapper fuer neue oder noch unvollstaendige Sanity-Daten. */
export function mapAioProgramme(raw: any): AioProgrammeContent {
  const fallback = DEFAULT_AIO_PROGRAMME;

  return {
    eyebrow: text(raw?.eyebrow, fallback.eyebrow),
    heading: text(raw?.heading, fallback.heading),
    intro: text(raw?.intro, fallback.intro),
    theoryNumber: text(raw?.theoryNumber, fallback.theoryNumber),
    theoryLabel: text(raw?.theoryLabel, fallback.theoryLabel),
    theoryText: text(raw?.theoryText, fallback.theoryText),
    practiceNumber: text(raw?.practiceNumber, fallback.practiceNumber),
    practiceLabel: text(raw?.practiceLabel, fallback.practiceLabel),
    practiceText: text(raw?.practiceText, fallback.practiceText),
    practiceOverlay: text(raw?.practiceOverlay, fallback.practiceOverlay),
    coachingStat: text(raw?.coachingStat, fallback.coachingStat),
    coachingLabel: text(raw?.coachingLabel, fallback.coachingLabel),
    coachingEyebrow: text(raw?.coachingEyebrow, fallback.coachingEyebrow),
    coachingHeading: text(raw?.coachingHeading, fallback.coachingHeading),
    coachingText: text(raw?.coachingText, fallback.coachingText),
  };
}
