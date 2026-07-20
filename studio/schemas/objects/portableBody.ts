import { defineArrayMember } from 'sanity';

/**
 * Bewusst eingeschränkter Fließtext-Editor für mehrteilige Texte
 * (Begrüßung, Einleitungen, Anreise-Beschreibung, Text-Abschnitte).
 *
 * Erlaubt sind nur die Formatierungen, die das Website-Design unterstützt:
 * normaler Absatz, Zwischenüberschriften (H2/H3), Fett, Link und einfache
 * Aufzählungen. So bleibt der Text sauber und kann die Seite nicht „zerschießen“.
 *
 * Wichtig: Die Astro-Seite liest sowohl Portable Text als auch einfachen Text –
 * jeder Absatz hier wird auf der Website zu einem eigenen Absatz.
 */
export const portableBody = [
  defineArrayMember({
    type: 'block',
    // Nur diese Block-Stile zur Auswahl:
    styles: [
      { title: 'Absatz', value: 'normal' },
      { title: 'Überschrift', value: 'h2' },
      { title: 'Zwischenüberschrift', value: 'h3' },
    ],
    // Keine Block-Zitate o. Ä.
    lists: [{ title: 'Aufzählung', value: 'bullet' }],
    marks: {
      // Nur Fett – kein Kursiv, Unterstrichen etc.
      decorators: [{ title: 'Fett', value: 'strong' }],
      // Nur ein einfacher Link als Annotation.
      annotations: [
        {
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            {
              name: 'href',
              title: 'Ziel (URL)',
              type: 'url',
              description: 'Interne Seiten beginnen mit „/“, externe Links mit „https://“.',
              validation: (R: any) =>
                R.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
            },
          ],
        },
      ],
    },
  }),
];
