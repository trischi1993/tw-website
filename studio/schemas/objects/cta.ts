import { defineField, defineType, type Rule } from 'sanity';
import { LinkIcon } from '@sanity/icons/Link';
import { SegmentedInput, type SegmentedOption } from '../../components/inputs/SegmentedInput';
import { categoryIcon } from '../../components/inputs/categoryIcon';
import { marginBottomField } from './text/controls';
import { t, tOptions } from '../uiLocale';

export default defineType({
  name: 'cta',
  title: t({ en: 'CTA button', de: 'CTA-Button' }),
  type: 'object',
  icon: categoryIcon(LinkIcon, 'component'),
  options: { modal: { type: 'dialog', width: 2 } },
  fields: [
    defineField({
      name: 'label',
      title: t({ en: 'Label', de: 'Beschriftung' }),
      type: 'string',
      initialValue: 'Button',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: t({ en: 'Link', de: 'Link' }),
      description: t({
        en: 'A URL, an internal path (/about), an anchor (#contact), email or phone link.',
        de: 'Eine URL, ein interner Pfad (/ueber-uns), ein Anker (#kontakt), E-Mail- oder Telefon-Link.',
      }),
      type: 'string',
      initialValue: '#',
      // Scheme-Allowlist: blockt javascript:/data:/… (XSS über href), lässt
      // http/https/mailto/tel + relative Pfade/Anker zu. Zweite Ebene: safeHref
      // im Renderer (src/lib/safe-href.ts). Cast: `.uri()` existiert zur
      // Laufzeit auch auf String-Feldern, fehlt aber im StringRule-Typ.
      validation: (rule) =>
        (rule as unknown as Rule).required().uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
    }),
    defineField({
      name: 'variant',
      title: t({ en: 'Variant', de: 'Variante' }),
      type: 'string',
      initialValue: 'primary',
      options: {
        list: tOptions([
          { en: 'Primary', de: 'Primär', value: 'primary' },
          { en: 'Secondary', de: 'Sekundär', value: 'secondary' },
          { en: 'Outline', de: 'Kontur', value: 'outline' },
          { en: 'Link', value: 'link' },
        ]) as SegmentedOption[],
      },
      components: { input: SegmentedInput },
    }),
    defineField({
      name: 'newTab',
      title: t({ en: 'Open in new tab', de: 'In neuem Tab öffnen' }),
      type: 'boolean',
      initialValue: false,
    }),
    marginBottomField,
  ],
  preview: {
    select: { title: 'label', variant: 'variant', href: 'href' },
    prepare({ title, variant, href }) {
      return {
        title: title || t({ en: 'CTA button', de: 'CTA-Button' }),
        subtitle: `CTA · ${(variant || 'primary').toUpperCase()} · ${href || '#'}`,
      };
    },
  },
});
