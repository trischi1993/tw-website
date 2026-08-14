import { gsap, EASE } from './util';

let responsiveNavbarAnimations: Animation[] = [];

/* ---------------------------------------------------------------------------
   E-Book-Load-Choreografie, abgeleitet vom gemeinsamen AIO-/Über-mich-Muster:
   Textblöcke kommen nacheinander von rechts, das Mockup faded zuletzt ein;
   parallel wächst die Logo-Linie und der rechte Navbar-Block fährt ein.
   Die zusätzlichen E-Book-Facts reihen sich zwischen Intro und CTA ein.
   --------------------------------------------------------------------------- */

export function init(_mm: gsap.MatchMedia): void {
  const hero = document.querySelector<HTMLElement>('[data-ebook-hero]');
  if (!hero) return;
  // Mobil spielt das kleine browsernative Startmodul dieselbe Choreografie.
  // Wenn das vollständige Motion-Bundle nach dem Hero nachgeladen wird, darf
  // es nur die Animationen darunter initialisieren und den Header nicht ein
  // zweites Mal abspielen.
  if (document.documentElement.classList.contains('ebook-mobile-motion')) return;

  const heading = hero.querySelector<HTMLElement>('[data-ebook-heading]');
  const intro = hero.querySelector<HTMLElement>('[data-ebook-intro]');
  const facts = hero.querySelector<HTMLElement>('[data-ebook-facts]');
  const buttons = hero.querySelector<HTMLElement>('[data-ebook-buttons]');
  const visual = hero.querySelector<HTMLElement>('[data-ebook-visual]');
  const visualImage = visual?.querySelector<HTMLImageElement>(':scope > img');
  const stamp = visual?.querySelector<HTMLElement>('.ebook-hero__stamp');
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  [heading, intro, facts, buttons, visual, navRight].forEach((element) => {
    element?.setAttribute('data-revealed', '');
  });
  logoLines.forEach((line) => line.setAttribute('data-revealed', ''));

  const slideTargets = [heading, intro, facts, buttons].filter(
    (element): element is HTMLElement => Boolean(element),
  );
  if (slideTargets.length) {
    gsap.set(slideTargets, {
      opacity: 0,
      x: '2rem',
      force3D: true,
      willChange: 'transform, opacity',
    });
  }
  if (visual) gsap.set(visual, { opacity: 0, willChange: 'opacity' });
  if (isMobile && stamp) {
    gsap.set(stamp, {
      opacity: 0,
      y: '0.5rem',
      scale: 0.9,
      rotation: -3,
      force3D: true,
      willChange: 'transform, opacity',
    });
  }
  if (navRight) gsap.set(navRight, { opacity: 0, x: '2.5rem', force3D: true });

  logoLines.forEach((line) => {
    gsap.fromTo(
      line,
      { scaleY: 0, transformOrigin: '50% 50%' },
      {
        scaleY: 1,
        duration: 0.5,
        delay: 0.1,
        ease: EASE.outQuart,
        clearProps: 'transform,transformOrigin',
      },
    );
  });

  if (navRight) {
    gsap.to(navRight, { opacity: 1, duration: 1.2, delay: 0.3, ease: EASE.ease });
    gsap.to(navRight, { x: 0, duration: 1, delay: 0.3, ease: EASE.outQuart, force3D: true });
  }
  if (heading) {
    gsap.to(heading, { opacity: 1, duration: 0.75, delay: 0.4, ease: EASE.ease });
    gsap.to(heading, {
      x: 0,
      duration: 0.75,
      delay: 0.4,
      ease: EASE.outQuart,
      clearProps: 'transform,willChange',
    });
  }
  if (intro) {
    gsap.to(intro, { opacity: 1, duration: 0.75, delay: 0.6, ease: EASE.ease });
    gsap.to(intro, {
      x: 0,
      duration: 0.75,
      delay: 0.6,
      ease: EASE.outQuart,
      clearProps: 'transform,willChange',
    });
  }
  if (facts) {
    gsap.to(facts, { opacity: 1, duration: 0.75, delay: 0.8, ease: EASE.ease });
    gsap.to(facts, {
      x: 0,
      duration: 0.75,
      delay: 0.8,
      ease: EASE.outQuart,
      clearProps: 'transform,willChange',
    });
  }
  if (buttons) {
    gsap.to(buttons, { opacity: 1, duration: 0.5, delay: 1, ease: EASE.ease });
    gsap.to(buttons, {
      x: 0,
      duration: 0.75,
      delay: 1,
      ease: EASE.outQuart,
      clearProps: 'transform,willChange',
    });
  }

  const revealVisual = () => {
    if (visual) {
      gsap.to(visual, {
        opacity: 1,
        duration: 0.5,
        ease: EASE.ease,
        clearProps: 'willChange',
      });
    }
    if (isMobile && stamp) {
      gsap.to(stamp, { opacity: 1, duration: 0.55, ease: EASE.ease });
      gsap.to(stamp, {
        y: 0,
        scale: 1,
        rotation: 8,
        duration: 0.75,
        ease: EASE.outQuart,
        clearProps: 'transform,willChange',
      });
    }
  };

  if (isMobile) {
    const decoded = visualImage?.decode
      ? visualImage.decode().catch(() => undefined)
      : Promise.resolve();
    const choreographyDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1300);
    });
    void Promise.all([decoded, choreographyDelay]).then(revealVisual);
  } else if (visual) {
    gsap.to(visual, {
      opacity: 1,
      duration: 0.5,
      delay: 1.3,
      ease: EASE.ease,
      clearProps: 'willChange',
    });
  }
}

/** Bildet beim Wechsel zwischen Desktop-/Tablet-/Mobile-Breakpoints dieselbe
 * Navbar-Wiederholung wie auf der AIO- und Über-mich-Seite ab. */
export function restartNavbar(): void {
  if (!document.querySelector('[data-ebook-hero]')) return;
  if (document.documentElement.classList.contains('ebook-mobile-motion')) return;
  const logoLines = document.querySelectorAll<HTMLElement>('[data-nav-logo-line]');
  const navRight = document.querySelector<HTMLElement>('[data-nav-right]');

  responsiveNavbarAnimations.forEach((animation) => animation.cancel());
  responsiveNavbarAnimations = [];

  logoLines.forEach((line) => {
    responsiveNavbarAnimations.push(line.animate(
      [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
      {
        duration: 500,
        delay: 100,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: 'backwards',
      },
    ));
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
        [{ transform: 'translate3d(2.5rem, 0, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
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
