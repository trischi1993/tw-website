import type { CSSProperties } from 'react';
import type { EyebrowEl } from '../../lib/content/types';
import { spaceVar } from '../../lib/content/sections';

/**
 * Überzeile-Element: das kleine Label über einer Überschrift. Look aus `.eyebrow`
 * (global.css), nur optionaler Abstand als Inline-Style. Im Canvas anklickbar
 * (data-el-*); Prod undefined → attributfreies statisches HTML.
 */
export default function EyebrowElement({
  eyebrow,
  edit,
  path,
}: {
  eyebrow: EyebrowEl;
  edit?: (p: string) => Record<string, string> | undefined;
  path: string;
}) {
  const { text, marginBottom } = eyebrow;
  if (!text) return null;

  const style: CSSProperties = {};
  const mb = spaceVar(marginBottom);
  if (mb) style.marginBottom = mb;

  const editAttrs = edit?.(path);

  return (
    <p
      className="eyebrow"
      style={Object.keys(style).length ? style : undefined}
      data-el-path={editAttrs ? path : undefined}
      data-el-kind={editAttrs ? 'eyebrow' : undefined}
      {...editAttrs}
    >
      {text}
    </p>
  );
}
