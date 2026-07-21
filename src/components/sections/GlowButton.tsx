import arrowIcon from '../../assets/images/icon-arrow-topright.svg';
import { safeHref } from '../../lib/safe-href';
import type { CtaAction } from '../../lib/content/types';

/**
 * Der Gold-Glow-Primärbutton (Webflow .button-glow, 1:1):
 * Glow-Ring + dunkler Wrapper + Gold-Conic-Gradient-Fläche mit Grain.
 * Hover-Mechanik wie IX2: Pfeil 2 (sichtbar) schiebt nach rechts raus
 * (+131 %), Pfeil 1 kommt von links (-131 %) nach — motion/buttons.ts (a-93/
 * a-98). Der Glow-Kreis folgt der Maus — motion/glow.ts (a-141, [data-glow]).
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
  const iconSrc = typeof arrowIcon === 'string' ? arrowIcon : arrowIcon.src;
  const inner = (
    <>
      <span className="btn-glow__circle" aria-hidden="true" data-glow-circle="" />
      <span className="btn-glow__wrapper">
        <span className="btn-glow__content">
          <span className="btn-glow__label">{label}</span>
          {arrow && (
            <span className="btn-arrows" aria-hidden="true">
              <img src={iconSrc} alt="" loading="lazy" data-btn-icon-1="" />
              <img src={iconSrc} alt="" loading="lazy" data-btn-icon-2="" />
            </span>
          )}
        </span>
      </span>
    </>
  );

  if (action === 'modal' || action === 'modal-aio') {
    return (
      <button
        type="button"
        className="btn-glow"
        data-modal-open={action === 'modal' ? 'cta' : 'aio'}
        data-glow=""
      >
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
      data-glow=""
    >
      {inner}
    </a>
  );
}
