import { defineType, defineField, defineArrayMember, type Rule } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { LinkIcon } from '@sanity/icons/Link';
import { nameField, anchorField, toneField, sectionSubtitle } from './shared';
import { styleFields } from './projectFields';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';

/**
 * Freier Rich-Text (Rechtstexte): volle Portable-Text-Palette mit
 * Zwischenüberschriften (H2-H4), Aufzählungen, Fett/Kursiv und Links -
 * bewusst NICHT das eingeschränkte richTextField der Text-Elemente.
 */
export default defineType({
  name: 'sectionRichText',
  title: t({ en: 'Rich text', de: 'Rich Text (Rechtstext)' }),
  type: 'object',
  icon: categoryIcon(DocumentTextIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'body',
      title: t({ en: 'Text', de: 'Text' }),
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
          ],
          lists: [{ title: t({ en: 'Bullet list', de: 'Aufzählung' }), value: 'bullet' }],
          marks: {
            decorators: [
              { title: t({ en: 'Bold', de: 'Fett' }), value: 'strong' },
              { title: t({ en: 'Italic', de: 'Kursiv' }), value: 'em' },
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: t({ en: 'Link', de: 'Link' }),
                icon: LinkIcon,
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'string',
                    // Cast: `.uri()` existiert zur Laufzeit auch auf String-Feldern (siehe richText.ts).
                    validation: (R) =>
                      (R as unknown as Rule)
                        .required()
                        .uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
                  }),
                  defineField({
                    name: 'newTab',
                    title: t({ en: 'Open in new tab', de: 'In neuem Tab öffnen' }),
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              }),
            ],
          },
        }),
      ],
      validation: (R) => R.required(),
    }),
    toneField,
    ...styleFields('none', 'large'),
  ],
  preview: {
    select: { title: 'name', tone: 'tone' },
    prepare({ title, tone }) {
      const typeLabel = t({ en: 'Rich text', de: 'Rich Text (Rechtstext)' });
      return { title: title || typeLabel, subtitle: sectionSubtitle(typeLabel, tone) };
    },
  },
});
