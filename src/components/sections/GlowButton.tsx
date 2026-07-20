import arrowIcon from '../../assets/images/icon-arrow-topright.svg';
import { safeHref } from '../../lib/safe-href';
import type { CtaAction } from '../../lib/content/types';

/**
 * Der Gold-Glow-Primärbutton (Webflow .button-glow, 1:1):
 * Glow-Ring + dunkler Wrapper + Gold-Conic-Gradient-Fläche mit Grain.
 * `action` 'modal'/'modal-aio' rendert einen <button> mit data-modal-open —
 * das globale Modal-Script (src/scripts/modals.ts) übernimmt das Öffnen.
 */
export default function GlowButton({
  label,
  href,
  action = 'link',
  newTab,
  arrow = true,
}: {
  label: string;
  href?: string;
  action?: CtaAction;
  newTab?: boolean;
  arrow?: boolean;
}) {
  const inner = (
    <>
      <span className="btn-glow__circle" aria-hidden="true" data-glow-circle="" />
      <span className="btn-glow__wrapper">
        <span className="btn-glow__content">
          <span className="btn-glow__label">{label}</span>
          {arrow && (
            <span className="btn-arrows" aria-hidden="true">
              <img src={typeof arrowIcon === 'string' ? arrowIcon : arrowIcon.src} alt="" loading="lazy" />
              <img src={typeof arrowIcon === 'string' ? arrowIcon : arrowIcon.src} alt="" loading="lazy" />
            </span>
          )}
        </span>
      </span>
    </>
  );

  if (action === 'modal' || action === 'modal-aio') {
    return (
      <button type="button" className="btn-glow" data-modal-open={action === 'modal' ? 'cta' : 'aio'}>
        {inner}
      </button>
    );
  }
  return (
    <a
      className="btn-glow"
      href={safeHref(href ?? '#')}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {inner}
    </a>
  );
}
