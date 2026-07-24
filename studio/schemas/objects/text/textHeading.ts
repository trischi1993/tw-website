import { defineType } from 'sanity';
import { CaseIcon } from '@sanity/icons/Case';
import { levelField, headingSizeField, textWrapField, maxWidthField, marginBottomField } from './controls';
import { richTextField, ptToPlain } from './richText';
import { t } from '../../uiLocale';

/**
 * Wiederverwendbares Überschrift-Element. Trägt seine Text-Controls SELBST
 * (semantische Ebene, optische Größe, Zeilenumbruch, Breite, Abstand) - im
 * Canvas anklickbar, öffnet genau dieses Element (remarkable-Modell). Als
 * Block-Typ in der `content`-Liste einer Section (kompakte Zeile, Klick öffnet
 * die Einstellungen). Der Text ist Rich Text (Bold/Italic inline, siehe richText).
 * Flache Feldliste, KEINE Tabs (wie remarkables Block-Objekte).
 */
export default defineType({
  name: 'textHeading',
  title: t({ en: 'Heading', de: 'Überschrift' }),
  type: 'object',
  icon: CaseIcon,
  // In einem breiten Dialog öffnen (statt der schmalen Tree-Editing-Pane), damit
  // die Rich-Text-Toolbar (Bold/Italic/Link) Platz hat und inline steht statt im
  // „…"-Overflow zu kollabieren (Sanitys CollapseMenu klappt bei ~259px Pane-
  // Breite ein). options.modal wird von der Array-Item-Bearbeitung honoriert.
  options: { modal: { type: 'dialog', width: 2 } },
  fields: [
    richTextField({ initialText: 'Heading' }),
    levelField,
    headingSizeField,
    textWrapField('pretty'),
    maxWidthField('heading'), // kein Default → Auto (volle Breite)
    marginBottomField,
  ],
  preview: {
    select: { title: 'text', level: 'level', size: 'size' },
    prepare({ title, level, size }) {
      return {
        title: ptToPlain(title) || t({ en: 'Heading', de: 'Überschrift' }),
        subtitle: `${t({ en: 'Heading', de: 'Überschrift' })} · ${(level || 'h2').toUpperCase()} · ${(size || 'xl').toUpperCase()}`,
      };
    },
  },
});
