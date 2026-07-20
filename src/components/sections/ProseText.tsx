import type { ReactNode } from 'react';
import type { RichText, RichBlock, RichSpan, RichLink } from '../../lib/content/types';
import { safeHref } from '../../lib/safe-href';

/**
 * Voller Portable-Text-Renderer für Fließtext-Sektionen (Rechtstexte):
 * Überschriften h2–h4, Absätze, Listen (ul/ol), strong/em, Links.
 * Bewusst lean (kein @portabletext/react) und browser-sicher — Server-Render
 * in Produktion, Live-Island in der Vorschau.
 */

function renderSpan(span: RichSpan, markDefs: RichLink[], key: number): ReactNode {
  let node: ReactNode = span.text ?? '';
  for (const mark of span.marks ?? []) {
    if (mark === 'strong') node = <strong key={`s${key}`}>{node}</strong>;
    else if (mark === 'em') node = <em key={`e${key}`}>{node}</em>;
    else {
      const def = markDefs.find((d) => d._key === mark);
      if (def?.href) {
        node = (
          <a
            key={`a${key}`}
            href={safeHref(def.href)}
            target={def.newTab ? '_blank' : undefined}
            rel={def.newTab ? 'noopener noreferrer' : undefined}
          >
            {node}
          </a>
        );
      }
    }
  }
  return <span key={key}>{node}</span>;
}

function blockChildren(block: RichBlock): ReactNode[] {
  const markDefs = block.markDefs ?? [];
  return (block.children ?? []).map((c, i) => renderSpan(c, markDefs, i));
}

export default function ProseText({ value, className }: { value?: RichText; className?: string }) {
  if (!value?.length) return null;

  const out: ReactNode[] = [];
  let list: { type: 'bullet' | 'number'; items: ReactNode[] } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{it}</li>);
    out.push(list.type === 'number' ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
    list = null;
  };

  value.forEach((block, i) => {
    if (block._type !== 'block') return;
    const key = block._key ?? String(i);

    if (block.listItem) {
      const type = block.listItem === 'number' ? 'number' : 'bullet';
      if (!list || list.type !== type) {
        flushList(`l${i}`);
        list = { type, items: [] };
      }
      list.items.push(blockChildren(block));
      return;
    }

    flushList(`l${i}`);
    const children = blockChildren(block);
    switch (block.style) {
      case 'h2':
        out.push(<h2 key={key}>{children}</h2>);
        break;
      case 'h3':
        out.push(<h3 key={key}>{children}</h3>);
        break;
      case 'h4':
        out.push(<h4 key={key}>{children}</h4>);
        break;
      default:
        out.push(<p key={key}>{children}</p>);
    }
  });
  flushList('ltail');

  return <div className={className ? `prose ${className}` : 'prose'}>{out}</div>;
}
