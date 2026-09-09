import { AIO_PROGRAMME } from '../../../shared/aio-programme.mjs';
import type { AioProgrammeContent } from './types';

export const DEFAULT_AIO_PROGRAMME = AIO_PROGRAMME as AioProgrammeContent;

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

const migratedText = (value: unknown, legacy: string | string[], fallback: string) => {
  const current = text(value, fallback);
  const legacyValues = Array.isArray(legacy) ? legacy : [legacy];
  return legacyValues.includes(current) ? fallback : current;
};

const textList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const entries = value.filter(
    (entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()),
  );
  return entries.length ? entries : fallback;
};

/** Defensiver Mapper fuer neue oder noch unvollstaendige Sanity-Daten. */
export function mapAioProgramme(raw: any): AioProgrammeContent {
  const fallback = DEFAULT_AIO_PROGRAMME;

  return {
    eyebrow: text(raw?.eyebrow, fallback.eyebrow),
    heading: migratedText(raw?.heading, 'Dein Weg in 5 Modulen', fallback.heading),
    intro: text(raw?.intro, fallback.intro),
    theoryLabel: text(raw?.theoryLabel, fallback.theoryLabel),
    theoryText: migratedText(
      raw?.theoryText,
      'Videolektionen und persönliche 1:1 Begleitung',
      fallback.theoryText,
    ),
    practiceLabel: text(raw?.practiceLabel, fallback.practiceLabel),
    practiceText: migratedText(
      raw?.practiceText,
      'Praxis-Coaching und Content-Produktion',
      fallback.practiceText,
    ),
    practiceOverlay: text(raw?.practiceOverlay, fallback.practiceOverlay),
    coachingLabel: text(raw?.coachingLabel, fallback.coachingLabel),
    coachingEyebrow: text(raw?.coachingEyebrow, fallback.coachingEyebrow),
    coachingText: migratedText(
      raw?.coachingText,
      [
        'Bei jedem der vier Theorie-Module schaust du dir zuerst die Videolektionen an. Danach folgt der dazugehörige zweistündige 1:1-Videocall mit mir. Dort klären wir deine offenen Fragen und du bekommst individuelles Feedback sowie konkrete Tipps für deine Umsetzung.',
        'In jedem der vier Theorie-Module schaust du zuerst die Videolektionen an. Anschließend folgt jeweils ein zweistündiger 1:1-Videocall mit mir. Dort klären wir offene Fragen und du bekommst individuelles Feedback sowie konkrete Tipps für deine Umsetzung.',
      ],
      fallback.coachingText,
    ),
    coachingBenefits: textList(raw?.coachingBenefits, fallback.coachingBenefits),
  };
}
