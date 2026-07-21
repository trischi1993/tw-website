import { defineType, defineField } from 'sanity';
import { SplitHorizontalIcon } from '@sanity/icons/SplitHorizontal';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields, optionalRichText, ctaActionField, ctaHrefField, ctaNewTabField } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t, tOptions } from '../../uiLocale';
import type { SegmentedOption } from '../../../components/inputs/SegmentedInput';

/**
 * Text links, Bild rechts, mit CTA. Layout „Gold-Glow" = goldener Blur hinterm
 * Bild (AIO-Teaser), „Schlicht" = ohne (Erfolgs-Check).
 */
export default defineType({
  name: 'sectionSplitCta',
  title: t({ en: 'Split CTA', de: 'Text + Bild mit CTA' }),
  type: 'object',
  icon: categoryIcon(SplitHorizontalIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading', de: 'Überschrift' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    optionalRichText({ name: 'body', title: t({ en: 'Text', de: 'Text' }) }),
    defineField({
      name: 'ctaLabel',
      title: t({ en: 'Button label', de: 'Button-Text' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    ctaActionField,
    ctaHrefField,
    ctaNewTabField,
    defineField({
      name: 'layout',
      title: t({ en: 'Image style', de: 'Bild-Stil' }),
      type: 'string',
      initialValue: 'glow',
      options: {
        layout: 'radio',
        list: tOptions([
          { en: 'Gold glow', de: 'Gold-Glow', value: 'glow' },
          { en: 'Plain', de: 'Schlicht', value: 'plain' },
        ]) as SegmentedOption[],
      },
    }),
    defineField({
      name: 'image',
      title: t({ en: 'Image', de: 'Bild' }),
      type: 'imageWithAlt',
    }),
    toneField,
    ...styleFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone', media: 'image' },
    prepare({ title, subtitle, tone, media }) {
      const typeLabel = t({ en: 'Split CTA', de: 'Text + Bild mit CTA' });
      return {
        title: title || subtitle || typeLabel,
        subtitle: sectionSubtitle(typeLabel, tone),
        media,
      };
    },
  },
});
