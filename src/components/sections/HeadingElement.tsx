import type { CSSProperties } from 'react';
import type { HeadingEl } from '../../lib/content/types';
import { HEADING_SIZE_CLASS, wrapStyle, spaceVar } from '../../lib/content/sections';
import RichText from './RichText';

/**
 * Überschrift-Element. Semantisches Tag (h1–h6) und optische Größe sind
 * ENTKOPPELT: `level` steuert nur das Tag (SEO), `size` nur die Klasse (.h-*).
 * text-wrap / max-width (ch) / marginBottom als Inline-Style aus den Element-
 * Feldern. Der Text ist Rich Text (Bold/Italic/Link inline). `edit` liefert die
 * data-sanity-Attribute (Click-to-edit öffnet genau diese Überschrift); in
 * Produktion undefined → attributfreies statisches HTML.
 */
export default function HeadingElement({
  heading,
  edit,
  path,
}: {
  heading: HeadingEl;
  edit?: (p: string) => Record<string, string> | undefined;
  path: string;
}) {
  const { text, level = 'h2', size = 'xl', textWrap, maxWidth, marginBottom } = heading;

  const Tag = level;
  const className = ['heading', HEADING_SIZE_CLASS[size]].filter(Boolean).join(' ');

  const style: CSSProperties = {};
  const w = wrapStyle(textWrap);
  if (w) style.textWrap = w as CSSProperties['textWrap'];
  if (typeof maxWidth === 'number') style.maxWidth = `${maxWidth}ch`;
  const mb = spaceVar(marginBottom);
  if (mb) style.marginBottom = mb;

  const editAttrs = edit?.(path);

  return (
    <Tag
      className={className}
      style={Object.keys(style).length ? style : undefined}
      // Nur in der Vorschau: roher Pfad + Kind für den Canvas-maxWidth-Resizer.
      data-el-path={editAttrs ? path : undefined}
      data-el-kind={editAttrs ? 'heading' : undefined}
      {...editAttrs}
    >
      <RichText value={text} />
    </Tag>
  );
}
