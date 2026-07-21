import type { SectionSplitCta } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import RichText from './RichText';
import { contentShell } from './shell';

/**
 * Text links + Bild rechts + Glow-CTA. layout 'glow' = Gold-Blur-Fleck hinter
 * dem Bild (AIO-Teaser); 'plain' = ohne (Erfolgs-Check, container-medium).
 */
export default function SplitCtaSection({
  section,
  edit,
}: {
  section: SectionSplitCta;
  edit?: EditAttr;
}) {
  const {
    _key,
    anchor,
    heading,
    body,
    ctaLabel,
    ctaAction = 'link',
    ctaHref,
    ctaNewTab,
    layout = 'glow',
    image,
  } = section;
  const path = `sections[_key=="${_key}"]`;
  const plain = layout === 'plain';
  // Padding kommt vom inneren Grid (`split-cta__grid section` im plain-Fall) → base: false.
  const shell = contentShell(section, { base: false });

  return (
    <section
      id={anchor || undefined}
      className={`split-cta ${plain ? 'is-plain' : 'is-glow'} ${shell.className}`.trim()}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className={plain ? 'container container--md' : 'container'}>
        <div className={`split-cta__grid${plain ? ' section' : ''}`}>
          <div className="split-cta__content">
            {/* IX2: glow (section_cta, e-901) Offset 0, plain (standard-layout, e-516) Offset 16 */}
            <h2 data-anim="reveal" data-offset={plain ? undefined : '0'} {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {body && body.length > 0 && (
              <div className="split-cta__body" {...edit?.(`${path}.body`)}>
                <RichText value={body} paragraphs />
              </div>
            )}
            <div className="split-cta__buttons button-group">
              <GlowButton label={ctaLabel} action={ctaAction} href={ctaHref} newTab={ctaNewTab} />
            </div>
          </div>
          <div className="split-cta__media">
            {!plain && <div className="split-cta__blur" aria-hidden="true" />}
            <Img image={image} sizes="(max-width: 767px) 90vw, 40vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
