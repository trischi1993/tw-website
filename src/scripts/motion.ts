import { gsap, ScrollTrigger } from './motion/util';
import * as lines from './motion/lines';
import * as reveals from './motion/reveals';
import * as homeLoad from './motion/home-load';
import * as homeHero from './motion/home-hero';
import * as results from './motion/results';
import * as banner from './motion/banner';
import * as gallery from './motion/gallery';
import * as faqHover from './motion/faq-hover';
import * as aioLoad from './motion/aio-load';
import * as moduleScrub from './motion/module';
import * as bonuses from './motion/bonuses';
import * as aboutLoad from './motion/about-load';
import * as timeline from './motion/timeline';
import * as interests from './motion/interests';
import * as footer from './motion/footer';
import * as buttons from './motion/buttons';
import * as glow from './motion/glow';

/* ---------------------------------------------------------------------------
   Zentraler Motion-Init - 1:1-Nachbau der Webflow-Animationen (IX2 + IX3 +
   Custom-Scripts, dekodiert aus dem Export; Referenz im Repo-HANDOVER).

   Grundsätze:
   - Initialzustände NUR per gsap.set in den Modulen - nie im CSS. Ohne JS ist
     alles sichtbar; Scroll-Strecken-Layouts aktiviert erst `html.has-motion`.
   - Jedes Modul setzt seine Initialzustände innerhalb DERSELBEN
     matchMedia-Bedingung wie seine Animation (sonst versteckt z. B. der
     Footer-Reveal auf Mobile Inhalte, obwohl er dort nie abspielt).
   - prefers-reduced-motion: kompletter No-op (statische Layouts). Funktionale
     Interaktionen (Menü, FAQ, Modals, Consent) leben in widgets/menu/consent
     und bleiben auch dann bedienbar.
   --------------------------------------------------------------------------- */

function init(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('has-motion');
  // Signal fürs Pre-Paint-Failsafe (BaseLayout-Inline-Script): das Motion-Bundle
  // hat initialisiert und übernimmt die Reveals - Failsafe NICHT auslösen.
  document.documentElement.classList.add('motion-ready');
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();

  lines.init();
  reveals.init(mm);
  homeLoad.init(mm);
  homeHero.init(mm);
  results.init(mm);
  banner.init(mm);
  gallery.init(mm);
  faqHover.init(mm);
  aioLoad.init(mm);
  moduleScrub.init(mm);
  bonuses.init(mm);
  aboutLoad.init(mm);
  timeline.init(mm);
  interests.init(mm);
  footer.init(mm);
  buttons.init(mm);
  glow.init(mm);

  ScrollTrigger.refresh();

  // Nach Bildern/Videos stimmen die Trigger-Positionen endgültig.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

init();
