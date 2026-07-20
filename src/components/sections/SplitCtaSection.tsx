import type { SectionSplitCta } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import Img from './Img';
import GlowButton from './GlowButton';
import RichText from './RichText';

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

  return (
    <section
      id={anchor || undefined}
      className={`split-cta ${plain ? 'is-plain' : 'is-glow'}`}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className={plain ? 'container container--md' : 'container'}>
        <div className={`split-cta__grid${plain ? ' section' : ''}`}>
          <div className="split-cta__content">
            <h2 data-anim="reveal-up" {...edit?.(`${path}.heading`)}>
              {heading}
            </h2>
            {body && body.length > 0 && (
              <div className="split-cta__body" {...edit?.(`${path}.body`)}>
                <RichText value={body} paragraphs />
              </div>
            )}
            <div className="split-cta__buttons button-group" data-anim="reveal-x">
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
