import { Fragment, type ReactNode } from 'react';
import type { RichText as RichTextValue, RichSpan, RichLink } from '../../lib/content/types';
import { safeHref } from '../../lib/safe-href';

/**
 * Minimaler Portable-Text-Renderer für unser constrained Rich Text (nur
 * `normal`-Blöcke, Decorators strong/em, Link-Annotation). Bewusst OHNE
 * @portabletext/react-Dependency (lean) - unsere Form ist eng, ein ~40-Zeilen-
 * Renderer reicht und bleibt prod-sicher (Server-Render → statisches HTML, kein
 * Client-JS in Prod). Rendert INLINE, damit das semantische Tag des Aufrufers
 * (Heading/Paragraph) den Text umschließt; mehrere Blöcke stapeln mit Umbruch.
 */
function renderSpan(span: RichSpan, markDefs: RichLink[], key: string): ReactNode {
  let node: ReactNode = span.text ?? '';
  for (const mark of span.marks ?? []) {
    const link = markDefs.find((d) => d._key === mark);
    if (link) {
      node = (
        <a href={safeHref(link.href)} {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {node}
        </a>
      );
    } else if (mark === 'strong') {
      node = <strong>{node}</strong>;
    } else if (mark === 'em') {
      node = <em>{node}</em>;
    }
  }
  return <Fragment key={key}>{node}</Fragment>;
}

export default function RichText({
  value,
  paragraphs = false,
}: {
  value?: RichTextValue;
  /** true: jeder Block wird ein eigener <p> (Absatz-Abstände statt <br>). */
  paragraphs?: boolean;
}) {
  if (!Array.isArray(value)) return null;
  if (paragraphs) {
    return (
      <>
        {value.map((block, bi) => {
          if (block?._type !== 'block' || !Array.isArray(block.children)) return null;
          const markDefs = block.markDefs ?? [];
          return (
            <p key={block._key ?? bi}>
              {block.children.map((span, si) => renderSpan(span, markDefs, span._key ?? String(si)))}
            </p>
          );
        })}
      </>
    );
  }
  return (
    <>
      {value.map((block, bi) => {
        if (block?._type !== 'block' || !Array.isArray(block.children)) return null;
        const markDefs = block.markDefs ?? [];
        return (
          <Fragment key={block._key ?? bi}>
            {bi > 0 ? <br /> : null}
            {block.children.map((span, si) => renderSpan(span, markDefs, span._key ?? String(si)))}
          </Fragment>
        );
      })}
    </>
  );
}
