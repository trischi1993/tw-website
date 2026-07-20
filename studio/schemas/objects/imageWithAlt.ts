import { defineType, defineField } from 'sanity';

/**
 * Bild mit Pflicht-Alternativtext. Wird überall verwendet, wo ein Foto
 * hochgeladen wird. Der Alt-Text ist für Barrierefreiheit und Google nötig
 * und daher Pflicht – ohne ihn lässt sich nicht veröffentlichen.
 */
export default defineType({
  name: 'imageWithAlt',
  title: 'Bild',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternativtext',
      description:
        'Kurze Beschreibung des Bildes für Screenreader und Google (z. B. „Blick vom Balkon auf die Vinschger Bergwelt“). Pflicht.',
      type: 'string',
      validation: (R) => R.required().min(5).warning('Bitte einen aussagekräftigen Alt-Text angeben.'),
    }),
    defineField({
      name: 'caption',
      title: 'Bildunterschrift (optional)',
      description: 'Wird – sofern das Layout sie zeigt – unter dem Bild angezeigt. Kann leer bleiben.',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'alt', subtitle: 'caption', media: 'asset' },
    prepare({ title, subtitle, media }) {
      return { title: title || 'Bild', subtitle, media };
    },
  },
});
