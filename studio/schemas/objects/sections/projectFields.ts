import { defineField, type FieldDefinition } from 'sanity';
import { t, tOptions } from '../../uiLocale';
import { type SegmentedOption } from '../../../components/inputs/SegmentedInput';
import { paddingTopField, paddingBottomField, alignField, gapField, fullHeightField } from './shared';
import { richTextField } from '../text/richText';

/* ---------------------------------------------------------------------------
   Projekt-Helfer (Tristan Weithaler) für die Section-Schemas.

   Konvention (siehe HANDOVER): Layout-Sections (Heroes, Timeline, Results,
   Module) tragen NUR nameField + anchorField - ihr Layout ist fest verdrahtet.
   Content-Sections bekommen toneField + styleFields(). Default-Padding = 'medium',
   damit eine NEU im Studio angelegte Section optisch zum migrierten Seed passt
   (der Seed lässt die Style-Tokens weg → Renderer-Default DEFAULT_PAD = 'medium').
   --------------------------------------------------------------------------- */

/** Geteilte Style-Felder mit projektspezifischen Padding-Initialwerten. */
export function styleFields(
  top: 'none' | 'even' | 'small' | 'medium' | 'large' | 'pageTop' = 'medium',
  bottom: 'none' | 'even' | 'small' | 'medium' | 'large' = 'medium',
): FieldDefinition[] {
  return [
    { ...paddingTopField, initialValue: top },
    { ...paddingBottomField, initialValue: bottom },
    alignField,
    gapField,
    fullHeightField,
  ];
}

/** Eingeschränkter Inline-Rich-Text (wie richTextField), aber OPTIONAL. */
export function optionalRichText(opts: { name: string; title?: string }): FieldDefinition {
  return { ...richTextField(opts), validation: undefined };
}

/* --- CTA-Verhalten (Link / Anfrage-Modal / AIO-Bewerbung) ------------------ */

export const ctaActionField = defineField({
  name: 'ctaAction',
  title: t({ en: 'Button action', de: 'Button-Aktion' }),
  description: t({
    en: 'What the button does: open a link, the enquiry modal, or the ALL-IN-ONE application modal.',
    de: 'Was der Button tut: Link öffnen, das Anfrage-Modal oder das ALL-IN-ONE-Bewerbungs-Modal.',
  }),
  type: 'string',
  initialValue: 'modal',
  options: {
    layout: 'radio',
    list: tOptions([
      { en: 'Open link', de: 'Link öffnen', value: 'link' },
      { en: 'Open enquiry modal', de: 'Anfrage-Modal öffnen', value: 'modal' },
      { en: 'Open ALL-IN-ONE application', de: 'AIO-Bewerbung öffnen', value: 'modal-aio' },
    ]) as SegmentedOption[],
  },
});

export const ctaHrefField = defineField({
  name: 'ctaHref',
  title: t({ en: 'Button link', de: 'Button-Link' }),
  description: t({
    en: 'Only used with the “Open link” action. URL (https://…), path (/page) or anchor (#section).',
    de: 'Nur bei Aktion „Link öffnen". URL (https://…), Pfad (/seite) oder Anker (#abschnitt).',
  }),
  type: 'string',
  hidden: ({ parent }) => (parent as { ctaAction?: string } | undefined)?.ctaAction !== 'link',
});

export const ctaNewTabField = defineField({
  name: 'ctaNewTab',
  title: t({ en: 'Open in new tab', de: 'In neuem Tab öffnen' }),
  type: 'boolean',
  initialValue: false,
  hidden: ({ parent }) => (parent as { ctaAction?: string } | undefined)?.ctaAction !== 'link',
});
