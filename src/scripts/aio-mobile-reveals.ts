import * as bonuses from './motion/bonuses';
import * as reveals from './motion/reveals';
import { refreshEnterOnce } from './motion/util';

/* Die AIO-Seite trennt auf Mobilgeraeten bewusst zwei Aufgaben:
   - Scroll-Eintritte muessen ab dem ersten Wisch bereit sein.
   - Das vollstaendige Motion-Paket mit ScrollTrigger-Vermessung darf erst in
     einer ruhigen Phase laden, damit Menue und nativer Scroll nicht stocken.

   Dieses kleine Entry initialisiert deshalb nur die sichtbaren Entrances. Die
   Module sind idempotent; motion.ts uebernimmt sie spaeter, ohne Elemente ein
   zweites Mal zu verstecken oder Animationen neu zu starten. */

const root = document.documentElement;

if (
  root.classList.contains('aio-mobile-motion') &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  reveals.init();
  bonuses.init();

  // Bis das vollstaendige Motion-Paket seine zentrale Rotationssicherung
  // uebernimmt, schuetzt dieser schlanke Handler laufende Text-Reveals vor
  // fragmentierten WebKit-Blur-Layern.
  const portrait = window.matchMedia('(orientation: portrait)');
  let settleTimer: number | undefined;

  const onOrientationChange = () => {
    reveals.settleForOrientationChange();
    requestAnimationFrame(() => {
      requestAnimationFrame(refreshEnterOnce);
    });

    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      settleTimer = undefined;
      refreshEnterOnce();
      reveals.releaseOrientationHold();
    }, 600);
  };

  const handOffToFullMotion = () => {
    portrait.removeEventListener('change', onOrientationChange);
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    reveals.releaseOrientationHold();
  };

  portrait.addEventListener('change', onOrientationChange);
  window.addEventListener('lp:full-motion-ready', handOffToFullMotion, { once: true });
}

export {};
