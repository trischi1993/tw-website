/* ===========================================================================
   ZENTRALE INHALTSQUELLE — tristanweithaler.com (1:1 aus den Webflow-Specs)

   EINE Quelle für beide Konsumenten:
   - src/lib/content/seed.ts        → img() liefert lokale Assets (images.ts)
   - studio/scripts/make-seed.mjs   → img() liefert Sanity-Upload-Referenzen
     (_sanityAsset: 'image@file://…'); außerdem werden dort die eingebetteten
     services/testimonials-Arrays der Sections wieder entfernt (in Sanity
     kommen sie zur Laufzeit per GROQ-Subquery herein).

   Alle Texte WÖRTLICH aus docs/webflow-spec/{home,ueber-mich,all-in-one-
   coaching,global-chrome,legal-layout,content-impressum}.md (Original-
   Doppelleerzeichen leicht normalisiert, Spec-Empfehlung). Alle _key sind
   deterministisch → byte-stabiler Seed.

   `img(path, alt, caption?)` ist ein opaker Callback des Konsumenten; `path`
   ist relativ zu src/assets/images/.
   =========================================================================== */

import servicesData from './data/services.mjs';
import testimonialsData from './data/testimonials.mjs';
import datenschutzBody from './legal/datenschutz-pt.mjs';
import impressumBody from './legal/impressum-pt.mjs';

/* --- Portable-Text-Helfer (deterministische Keys) -------------------------- */

const span = (key, text, marks = []) => ({ _type: 'span', _key: key, text, marks });

const block = (key, children, markDefs = []) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs,
  children,
});

/** Ein Absatz aus reinem Text. */
const rt = (key, text) => [block(`${key}-b`, [span(`${key}-s`, text)])];

/** Mehrere Absätze (ein Block je Absatz — rendert als eigene <p>). */
const rtParas = (key, paras) => paras.map((text, i) => block(`${key}-b${i}`, [span(`${key}-b${i}-s`, text)]));

/** Ein Absatz aus Teilen: String = Text-Span, { text, href } = Link (neuer Tab). */
function para(key, parts) {
  const markDefs = [];
  const children = parts.map((p, i) => {
    if (typeof p === 'string') return span(`${key}-s${i}`, p);
    const defKey = `${key}-l${i}`;
    markDefs.push({ _key: defKey, _type: 'link', href: p.href, newTab: true });
    return span(`${key}-s${i}`, p.text, [defKey]);
  });
  return block(key, children, markDefs);
}

/* --- Konstanten ------------------------------------------------------------ */

const CALENDLY_URL = 'https://calendly.com/tristanweithaler/30min';
const APPLY_LABEL = "Für's Coaching bewerben";

export function buildContent({ img }) {
  /* --- CMS-Collections (Reihenfolge: order asc, null ans Ende, stabil) ----- */
  const byOrder = (a, b) => (a.order ?? 9999) - (b.order ?? 9999);

  const services = [...servicesData].sort(byOrder).map((s) => ({
    id: `service-${s.slug}`,
    slug: s.slug,
    name: s.name,
    formName: s.formName,
    category: s.category,
    description: s.description,
    order: s.order ?? null,
    image: img(s.image, s.name),
  }));

  const testimonials = [...testimonialsData].sort(byOrder).map((t) => ({
    id: `testimonial-${t.slug}`,
    slug: t.slug,
    name: t.name,
    role: t.role || undefined,
    text: t.text,
    order: t.order ?? null,
    image: img(t.image, t.name),
  }));

  /* --- Einstellungen ------------------------------------------------------- */
  const siteSettings = {
    siteName: 'Tristan Weithaler',
    tagline: 'Südtirols erster Social Media Business Coach',
    contact: {
      ownerName: 'Tristan Weithaler',
      addressLines: ['Katharinaberg 50'],
      locality: 'Schnals',
      region: 'Südtirol',
      postalCode: '39020',
      country: 'Italien',
      countryCode: 'IT',
      email: 'info@tristanweithaler.com',
      phone: '+39 334 179 9393',
      phoneHref: 'tel:+393341799393',
    },
    nav: [
      { label: 'Zum E-Book', href: 'https://ebook.tristanweithaler.com/' },
      { label: 'ALL-IN-ONE Coaching', href: '/all-in-one-coaching/' },
      { label: 'Über mich', href: '/ueber-mich/' },
    ],
    legalLinks: [
      { label: 'Impressum', href: '/impressum/' },
      { label: 'Datenschutz', href: '/datenschutz/' },
    ],
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/tristan.weithaler/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tristan-weithaler-1b9972171/' },
    ],
    headerCta: { label: '0 € Angebot', href: '/#0-Euro-Angebot' },
  };

  /* --- Wiederkehrende FAQ-Antworten (Home + AIO teilen Texte) -------------- */
  const faqSuitableAio = (key) =>
    rtParas(key, [
      'Für alle, die Social Media ganzheitlich verstehen und eigenständig erfolgreich aufbauen möchten.',
      'Geeignet für Selbstständige, Unternehmen, Social Media Manager, Influencer und Content Creator sowie für alle, die es noch werden möchten – unabhängig von Branche oder Themengebiet.',
      'Das Programm ist sowohl für Anfänger als auch für Fortgeschrittene geeignet, da die Inhalte Modul für Modul aufeinander aufbauen und der Schwierigkeitsgrad Schritt für Schritt steigt.',
    ]);
  const faqPlatforms = (key) =>
    rtParas(key, [
      'Der Fokus liegt klar auf Instagram, da hier die besten Möglichkeiten für organische Reichweite und nachhaltige Monetarisierung bestehen.',
      'Die vermittelten Strategien und Methoden lassen sich jedoch problemlos auch auf Plattformen wie Facebook, TikTok oder YouTube Shorts übertragen.',
    ]);
  const faqAioCost = (key) =>
    rtParas(key, [
      'Das ALL-IN-ONE Coaching ist ein intensiv begleitetes Premium-Programm.',
      'Die genaue Investition besprechen wir transparent im persönlichen Erstgespräch nach deiner Bewerbung, da wir zunächst prüfen, ob das Programm optimal zu dir oder deinem Unternehmen passt.',
    ]);

  /* =========================================================================
     STARTSEITE
     ========================================================================= */
  const home = {
    seo: {
      title: 'Tristan Weithaler - Südtirols erster Social Media Business Coach',
      description:
        'Ich bin Tristan, Social Media Business Coach mit über 8 Jahren Erfahrung. Ich zeige dir, wie du deine Reichweite, Follower und Kunden organisch steigerst und dein Business strategisch über Social Media aufbaust.',
      image: img('og-home.png', 'Tristan Weithaler - Südtirols erster Social Media Business Coach'),
    },
    sections: [
      {
        _type: 'sectionHomeHero',
        _key: 'hero',
        name: 'Hero',
        headingSmall: 'Südtirols erster',
        headingLarge: 'Social Media Business Coach',
        ctaLabel: 'Coaching anfragen',
        image: img('home-hero.avif', 'Tristan Weithaler vor Südtiroler Bergkulisse'),
      },
      {
        _type: 'sectionValueStatement',
        _key: 'value',
        name: 'Statement',
        text: 'Ich habe Brands mit bis zu 200.000 Followern und über 150 Millionen Views aufgebaut - 100% organisch. Heute zeige ich Menschen und Betrieben, wie sie Social Media gezielt nutzen, um ihre Vision sichtbar zu machen und erfolgreich aufzubauen.',
      },
      {
        _type: 'sectionResults',
        _key: 'results',
        name: 'Zahlen & Fakten',
        title: 'Zahlen & Fakten',
        images: [
          img('results-1.avif', 'Instagram-Statistik: organisches Reichweiten-Wachstum'),
          img('results-2.avif', 'Instagram-Statistik: Follower-Entwicklung'),
          img('results-3.avif', 'Instagram-Statistik: Millionen erreichte Konten'),
          img('results-4.avif', 'Instagram-Statistik: virale Beiträge und Views'),
        ],
      },
      {
        _type: 'sectionSplitCta',
        _key: 'aio-teaser',
        name: 'ALL-IN-ONE Teaser',
        heading: 'ALL-IN-ONE Social Media Coaching',
        body: rtParas('aio-teaser-body', [
          'Das Komplettpaket für Selbständige sowie Unternehmen - 1:1 oder in Teams.',
          'In meinem All-in-One Coaching lernst du Schritt für Schritt alles, von den Social Media Grundlagen über Strategien für mehr Reichweite, Follower und Kunden bis hin zur professionellen Content-Erstellung.',
        ]),
        ctaLabel: 'Mehr erfahren',
        ctaAction: 'link',
        ctaHref: '/all-in-one-coaching/',
        layout: 'glow',
        image: img('aio-mockup.avif', 'Mockup des ALL-IN-ONE Social Media Coachings'),
      },
      {
        _type: 'sectionServicesTabs',
        _key: 'services',
        name: 'Spezifische Coachings',
        heading: 'Spezifische Coachings',
        subtext: 'Individuelle Einzelcoachings für konkrete Themen und Herausforderungen – 1:1 oder in Teams.',
        tabLabelPersonal: 'Für Selbstständige',
        tabLabelBusiness: 'Für Unternehmen',
        limit: 8,
        ctaModalLabel: 'Coaching anfragen',
        calendlyLabel: 'Kostenloses Erstgespräch buchen',
        calendlyUrl: CALENDLY_URL,
        services,
      },
      {
        _type: 'sectionGalleryMarquee',
        _key: 'known-from',
        name: 'Bekannt aus',
        heading: 'Bekannt aus',
        titlesVisible: true,
        ctaLabel: 'Mehr über mich',
        ctaHref: '/ueber-mich/',
        items: [
          { _key: 'zett', title: 'Zett am Sonntag', image: img('presse-zett.avif', 'Presse-Beitrag: Zett am Sonntag') },
          { _key: 'rai', title: 'Rai Sender Bozen', image: img('presse-rai.avif', 'Presse-Beitrag: Rai Sender Bozen') },
          { _key: 'vinschger', title: 'Der Vinschger', image: img('presse-vinschger.avif', 'Presse-Beitrag: Der Vinschger') },
          { _key: 'suedtirol-heute', title: 'Südtirol heute', image: img('presse-suedtirol-heute.avif', 'Presse-Beitrag: Südtirol heute') },
          { _key: 'vinschgerwind', title: 'Vinschgerwind', image: img('presse-vinschgerwind.avif', 'Presse-Beitrag: Vinschgerwind') },
        ],
      },
      {
        _type: 'sectionUspList',
        _key: 'why-me',
        name: 'Warum mit mir',
        heading: 'Warum mit mir zusammenarbeiten',
        items: [
          { _key: 'usp-1', lead: '8 Jahre Erfahrung', text: 'als Social Media Manager, Content Creator, Influencer, Unternehmer und Coach.' },
          { _key: 'usp-2', lead: 'Internationale Kurse', text: 'im Bereich Social Media Marketing, Brand Building und Online-Business absolviert.' },
          { _key: 'usp-3', lead: 'Eigene Marken', text: 'und Projekte erfolgreich über Social Media aufgebaut und individuell monetarisiert.' },
          { _key: 'usp-4', lead: 'Exclusives Insiderwissen', text: 'durch wertvolle Erfahrungen und ein starkes Netzwerk mit Branchenexperten.' },
          { _key: 'usp-5', lead: 'Über 100', text: 'Menschen und Unternehmen im Bereich Social Media und Markenaufbau geholfen.' },
          { _key: 'usp-6', lead: 'Persönliche Betreuung', text: 'jedes Kunden, um höchste Expertise und Qualität in den Coachings sicherzustellen.' },
        ],
      },
      {
        _type: 'sectionTestimonials',
        _key: 'testimonials',
        name: 'Testimonials',
        heading: 'Nette Worte von aktuellen Kunden',
        loadMoreLabel: 'Mehr Testimonials laden',
        initialCount: 3,
        testimonials,
      },
      {
        _type: 'sectionSplitCta',
        _key: 'erfolgs-check',
        name: 'Instagram Erfolgs-Check',
        anchor: '0-Euro-Angebot',
        heading: 'Finde in 5 Min. heraus, wo dein Instagram noch Potenzial liegen lässt.',
        ctaLabel: 'Zum kostenlosen Erfolgs-Check!',
        ctaAction: 'link',
        ctaHref: 'https://freebies.tristanweithaler.com/instagram-erfolgs-check',
        ctaNewTab: true,
        layout: 'plain',
        image: img('erfolgs-check-iphone.webp', 'Instagram Erfolgs-Check auf einem iPhone'),
      },
      {
        _type: 'sectionFaq',
        _key: 'faq',
        name: 'FAQs',
        heading: 'FAQs',
        items: [
          {
            _key: 'faq-1',
            question: 'Was unterscheidet das ALL-IN-ONE Coaching von den spezifischen Coachings?',
            answer: rtParas('h-faq-1', [
              'Das ALL-IN-ONE Coaching ist ein durchdachtes Schritt-für-Schritt Programm mit wertvollen Ressourcen, das dich ganzheitlich von den Grundlagen über Strategien, Erfolgsmessung und Monetarisierung bis hin zur Content-Produktion begleitet. Im Prinzip ist es eine kompakte, praxisorientierte Ausbildung im Bereich Social Media.',
              'Spezifische Coachings sind hingegen stundenbasiert und fokussieren sich gezielt auf einzelne Schwerpunktbereiche.',
            ]),
          },
          {
            _key: 'faq-2',
            question: 'Für wen ist das ALL-IN-ONE Coaching Programm geeignet?',
            answer: faqSuitableAio('h-faq-2'),
          },
          {
            _key: 'faq-3',
            question: 'Für wen sind spezifische Coachings geeignet?',
            answer: rtParas('h-faq-3', [
              'Für alle, die gezielt einzelne Schwerpunktbereiche vertiefen und optimieren möchten und dabei eine flexible, stundenbasierte 1:1 Begleitung bevorzugen.',
              'Geeignet für Selbstständige, Unternehmen, Social Media Manager, Influencer und Content Creator aller Art, sowie für alle, die es noch werden möchten – unabhängig von Branche oder Themengebiet.',
            ]),
          },
          {
            _key: 'faq-4',
            question: 'Behandelst du in deinen Coachings nur Instagram oder auch andere Plattformen?',
            answer: faqPlatforms('h-faq-4'),
          },
          {
            _key: 'faq-5',
            question: 'Behandelst du in deinen Coachings auch bezahlte Werbeanzeigen?',
            answer: rtParas('h-faq-5', [
              'Der Schwerpunkt liegt auf dem organischen Social Media Aufbau, da dies ganz klar mein Expertenbereich ist.',
              'Bezahlte Werbeanzeigen werden ergänzend angesprochen, stehen jedoch nicht im Mittelpunkt der Coachings.',
            ]),
          },
          {
            _key: 'faq-6',
            question: 'Was kostet das ALL-IN-ONE Coaching Programm?',
            answer: faqAioCost('h-faq-6'),
          },
          {
            _key: 'faq-7',
            question: 'Was kosten die spezifischen Coachings?',
            answer: rtParas('h-faq-7', [
              'Die spezifischen Coachings sind stundenbasiert aufgebaut.',
              'Die Investition richtet sich nach den gewünschten Bereichen und dem Umfang und wird transparent im persönlichen Erstgespräch nach deiner Anfrage bzw. Bewerbung besprochen.',
            ]),
          },
          {
            _key: 'faq-8',
            question: 'Wie läuft der Bewerbungsprozess ab?',
            answer: rtParas('h-faq-8', [
              'Du bewirbst dich über das Formular auf der Website.',
              'Ich prüfe deine Bewerbung persönlich und lade dich bei Passung zu einem kostenlosen Erstgespräch per Videocall ein.',
              'In diesem Gespräch finden wir gemeinsam heraus, in welcher Form wir deine Ziele bestmöglich erreichen und zu welchem Zeitpunkt ein Start im Coaching möglich wäre.',
            ]),
          },
        ],
      },
    ],
  };

  /* =========================================================================
     ÜBER MICH
     ========================================================================= */
  const ueberMich = {
    title: 'Über mich',
    slug: 'ueber-mich',
    seo: {
      title: 'Tristan Weithaler - Über mich',
      description:
        'Erfahre mehr über mich, meinen Werdegang und meine Projekte – und wie ich dich dabei unterstütze, deine individuellen Ziele über Social Media zu erreichen.',
      image: img('og-about.jpg', 'Tristan Weithaler Portrait'),
    },
    sections: [
      {
        _type: 'sectionPortraitHero',
        _key: 'hero',
        name: 'Hero',
        heading: 'Hallo! Ich bin Tristan.',
        intro:
          'Ich komme aus einem kleinen Dorf in Südtirol und habe vor einigen Jahren meinen sicheren Bürojob gegen kreative Freiheit eingetauscht – mit dem Ziel, aus dem Hamsterrad auszubrechen, meine eigenen Visionen zu verwirklichen und mir ein freieres Leben aufzubauen. Ohne Studienabschluss, aber mit viel Hands-on-Mentalität und Praxiserfahrung habe ich in den letzten 8 Jahren mehrere erfolgreiche Social-Media-Accounts aufgebaut und mich zu Südtirols erstem Social Media Business Coach entwickelt.',
        image: img('about-hero.avif', 'Tristan Weithaler Portrait'),
        socials: [
          { _key: 'ig', platform: 'instagram', href: 'https://www.instagram.com/tristan.weithaler/' },
          { _key: 'li', platform: 'linkedin', href: 'https://www.linkedin.com/in/tristan-weithaler-1b9972171/' },
        ],
      },
      {
        _type: 'sectionTimeline',
        _key: 'timeline',
        name: 'Werdegang',
        heading: 'Über mich und meinen beruflichen Werdegang…',
        items: [
          {
            _key: 'tl-1993',
            year: '1993',
            title: 'Meine Wurzeln',
            description: [
              para('tl-1993-d', [
                'Aufgewachsen in einem kleinen Kuhdorf in den Südtiroler Bergen, verbrachte ich ab meinem 8. Lebensjahr die Sommerferien auf einem Bauernhof. Dort hütete ich Kühe, packte bei der Arbeit mit an und lernte früh, Verantwortung zu übernehmen.',
              ]),
            ],
            image: img('timeline-1993.avif', 'Tristan als Kind mit einer Kuh auf dem Bauernhof'),
          },
          {
            _key: 'tl-2013',
            year: '2013',
            title: 'Schule & Karriere',
            description: [
              para('tl-2013-d', [
                'Nach der Matura in Wirtschaft und Touristik begann ich bei einer international tätigen Ladenbaufirma zu arbeiten. Dort leitete ich sieben Jahre lang den Projekteinkauf für Apple und sammelte wertvolle Erfahrungen in verschiedensten Bereichen.',
              ]),
            ],
            image: img('timeline-2013.avif', 'Tristan als Projekteinkäufer für Apple'),
          },
          {
            _key: 'tl-2017',
            year: '2017',
            title: 'Der Anfang\nauf Social Media',
            description: [
              para('tl-2017-d', [
                'Parallel zu meinem Job absolvierte ich die Fitnesstrainer-Ausbildung in München und entdeckte erstmals das Potenzial von Social Media. Ich fing an zu posten, um meine Leidenschaft sichtbar zu machen und daraus meinen Beruf als Fitnesscoach aufzubauen.',
              ]),
            ],
            image: img('timeline-2017.avif', 'Tristan zu Beginn seiner Social-Media-Zeit als Fitnesscoach'),
          },
          {
            _key: 'tl-2018',
            year: '2018',
            title: 'Meine erste Marke',
            description: [
              para('tl-2018-d', [
                'Als jüngster Sohn unseres Familienbetriebs, der Konditorei Weithaler, gründete ich „Gsund und Guat". Die Idee verband Tradition mit Innovation und führte zu pflanzlichen Müsliriegeln, die heute in Geschäften, Hotels und online erhältlich sind: ',
                { text: 'www.gsundundguat.it', href: 'https://www.gsundundguat.it' },
              ]),
            ],
            image: img('timeline-2018.avif', 'Gsund und Guat Müsliriegel der Konditorei Weithaler'),
          },
          {
            _key: 'tl-2020',
            year: '2020',
            title: 'Social Media Manager',
            titleSmall: true,
            description: [
              para('tl-2020-d', [
                'Die Erkenntnis, welch wertvolles Werkzeug Social Media heute ist, motivierte mich dazu, Social-Media-Auftritte auch für andere aufzubauen. Durch Ausbildungen und praktische Erfahrungen entwickelte ich Strategien und Content-Skills, die sich bei all meinen Kunden bewährten.',
              ]),
            ],
            image: img('timeline-2020.avif', 'Tristan bei der Arbeit als Social Media Manager'),
          },
          {
            _key: 'tl-2021',
            year: '2021',
            title: '200.000 Follower',
            description: [
              para('tl-2021-d', [
                'Ich baute einen der größten und erfolgreichsten Instagram-Accounts in Südtirol auf – „Southtyrolian" mit 200.000 Followern. Die Vision war es, die Wirtschaft und den Tourismus in der Region positiv zu beeinflussen. Ende 2023 zog ich mich aus dem Projekt zurück.',
              ]),
            ],
            image: img('timeline-2021.avif', 'Die Drei Zinnen in Südtirol, Motiv des Accounts Southtyrolian'),
          },
          {
            _key: 'tl-2022',
            year: '2022',
            title: '120.000 Follower',
            titleSmall: true,
            description: [
              para('tl-2022-d', [
                'Gemeinsam mit meiner Freundin führe ich einen der größten Instagram-Accounts für achtsame Unterkünfte - „Mindful Stays" mit 120.000 Followern. Unsere Vision: besondere Unterkünfte sichtbarer machen und bewusstes Reisen fördern: ',
                { text: 'www.mindful-stays.com', href: 'https://www.mindful-stays.com' },
              ]),
            ],
            image: img('timeline-2022.avif', 'Mindful Stays, Instagram-Account für achtsame Unterkünfte'),
          },
          {
            _key: 'tl-2024',
            year: '2024',
            title: 'Social Media\nBusiness Coach',
            titleSmall: true,
            description: [
              para('tl-2024-d', [
                'Als Südtirols erster Social Media Business Coach teile ich heute mein Wissen und meine Erfahrungen in Form von Coachings. Dabei unterstütze ich Selbständige und Betriebe, ihre Visionen und Ziele erfolgreich über Social Media aufzubauen.',
              ]),
            ],
            image: img('timeline-2024.avif', 'Tristan Weithaler als Social Media Business Coach'),
          },
          {
            _key: 'tl-2025',
            year: '2025',
            title: 'Die Instagram\nErfolgsformel',
            titleSmall: true,
            description: [
              para('tl-2025-d', [
                'Da ich nicht alle persönlich coachen kann, schrieb ich mein E-Book „Die Instagram Erfolgsformel". Es ist kompakt, leicht verständlich und für jeden leistbar – eine klare Anleitung für alle, die mit Instagram etwas erreichen wollen: ',
                { text: 'ebook.tristanweithaler.com', href: 'https://ebook.tristanweithaler.com/' },
              ]),
            ],
            image: img('timeline-2025.avif', 'E-Book „Die Instagram Erfolgsformel" von Tristan Weithaler'),
          },
        ],
      },
      {
        _type: 'sectionInterests',
        _key: 'interests',
        name: 'Interessen',
        heading: 'Falls ich dich noch nicht gelangweilt habe, erzähle ich dir gerne, was ich sonst noch so mag',
        introLine: 'Ich verbringe die meiste Zeit mit diesen beiden Dingen:',
        highlights: [
          {
            _key: 'reisen',
            icon: 'reisen',
            title: 'Reisen',
            text: 'Ich liebe es, neue Orte und Kulturen zu entdecken und meinen Horizont zu erweitern.',
          },
          {
            _key: 'weiterbildung',
            icon: 'weiterbildung',
            title: 'Weiterbildung',
            text: 'Ich lebe nach den beiden Mottos: „Man lernt nie aus“ und „Übung macht den Meister“.',
          },
        ],
        marquee1: ['Fitness', 'Startups', 'Freunde', 'Reisen', 'Vegetarismus', 'Spiritualität', 'Business', 'Netzwerken'],
        marquee2: ['Qi Gong', 'Querdenken', 'Wandern', 'Spiritualität', 'Lesen', 'Zeichnen', 'Nachhaltigkeit'],
      },
      {
        _type: 'sectionFinalCta',
        _key: 'final-cta',
        name: 'Abschluss-CTA',
        heading: 'Genug von mir. Jetzt bist du dran',
        text: 'Erzähl mir von dir, deinen Zielen und Visionen. Vielleicht kann ich dir schon bald dabei helfen, sie groß zu machen!',
        ctaLabel: 'Kostenloses Erstgespräch buchen',
        ctaAction: 'link',
        ctaHref: CALENDLY_URL,
        ctaNewTab: true,
      },
    ],
  };

  /* =========================================================================
     ALL-IN-ONE COACHING
     ========================================================================= */

  /** Ein Modul-Abschnitt (Muster A+B der Spec in EINER Section). */
  const modul = (n, data) => ({
    _type: 'sectionModule',
    _key: `modul-${n}`,
    name: `Modul ${n}`,
    titleRowText: 'Modul',
    number: `0${n}`,
    bannerWord: data.bannerWord,
    heading: data.heading,
    bullets: data.bullets,
    image: img(`modul-${n}.avif`, data.imageAlt),
    ...(data.imageWide ? { imageWide: true } : {}),
    coachingHeading: '1:1 Coaching',
    coachingText: data.coachingText,
    videoSrc: `/videos/modul${n}.mp4`,
    videoPoster: `/videos/modul${n}-poster.jpg`,
  });

  const allInOne = {
    title: 'ALL-IN-ONE Coaching',
    slug: 'all-in-one-coaching',
    seo: {
      title: 'ALL-IN-ONE Social Media Coaching | Tristan Weithaler',
      description:
        'Mein ALL-IN-ONE Social Media Coaching ist das Komplettpaket für Selbständige und Unternehmen. Dort lernst du die Grundlagen von Social Media, klare Strategien für mehr Reichweite, Follower und Kunden sowie professionelle Content-Erstellung für nachhaltiges Wachstum.',
      image: img('og-aio.avif', 'ALL-IN-ONE Social Media Coaching mit Tristan Weithaler'),
    },
    sections: [
      {
        _type: 'sectionVideoHero',
        _key: 'hero',
        name: 'Hero',
        heading: 'ALL-IN-ONE Social Media Coaching',
        intro: rtParas('aio-hero-intro', [
          'Das Komplettpaket für Selbstständige und Unternehmen - 1:1 oder im Team.',
          'Das All-in-One Coaching ist ein ausgeklügeltes Programm aus Videolektionen und persönlicher 1:1 Begleitung.',
          'Schritt für Schritt wirst du durch den gesamten Prozess geführt, von den Grundlagen über Strategien für Reichweite, Follower und Kunden bis hin zur professionellen Content-Erstellung.',
          'Damit lernst du, deine Social Media Präsenz eigenständig und unabhängig erfolgreich aufzubauen.',
        ]),
        ctaLabel: APPLY_LABEL,
        vimeoId: '1164742630',
        mockupImage: img('aio-iphone-mockup.avif', 'iPhone-Rahmen um das Coaching-Video'),
        posterImage: img('og-aio.avif', 'Vorschaubild: ALL-IN-ONE Social Media Coaching'),
      },
      {
        _type: 'sectionGalleryMarquee',
        _key: 'pillars',
        name: 'ALL-IN-ONE Säulen',
        heading: 'ALL-IN-ONE',
        items: [
          { _key: 'videolektionen', title: 'Videolektionen', image: img('pillar-videolektionen.avif', 'Mockup der Videolektionen') },
          { _key: 'coaching', title: '1:1 Coaching', image: img('pillar-coaching.avif', 'Mockup des 1:1 Coachings') },
          { _key: 'praxis', title: 'Praxis vor Ort', image: img('pillar-praxis.avif', 'Mockup der Praxis-Session vor Ort') },
          { _key: 'workbook', title: 'Workbook', image: img('pillar-workbook.avif', 'Mockup des Workbooks') },
          { _key: 'ki-assistent', title: 'KI Assistent', image: img('pillar-ki-assistent.avif', 'Mockup des KI-Assistenten') },
          { _key: 'extras', title: 'Extras', image: img('pillar-extras.avif', 'Mockup der Extras') },
        ],
      },
      modul(1, {
        bannerWord: 'Videolektionen',
        heading: 'SOCIAL MEDIA FUNDAMENT',
        bullets: [
          'Werte, Vision & Mindset',
          'Social Media Ziele definieren',
          'Zielgruppenanalyse & Positionierung',
          'Account Einstellungen & Optimierung',
          'Corporate Identity & Branding',
          'Social Media Tools & Apps',
        ],
        imageAlt: 'Modul 1: Social Media Fundament',
        coachingText:
          'Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären, deine Positionierung reflektieren und ein stabiles Fundament schaffen.',
      }),
      modul(2, {
        bannerWord: 'Videolektionen',
        heading: 'SOCIAL MEDIA STRATEGIEN',
        bullets: [
          'Den Algorithmus verstehen lernen',
          'Nischen-Research & Trendanalyse',
          'Aufbau: Content-Funnel Strategie',
          'Erfolgsfaktoren viraler Postings',
          'Authentisches Storytelling',
          'Community Management',
        ],
        imageAlt: 'Modul 2: Social Media Strategien',
        coachingText:
          'Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären, deine Strategie schärfen und ich gezieltes Feedback für die Umsetzung gebe.',
      }),
      modul(3, {
        bannerWord: 'Videolektionen',
        heading: 'ERFOLGSMESSUNG & OPTIMIERUNG',
        bullets: [
          'Account Insights lesen lernen',
          'KPIs (Kennzahlen) interpretieren',
          'Erfolgsmuster identifizieren',
          'Postings analysieren',
          'Strategie optimieren',
        ],
        imageAlt: 'Modul 3: Social Media Erfolgsmessung & Optimierung',
        coachingText:
          'Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären, deine Ergebnisse analysieren und deine Strategie gezielt optimieren.',
      }),
      modul(4, {
        bannerWord: 'Videolektionen',
        heading: 'MONETARISIERUNG & FALLSTUDIEN',
        bullets: [
          'Monetarisierungsmöglichkeiten',
          'Aufbau: Monetarisierungs-Funnel',
          'Kundengewinnungsprozess',
          'Die 10K/Monat-Formel',
          'Fallstudien meiner Projekte',
        ],
        imageAlt: 'Modul 4: Social Media Monetarisierung & Fallstudien',
        coachingText:
          'Nach diesem Modul folgt ein zweistündiger 1:1 Videocall, in dem wir offene Fragen klären und dein Angebot sowie die Monetarisierung gezielt feinjustiert werden.',
      }),
      modul(5, {
        bannerWord: 'Praxis vor Ort',
        heading: 'CONTENT PRODUKTION',
        bullets: [
          'Optimale Handy-Einstellungen',
          'Körperhaltung für Content Produktion',
          'Gemeinsame Content Produktion',
          'Videoschnitt & Bearbeitung',
          'Post-Beschreibung verfassen',
          'Finale Einstellungen fürs Posting',
        ],
        imageAlt: 'Modul 5: Content Produktion vor Ort',
        imageWide: true,
        coachingText:
          'Dieses Modul ist ein praktisches 1:1 Coaching vor Ort (ca. 4 Stunden), in dem ich dir zeige, wie du hochwertigen Content einfach mit dem Handy produzierst und bearbeitest.',
      }),
      {
        _type: 'sectionBonuses',
        _key: 'bonuses',
        name: 'Bonusse',
        heading: 'Deine Bonusse',
        intro: 'Wertvolle Ressourcen unterstützen dich bei der Umsetzung der jeweiligen Module',
        cards: [
          {
            _key: 'bonus-1',
            tag: 'Bonus 1',
            title: 'Workbook',
            text: 'Ein strukturiertes Workbook mit Aufgaben und Leitfragen, um alle Inhalte direkt auf dein eigenes Projekt anzuwenden.',
            image: img('bonus-workbook.avif', 'Bonus: strukturiertes Workbook'),
          },
          {
            _key: 'bonus-2',
            tag: 'Bonus 2',
            title: 'KI-Assistent',
            text: 'Dein persönlicher KI-Assistent, trainiert auf meiner Wissensbasis, der dir bei Fragen und Aufgaben jederzeit weiterhilft.',
            image: img('bonus-ki-assistent.avif', 'Bonus: persönlicher KI-Assistent'),
          },
          {
            _key: 'bonus-3',
            tag: 'Bonus 3',
            title: 'Weitere Extras',
            text: 'Zusätzliche Vorlagen, Guides und Ressourcen, die dich bei Content, Struktur und Umsetzung im Alltag unterstützen.',
            image: img('bonus-extras.avif', 'Bonus: weitere Vorlagen und Extras'),
          },
        ],
        ctaLabel: APPLY_LABEL,
      },
      {
        _type: 'sectionModule',
        _key: 'resultate',
        name: 'Deine Resultate',
        titleRowText: 'Deine Resultate',
        bannerWord: 'Resultate',
        bannerGold: true,
        heading: 'Nach dem Coaching-Programm wirst du...',
        bullets: [
          'Die Social-Media-Grundlagen sicher beherrschen.',
          'Deine Zielgruppe kennen und gezielt ansprechen.',
          'Strategien für Reichweite, Follower und Kunden umsetzen.',
          'Daten richtig analysieren und zur Optimierung nutzen.',
          'Wissen, wie man über Social Media Geld verdient.',
          'Hochwertigen, leistungsstarken Content erstellen.',
        ],
        bulletsNowrap: true,
        image: img('aio-resultate.avif', 'Deine Resultate nach dem Coaching-Programm'),
        imageWide: true,
      },
      {
        _type: 'sectionUspList',
        _key: 'besondere',
        name: 'Das Besondere',
        heading: 'Das Besondere an diesem Coaching-Programm',
        items: [
          {
            _key: 'usp-1',
            lead: 'Ein Jahr Zugang',
            text: 'zum Online-Portal mit allen Modulen, über 40 Videolektionen und Ressourcen in deinem eigenen Lerntempo.',
          },
          {
            _key: 'usp-2',
            lead: 'Strukturiertes Schritt-für-Schritt Programm',
            text: 'vom Fundament bis zur Monetarisierung deiner Social-Media-Präsenz.',
          },
          {
            _key: 'usp-3',
            lead: 'Persönliche 1:1 Coachings',
            text: 'nach jedem Modul ergänzt durch eine Praxis-Session vor Ort für maximale individuelle Betreuung.',
          },
          {
            _key: 'usp-4',
            lead: 'Integrierter KI-Assistent,',
            text: 'trainiert auf meiner Wissensbasis, der dir 24/7 bei Fragen und Workbook-Aufgaben zur Verfügung steht.',
          },
          {
            _key: 'usp-5',
            lead: 'Exklusives Insider-Wissen',
            text: 'aus über acht Jahren praktischer Erfahrung im Aufbau erfolgreicher Social Media Accounts.',
          },
          {
            _key: 'usp-6',
            lead: 'Stetige Updates und neue Inhalte',
            text: 'erweitern das Online-Portal kontinuierlich und sind während deines Zugangs vollständig inklusive.',
          },
        ],
      },
      {
        _type: 'sectionTestimonials',
        _key: 'testimonials',
        name: 'Testimonials',
        heading: 'Nette Worte von aktuellen Kunden',
        loadMoreLabel: 'Mehr Testimonials laden',
        initialCount: 3,
        testimonials,
      },
      {
        _type: 'sectionFinalCta',
        _key: 'final-cta',
        name: 'Abschluss-CTA',
        heading: 'Investiere in dich und deine Vision und bewirb dich jetzt (limitierte Plätze)',
        text: 'Hinweis: Solltest du während oder nach dem ALL-IN-ONE Coaching Programm zusätzlichen Bedarf an individueller Begleitung haben, können weitere 1:1 Coachings jederzeit flexibel hinzugebucht werden.',
        ctaLabel: APPLY_LABEL,
        ctaAction: 'modal-aio',
      },
      {
        _type: 'sectionFaq',
        _key: 'faq',
        name: 'FAQs',
        heading: 'FAQs',
        items: [
          {
            _key: 'faq-1',
            question: 'Für wen ist das ALL-IN-ONE Coaching Programm geeignet?',
            answer: faqSuitableAio('a-faq-1'),
          },
          {
            _key: 'faq-2',
            question: 'Ist das ALL-IN-ONE Coaching ein Gruppenprogramm oder komplett 1:1?',
            answer: rtParas('a-faq-2', [
              'Das ALL-IN-ONE Coaching ist kein Gruppenprogramm, sondern eine exklusive und tiefgehende 1:1 Begleitung. Du erhältst meine volle Aufmerksamkeit und individuelles Feedback statt standardisierter Gruppen-Calls. Genau das ist einer der größten Vorteile gegenüber klassischen Programmen.',
              'Unternehmen können das Programm optional gemeinsam im Team absolvieren.',
            ]),
          },
          {
            _key: 'faq-3',
            question: 'Wie lange habe ich Zugang zum ALL-IN-ONE Coaching Programm?',
            answer: rtParas('a-faq-3', [
              'Du erhältst ein Jahr Zugang zum gesamten Programm inklusive aller Ressourcen wie dem KI-Assistenten.',
              'Alle Videolektionen und Workbook-Aufgaben kannst du somit in deinem eigenen Tempo durcharbeiten und die 1:1 Coachings flexibel nach jedem Modul vereinbaren.',
              'Während dieses Zeitraums stehen dir zudem alle Updates und neu hinzukommenden Inhalte ohne zusätzliche Kosten zur Verfügung.',
            ]),
          },
          {
            _key: 'faq-4',
            question: 'Kann ich während oder nach dem Programm weitere 1:1 Coachings dazubuchen?',
            answer: rtParas('a-faq-4', [
              'Ja. Im ALL-IN-ONE Coaching Programm sind insgesamt 4 × 2 Stunden 1:1 Videocoachings sowie 1 × Praxis-Session vor Ort (ca. 4 Stunden) bereits inklusive.',
              'Bei Bedarf können jederzeit weitere 1:1 Coachings während oder nach dem Programm flexibel hinzugebucht werden. Diese zusätzlichen Sessions werden separat berechnet.',
            ]),
          },
          {
            _key: 'faq-5',
            question: 'Behandelst du im Programm nur Instagram oder auch andere Plattformen?',
            answer: faqPlatforms('a-faq-5'),
          },
          {
            _key: 'faq-6',
            question: 'Behandelst du im Programm auch bezahlte Werbeanzeigen?',
            answer: rtParas('a-faq-6', [
              'Der Schwerpunkt liegt auf dem organischen Social Media Aufbau, da dies ganz klar mein Expertenbereich ist.',
              'Bezahlte Werbeanzeigen werden ergänzend angesprochen, stehen jedoch nicht im Mittelpunkt des Programms.',
            ]),
          },
          {
            _key: 'faq-7',
            question: 'Was kostet das ALL-IN-ONE Coaching Programm?',
            answer: faqAioCost('a-faq-7'),
          },
          {
            _key: 'faq-8',
            question: 'Wie läuft der Bewerbungsprozess ab?',
            answer: rtParas('a-faq-8', [
              'Du bewirbst dich über das Formular auf der Website.',
              'Ich prüfe deine Bewerbung persönlich und lade dich bei Passung zu einem kostenlosen Erstgespräch per Videocall ein.',
              'In diesem Gespräch finden wir gemeinsam heraus, ob das ALL-IN-ONE Coaching Programm optimal zu dir oder deinem Unternehmen passt und ab wann freie Plätze verfügbar sind.',
            ]),
          },
        ],
      },
    ],
  };

  /* =========================================================================
     RECHTSSEITEN
     ========================================================================= */
  const legalPage = (slug, title, description, body) => ({
    title,
    slug,
    seo: { title, description, noindex: true },
    sections: [
      {
        _type: 'sectionPageHeader',
        _key: 'head',
        name: 'Seitenkopf',
        heading: title,
        meta: 'Aktualisierungs-Datum: 01. September, 2024',
      },
      { _type: 'sectionRichText', _key: 'body', name: 'Rechtstext', body },
    ],
  });

  const pages = [
    ueberMich,
    allInOne,
    legalPage(
      'datenschutz',
      'Datenschutz',
      'Datenschutzerklärung von Tristan Weithaler, Südtirols erstem Social Media Business Coach.',
      datenschutzBody,
    ),
    legalPage(
      'impressum',
      'Impressum',
      'Impressum von Tristan Weithaler, Südtirols erstem Social Media Business Coach.',
      impressumBody,
    ),
  ];

  return { siteSettings, home, pages, services, testimonials };
}
