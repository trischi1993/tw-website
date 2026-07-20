import type { SectionPageHeader } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';

/** Seitenkopf (Legal-Seiten): H1 + Meta-Zeile in schmaler Spalte. */
export default function PageHeaderSection({
  section,
  edit,
}: {
  section: SectionPageHeader;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, meta } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <header
      id={anchor || undefined}
      className="page-head section"
      style={{ paddingBlock: 'var(--section-pad-large)' }}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="page-head__inner">
          <h1 {...edit?.(`${path}.heading`)}>{heading}</h1>
          {meta && (
            <p className="page-head__meta" {...edit?.(`${path}.meta`)}>
              {meta}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
