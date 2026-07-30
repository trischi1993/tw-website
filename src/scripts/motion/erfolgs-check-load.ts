import { EASE, gsap } from './util';

let responsiveNavbarAnimations: Animation[] = [];

const isErfolgsCheckPage = () =>
  Boolean(document.querySelector('[data-erfolgs-check]'));

/**
 * Der Erfolgs-Check übernimmt exakt den Navbar-Aufbau der Über-mich-Seite,
 * ohne die Quiz-Instanz oder ihren Zustand anzufassen. T und W bleiben dabei
 * statisch; nur die Goldlinie und der rechte Navbar-Bereich animieren.
 */
export function init(): void {
  if (!isErfolgsCheckPage()) return;

  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  logoLines.forEach((line) => line.setAttribute('data-revealed', ''));
  navRight?.setAttribute('data-revealed', '');

  logoLines.forEach((line) => {
    responsiveNavbarAnimations.push(
      line.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
        duration: 500,
        delay: 100,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: 'backwards',
      }),
    );
  });

  if (navRight) {
    gsap.set(navRight, { opacity: 0, x: '2.5rem', force3D: true });
    gsap.to(navRight, {
      opacity: 1,
      duration: 1.2,
      delay: 0.3,
      ease: EASE.ease,
    });
    gsap.to(navRight, {
      x: 0,
      duration: 1,
      delay: 0.3,
      ease: EASE.outQuart,
      force3D: true,
    });
  }
}

/** Nur die Navbar-Choreografie nach einem responsiven Media-Key-Wechsel. */
export function restartNavbar(): void {
  if (!isErfolgsCheckPage()) return;

  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  responsiveNavbarAnimations.forEach((animation) => animation.cancel());
  responsiveNavbarAnimations = [];

  logoLines.forEach((line) => {
    responsiveNavbarAnimations.push(
      line.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
        duration: 500,
        delay: 100,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: 'backwards',
      }),
    );
  });

  if (navRight) {
    responsiveNavbarAnimations.push(
      navRight.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1200,
        delay: 300,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        fill: 'backwards',
      }),
      navRight.animate(
        [
          { transform: 'translate3d(2.5rem, 0, 0)' },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: 1000,
          delay: 300,
          easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
          fill: 'backwards',
        },
      ),
    );
  }
}
