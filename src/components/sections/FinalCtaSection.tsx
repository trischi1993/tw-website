import type { SectionFinalCta } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import GlowButton from './GlowButton';
import { contentShell } from './shell';

/** Abschluss-CTA: schmale Spalte mit Überschrift, optionalem Text und Glow-CTA. */
export default function FinalCtaSection({
  section,
  edit,
}: {
  section: SectionFinalCta;
  edit?: EditAttr;
}) {
  const { _key, anchor, heading, text, ctaLabel, ctaAction = 'link', ctaHref, ctaNewTab } = section;
  const path = `sections[_key=="${_key}"]`;
  // Bisher ohne Inline-Padding (`.section`-Default medium) → keine Pad-Fallbacks.
  const shell = contentShell(section);

  return (
    <section
      id={anchor || undefined}
      className={`final-cta ${shell.className}`}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="final-cta__content max-w-lg">
          <h2 data-anim="reveal" {...edit?.(`${path}.heading`)}>
            {heading}
          </h2>
          {text && (
            <p data-anim="reveal" {...edit?.(`${path}.text`)}>
              {text}
            </p>
          )}
          <div className="final-cta__buttons button-group">
            <GlowButton label={ctaLabel} action={ctaAction} href={ctaHref} newTab={ctaNewTab} />
          </div>
        </div>
      </div>
    </section>
  );
}
