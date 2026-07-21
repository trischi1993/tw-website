import { defineType, defineField } from 'sanity';
import { BlockElementIcon } from '@sanity/icons/BlockElement';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/** Seitenkopf (Rechtsseiten): H1 + Meta-Zeile. */
export default defineType({
  name: 'sectionPageHeader',
  title: t({ en: 'Page header', de: 'Seitenkopf' }),
  type: 'object',
  icon: categoryIcon(BlockElementIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'heading',
      title: t({ en: 'Heading (H1)', de: 'Überschrift (H1)' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'meta',
      title: t({ en: 'Meta line (optional)', de: 'Meta-Zeile (optional)' }),
      description: t({ en: 'E.g. “Stand: …”.', de: 'Z. B. „Stand: …".' }),
      type: 'string',
    }),
    toneField,
    ...styleFields('pageTop', 'small'),
  ],
  preview: {
    select: { title: 'name', subtitle: 'heading', tone: 'tone' },
    prepare({ title, subtitle, tone }) {
      const typeLabel = t({ en: 'Page header', de: 'Seitenkopf' });
      return { title: title || subtitle || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
