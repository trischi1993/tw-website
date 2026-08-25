import { defineField, defineType } from 'sanity';
import { AIO_PROGRAMME } from '../../../shared/aio-programme.mjs';

const requiredText = (
  name: keyof typeof AIO_PROGRAMME,
  title: string,
  group: 'intro' | 'overview' | 'modules' | 'coaching',
  rows?: number,
) =>
  defineField({
    name,
    title,
    type: rows ? 'text' : 'string',
    ...(rows ? { rows } : {}),
    group,
    validation: (R) => R.required(),
  });

/** Redaktionelle Texte des AIO-Sonderlayouts, das alle fuenf Module buendelt. */
export default defineType({
  name: 'aioProgramme',
  title: 'AIO – Fahrplan & 1:1-Begleitung',
  type: 'object',
  description:
    'Alle Texte des kompakten Programm-Fahrplans. Modulüberschriften und Aufzählungspunkte bleiben direkt in den fünf Modul-Abschnitten editierbar.',
  groups: [
    { name: 'intro', title: 'Abschnitts-Einstieg', default: true },
    { name: 'overview', title: 'Zwei Übersichtskacheln' },
    { name: 'modules', title: 'Modul-Detail' },
    { name: 'coaching', title: '1:1-Begleitung' },
  ],
  initialValue: AIO_PROGRAMME,
  fields: [
    requiredText('eyebrow', 'Kleine Überschrift (Eyebrow)', 'intro'),
    requiredText('heading', 'Hauptüberschrift', 'intro'),
    requiredText('intro', 'Einleitungstext', 'intro', 3),

    requiredText('theoryNumber', 'Theorie – Nummern', 'overview'),
    requiredText('theoryLabel', 'Theorie – kleines Label', 'overview'),
    requiredText('theoryText', 'Theorie – Beschreibung', 'overview', 2),
    requiredText('practiceNumber', 'Praxis – Nummer', 'overview'),
    requiredText('practiceLabel', 'Praxis – kleines Label', 'overview'),
    requiredText('practiceText', 'Praxis – Beschreibung', 'overview', 2),

    requiredText('practiceOverlay', 'Text auf dem Praxis-Video', 'modules'),

    requiredText('coachingStat', 'Große Zeitangabe', 'coaching'),
    requiredText('coachingLabel', 'Text unter der Zeitangabe', 'coaching'),
    requiredText('coachingEyebrow', 'Kleine Überschrift', 'coaching'),
    requiredText('coachingHeading', 'Überschrift', 'coaching'),
    requiredText('coachingText', 'Erklärung', 'coaching', 5),
  ],
});
