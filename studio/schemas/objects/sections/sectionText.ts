import { defineType, defineField } from 'sanity';
import { TextIcon } from '@sanity/icons/Text';
import { toneField, sectionStyleFields, sectionSubtitle, nameField, anchorField } from './shared';
import { categoryIcon } from '../../../components/inputs/categoryIcon';
import { t } from '../../uiLocale';
import { COMPONENT_TYPES } from '../../blocks';

/**
 * Text-Abschnitt: der neutrale Starter-Abschnitt.
 *
 * Der Inhalt ist EINE `content`-Liste aus klickbaren Blöcken (Überzeile /
 * Überschrift / Absatz / CTA) - remarkable-Modell: kompakte, eingeklappte Zeilen, Klick
 * öffnet die Einstellungen genau dieses Blocks (statt alle Sub-Controls inline zu
 * zeigen). Die Section selbst trägt nur Identität (interner Name + optionaler
 * Anker) und Section-Level-Controls (Theme, Abstände, Ausrichtung, Gap, volle
 * Höhe). Reihenfolge = remarkable: Name → Anker → Content → Theme → Padding oben →
 * Padding unten → Horizontale Ausrichtung → Gap → volle Höhe. Flach, keine Tabs.
 *
 * Pro Projekt: für einfache Text-Flow-Abschnitte diesen `content`-Ansatz
 * wiederverwenden; für komplexe Layouts (Bento, Off-Grid) eigene Section-Typen
 * mit festen, strukturierten Feldern statt einer freien Liste anlegen.
 */
export default defineType({
  name: 'sectionText',
  title: t({ en: 'Text section', de: 'Text-Abschnitt' }),
  type: 'object',
  icon: categoryIcon(TextIcon, 'section'),
  fields: [
    nameField,
    anchorField,
    defineField({
      name: 'content',
      title: t({ en: 'Content', de: 'Inhalt' }),
      description: t({
        en: 'The blocks of this section, top to bottom. Click a block to edit it; drag to reorder.',
        de: 'Die Blöcke dieses Abschnitts, von oben nach unten. Klick einen Block zum Bearbeiten; ziehen zum Umsortieren.',
      }),
      type: 'array',
      of: COMPONENT_TYPES.map((type) => ({ type })),
    }),
    toneField,
    ...sectionStyleFields,
  ],
  preview: {
    select: { title: 'name', tone: 'tone', content: 'content' },
    prepare({ title, tone, content }) {
      const count = Array.isArray(content) ? content.length : 0;
      const typeLabel = t({ en: 'Text section', de: 'Text-Abschnitt' });
      const blocks = t({ en: 'block(s)', de: 'Block/Blöcke' });
      return {
        title: title || typeLabel,
        subtitle: `${sectionSubtitle(typeLabel, tone)} · ${count} ${blocks}`,
      };
    },
  },
});
