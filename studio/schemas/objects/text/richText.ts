import { defineField, defineArrayMember, type PortableTextBlock } from 'sanity';
import { LinkIcon } from '@sanity/icons/Link';
import { t } from '../../uiLocale';

/* ---------------------------------------------------------------------------
   Geteiltes Rich-Text-Feld (Portable Text) für Text-Elemente (Heading/Absatz).
   BEWUSST minimal, remarkable-Muster: EIN `block`-Member, nur `normal`-Style
   (die optische Größe/Ebene besitzt das Element getrennt), KEINE Listen,
   Decorators nur Bold (`strong`) + Italic (`em`), eine Link-Annotation.

   Der native Portable-Text-Editor liefert dadurch gratis: Auto-Höhe (wächst mit
   dem Text) + Inline-Fettung/Kursiv im Editor (WYSIWYG) - genau Julians Wunsch,
   kein Custom-Input nötig. Die Array-Vorschau zeigt den echten Text (nicht „…")
   über `ptToPlain` im preview.prepare des jeweiligen Elements.
   --------------------------------------------------------------------------- */

/** Ein `text`-Feld als constrained Portable Text. `initial` seedet einen Block. */
export function richTextField(opts?: { name?: string; title?: string; initialText?: string }) {
  return defineField({
    name: opts?.name ?? 'text',
    title: opts?.title ?? t({ en: 'Text', de: 'Text' }),
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        // Nur „Normal" - keine h1/h2/Zitat-Stile (Größe/Ebene sind eigene Felder).
        styles: [{ title: 'Normal', value: 'normal' }],
        lists: [],
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
                  title: t({ en: 'URL', de: 'URL' }),
                  type: 'string',
                  description: t({
                    en: 'A URL (https://…), a path (/about) or an anchor (#section).',
                    de: 'Eine URL (https://…), ein Pfad (/ueber-uns) oder ein Anker (#abschnitt).',
                  }),
                  // Scheme-Allowlist gegen javascript:/data:-XSS (zweite Ebene:
                  // safeHref im Renderer, src/lib/safe-href.ts).
                  validation: (R) =>
                    R.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
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
    ...(opts?.initialText ? { initialValue: ptFromString(opts.initialText) } : {}),
    validation: (R) => R.required(),
  });
}

/** Plain-String → ein Portable-Text-Block (für Seeds/Initial-Values). */
export function ptFromString(text: string): PortableTextBlock[] {
  return [
    {
      _type: 'block',
      _key: 'initial',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 'initial0', text, marks: [] }],
    },
  ];
}

/** Portable Text → Plain-String (für Array-Vorschauen; zeigt echten Text statt „…"). */
export function ptToPlain(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value
    .map((block) => {
      const b = block as { _type?: string; children?: Array<{ text?: unknown }> };
      if (b?._type !== 'block' || !Array.isArray(b.children)) return '';
      return b.children.map((c) => (typeof c?.text === 'string' ? c.text : '')).join('');
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
