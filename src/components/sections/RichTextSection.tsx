import type { SectionRichText } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import ProseText from './ProseText';
import { contentShell } from './shell';

/** Freier Rich-Text (Rechtstexte): volle Portable-Text-Palette im Prose-Stil. */
export default function RichTextSection({
  section,
  edit,
}: {
  section: SectionRichText;
  edit?: EditAttr;
}) {
  const { _key, anchor, body } = section;
  const path = `sections[_key=="${_key}"]`;
  // Padding-Default lebt im CSS (.legal-text, responsiv) → base: false, keine Fallbacks.
  const shell = contentShell(section, { base: false });

  return (
    <section
      id={anchor || undefined}
      className={`legal-text ${shell.className}`.trim()}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div {...edit?.(`${path}.body`)}>
          <ProseText value={body} />
        </div>
      </div>
    </section>
  );
}
