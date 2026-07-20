import type { CSSProperties } from 'react';
import type { ParagraphEl } from '../../lib/content/types';
import { PARAGRAPH_SIZE_CLASS, COLOR_CLASS, wrapStyle, spaceVar } from '../../lib/content/sections';
import RichText from './RichText';

/**
 * Absatz-Element. Eigene Größe (.p-*), Farbe (.c-*, theme-aware), Zeilenumbruch,
 * Lese-Breite (ch) und Abstand - je Absatz einstellbar (Text je nach Länge
 * breiter/schmaler). Der Text ist Rich Text (Bold/Italic/Link inline). `edit` =
 * data-sanity-Attribute (Click-to-edit öffnet genau diesen Absatz); Prod undefined.
 */
export default function ParagraphElement({
  paragraph,
  edit,
  path,
}: {
  paragraph: ParagraphEl;
  edit?: (p: string) => Record<string, string> | undefined;
  path: string;
}) {
  const { text, size = 'md', color = 'default', textWrap, maxWidth, marginBottom } = paragraph;

  const className = ['paragraph', PARAGRAPH_SIZE_CLASS[size], COLOR_CLASS[color]]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {};
  const w = wrapStyle(textWrap);
  if (w) style.textWrap = w as CSSProperties['textWrap'];
  if (typeof maxWidth === 'number') style.maxWidth = `${maxWidth}ch`;
  const mb = spaceVar(marginBottom);
  if (mb) style.marginBottom = mb;

  const editAttrs = edit?.(path);

  return (
    <p
      className={className}
      style={Object.keys(style).length ? style : undefined}
      // Nur in der Vorschau: roher Pfad + Kind für den Canvas-maxWidth-Resizer.
      data-el-path={editAttrs ? path : undefined}
      data-el-kind={editAttrs ? 'paragraph' : undefined}
      {...editAttrs}
    >
      <RichText value={text} />
    </p>
  );
}
