import type { CSSProperties } from 'react';
import type { CtaEl } from '../../lib/content/types';
import { CTA_VARIANT_CLASS, spaceVar } from '../../lib/content/sections';
import { safeHref } from '../../lib/safe-href';

/** Token-styled CTA link. Static in production, canvas-editable in Presentation. */
export default function CtaElement({
  cta,
  edit,
  path,
}: {
  cta: CtaEl;
  edit?: (path: string) => Record<string, string> | undefined;
  path: string;
}) {
  const { label, href, variant = 'primary', newTab, marginBottom } = cta;
  if (!label || !href) return null;

  const style: CSSProperties = {};
  const margin = spaceVar(marginBottom);
  if (margin) style.marginBottom = margin;
  const editAttrs = edit?.(path);

  return (
    <a
      href={safeHref(href)}
      className={`btn ${CTA_VARIANT_CLASS[variant]}`}
      style={Object.keys(style).length ? style : undefined}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      data-el-path={editAttrs ? path : undefined}
      data-el-kind={editAttrs ? 'cta' : undefined}
      {...editAttrs}
    >
      <span>{label}</span>
      {variant === 'link' && (
        <span className="btn__chevron" aria-hidden="true">
          {'\u203a'}
        </span>
      )}
    </a>
  );
}
