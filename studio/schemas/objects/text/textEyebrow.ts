import { defineType, defineField } from 'sanity';
import { TagIcon } from '@sanity/icons/Tag';
import { marginBottomField } from './controls';
import { t } from '../../uiLocale';

/**
 * Überzeile (Eyebrow) - das kleine Label über einer Überschrift. Als Block-Typ
 * in der `content`-Liste. Bewusst schlicht: nur Text (Plain, kein Rich Text - ein
 * Label braucht keine Fettung) + optionaler Abstand unten. Der Look (klein,
 * Versalien, Akzent) kommt aus der `.eyebrow`-Klasse (global.css), nicht aus
 * Controls - konsistent zum designed-section-Prinzip.
 */
export default defineType({
  name: 'textEyebrow',
  title: t({ en: 'Eyebrow', de: 'Überzeile' }),
  type: 'object',
  icon: TagIcon,
  // Gleiches Öffnen wie die anderen Content-Blöcke (breiter Dialog statt Pane) -
  // einheitliche Bearbeitung.
  options: { modal: { type: 'dialog', width: 2 } },
  fields: [
    defineField({
      name: 'text',
      title: t({ en: 'Text', de: 'Text' }),
      type: 'string',
      validation: (R) => R.required(),
    }),
    marginBottomField,
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return {
        title: title || t({ en: 'Eyebrow', de: 'Überzeile' }),
        subtitle: t({ en: 'Eyebrow', de: 'Überzeile' }),
      };
    },
  },
});
