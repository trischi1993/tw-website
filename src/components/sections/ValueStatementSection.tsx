import type { SectionValueStatement } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import { contentShell } from './shell';

/** Großes Statement unter dem Hero — Zeilen-Reveal (data-anim="lines"). */
export default function ValueStatementSection({
  section,
  edit,
}: {
  section: SectionValueStatement;
  edit?: EditAttr;
}) {
  const { _key, anchor, text } = section;
  const path = `sections[_key=="${_key}"]`;
  // Padding-Default lebt im CSS (.value-stmt, responsiv) → base: false, keine Fallbacks.
  const shell = contentShell(section, { base: false });

  return (
    <section
      id={anchor || undefined}
      className={`value-stmt ${shell.className}`.trim()}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <p
          className="value-stmt__text"
          data-anim="lines"
          data-delay="0.2"
          data-stagger="0.5"
          {...edit?.(`${path}.text`)}
        >
          {text}
        </p>
      </div>
    </section>
  );
}
