/* ===========================================================================
   ZENTRALE INHALTSQUELLE — E-Book-Landingpage

   EINE Quelle für beide Konsumenten:
   - src/lib/content/ebook-seed.ts       → lokale Astro-Bilder als Fallback
   - studio/scripts/make-ebook-seed.mjs  → Sanity-Upload-Referenzen

   Das Layout bleibt bewusst fest im Astro-Component. Sanity verwaltet Texte,
   Bilder, Reihenfolgen, Preis-/Produktangaben und FAQs, ohne kritische
   Checkout- oder Domainpfade editierbar zu machen.
   =========================================================================== */

const span = (key, text) => ({ _type: 'span', _key: key, text, marks: [] });

const block = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [span(`${key}-text`, text)],
});

const richParagraphs = (key, paragraphs) =>
  paragraphs.map((paragraph, index) => block(`${key}-${index + 1}`, paragraph));

export function buildEbookContent({ img }) {
  return {
    seo: {
      title: 'Die Instagram Erfolgsformel – E-Book',
      description:
        'Lerne mit erprobten Strategien und echter Praxiserfahrung, wie du deinen Instagram-Account erfolgreich und nachhaltig aufbaust – inklusive exklusiver Boni.',
      image: img('ebook/og.png', 'Die Instagram Erfolgsformel – E-Book von Tristan Weithaler'),
    },
    product: {
      name: 'Die Instagram Erfolgsformel',
      pageCount: 140,
      chapterCount: '11 + 1',
      bonusCount: 2,
      price: 27,
      priceCurrency: 'EUR',
      totalValue: '>280 €',
    },
    hero: {
      eyebrow: 'Social Media mit System',
      title: 'Die Instagram',
      titleHighlight: 'Erfolgsformel',
      lead: 'Für mehr Reichweite, Follower & Umsatz.',
      text:
        'Deine kompakte Anleitung aus 8+ Jahren Praxis und der Erfahrung aus dem Aufbau von Accounts mit bis zu 200.000 Followern.',
      ctaLabel: 'Jetzt E-Book sichern',
      pricePrefix: 'Gesamtwert >280 €',
      priceText: 'aktuell für nur 27 €',
      stampText: 'E-Book\n+ Boni',
      image: img(
        'ebook/hero-v5.png',
        'Die Instagram Erfolgsformel mit E-Book, Smartphone und Beispielseiten',
      ),
      phoneImage: img(
        'ebook/hero-phone-insights-gold.png',
        'Instagram-Insights auf dem Smartphone',
      ),
    },
    press: {
      heading: 'Bekannt aus:',
      items: [
        {
          _key: 'vinschgerwind',
          image: img('ebook/press-vinschgerwind-transparent.png', 'Vinschgerwind'),
        },
        {
          _key: 'suedtirol-heute',
          image: img('ebook/press-suedtirol-heute-transparent.png', 'Südtirol Heute'),
        },
        {
          _key: 'radio-suedtirol',
          image: img('ebook/press-radio-suedtirol-1-transparent.png', 'Radio Südtirol 1'),
        },
        {
          _key: 'der-vinschger',
          image: img('ebook/press-der-vinschger-transparent.png', 'Der Vinschger'),
        },
        {
          _key: 'zett',
          image: img('ebook/press-zett-am-sonntag-transparent.png', 'Zett am Sonntag'),
        },
        {
          _key: 'rai-suedtirol',
          image: img('ebook/press-rai-suedtirol-transparent.png', 'Rai Südtirol'),
        },
      ],
    },
    intro: {
      kicker: 'Wachstum beginnt mit Klarheit',
      heading:
        'Du brauchst keine 100.000 Follower, um über Social Media etwas zu bewegen.',
      headingHighlight: 'Du brauchst eine klare Strategie.',
      text:
        'Dieses E-Book verbindet echte Erfahrungen mit konkreten Schritten. So verstehst du, was hinter nachhaltigem Wachstum steckt und weißt endlich, was als Nächstes zu tun ist.',
    },
    benefits: {
      kicker: 'Das erwartet dich',
      heading: 'Praxiswissen, das du direkt anwenden kannst.',
      intro: 'Kein Theorie-Marathon, sondern ein klarer Leitfaden für deinen Social-Media-Aufbau.',
      items: [
        {
          _key: 'insights',
          icon: 'insights',
          title: 'Exklusive Einblicke',
          text: 'Praxisbeispiele aus 8+ Jahren Social Media – ehrlich, verständlich und auf den Punkt gebracht.',
        },
        {
          _key: 'strategy',
          icon: 'strategy',
          title: 'Nachhaltige Strategien',
          text: 'Bewährte Methoden für organische Reichweite, echte Follower und eine langfristige Monetarisierung.',
        },
        {
          _key: 'steps',
          icon: 'steps',
          title: 'Step-by-Step-Guide',
          text: 'Ein klarer Weg von deiner Vision und Positionierung bis zu Community, Erfolgsmessung und Umsatz.',
        },
        {
          _key: 'learnings',
          icon: 'learnings',
          title: 'Meine größten Learnings',
          text: 'Die Fehler und Erkenntnisse, die dir Umwege ersparen und dich schneller ins konsequente Umsetzen bringen.',
        },
      ],
      note: '140 Seiten Praxiswissen – kompakt, verständlich und direkt umsetzbar.',
      ctaLabel: 'Praxiswissen holen',
    },
    author: {
      kicker: 'Kurz zu mir, dem Autor',
      heading: 'Hi, ich bin Tristan.',
      image: img('ebook/author.jpg', 'Tristan Weithaler, Autor der Instagram Erfolgsformel'),
      caption: 'Social Media Business Coach',
      captionHighlight: 'mit Herz & Hands-on-Mentalität.',
      paragraphs: [
        'Ich komme aus einem kleinen Dorf in Südtirol und habe meinen sicheren Bürojob gegen kreative Freiheit getauscht – mit dem Ziel, eigene Visionen zu verwirklichen.',
        'Ohne Studienabschluss, aber mit viel Praxiserfahrung, Neugier und Leidenschaft habe ich mich zum Social-Media-Unternehmer entwickelt. Mit meinen Projekten und Marken habe ich über 200.000 Follower aufgebaut und mehr als 150 Millionen Views generiert.',
        'Die Strategien, Fehler und Learnings aus diesem Weg teile ich in meinem E-Book: praxisnah, ehrlich und direkt umsetzbar.',
      ],
      stats: [
        { _key: 'experience', value: 8, suffix: '+', label: 'Jahre Erfahrung' },
        { _key: 'followers', value: 200, suffix: 'K+', label: 'Follower aufgebaut' },
        { _key: 'views', value: 150, suffix: 'M+', label: 'organische Views' },
      ],
    },
    chapters: {
      kicker: 'E-Book-Inhalt',
      heading: 'Von deiner Vision bis zur Monetarisierung.',
      intro:
        '11 aufeinander aufbauende Kapitel und ein Bonuskapitel führen dich Schritt für Schritt durch die wichtigsten Bereiche einer erfolgreichen Social-Media-Marke.',
      image: img(
        'ebook/chapters.png',
        'Auswahl verschiedener Seiten aus der Instagram Erfolgsformel',
      ),
      phoneImage: img(
        'ebook/hero-phone-insights-gold.png',
        'Instagram-Insights auf dem Smartphone',
      ),
      items: [
        { _key: 'vision', number: '01', title: 'Deine Vision', text: 'Das Fundament für deinen Erfolg' },
        { _key: 'positioning', number: '02', title: 'Zielgruppe & Positionierung', text: 'Erreiche dein Wunschpublikum' },
        { _key: 'branding', number: '03', title: 'Social Media Branding', text: 'So bleibt deine Marke im Kopf' },
        { _key: 'strategies', number: '04', title: 'Social Media Strategien', text: 'Mit System statt Zufall' },
        { _key: 'consistency', number: '05', title: 'Kontinuität', text: 'Der Schlüssel zu nachhaltigem Wachstum' },
        { _key: 'trends', number: '06', title: 'Social Media Trends', text: 'Erkennen und richtig nutzen' },
        { _key: 'measurement', number: '07', title: 'Erfolgsmessung', text: 'Daten analysieren und optimieren' },
        { _key: 'stories', number: '08', title: 'Stories', text: 'Erzähle Geschichten, die bewegen' },
        { _key: 'brandface', number: '09', title: 'BrandFace', text: 'Mehr Authentizität, Vertrauen und Engagement' },
        { _key: 'community', number: '10', title: 'Community', text: 'Echte Verbindungen und loyale Follower' },
        { _key: 'monetization', number: '11', title: 'Monetarisierung', text: 'So wird deine Reichweite zu Umsatz' },
        { _key: 'mistakes', number: 'Bonus', title: 'Meine größten Fehler', text: 'Und wie du sie vermeidest' },
      ],
      note: 'Dein klarer Fahrplan von der ersten Idee bis zur Monetarisierung.',
      ctaLabel: 'Mit dem E-Book loslegen',
    },
    evergreen: {
      carouselLabel: 'Echte Instagram-Ergebnisse aus der Praxis',
      carouselMeta: 'Echte Instagram-Insights',
      results: [
        {
          _key: 'reach',
          image: img(
            'ebook/result-insight-1.png',
            'Instagram-Ergebnis: über 15 Millionen erreichte Konten in 30 Tagen',
          ),
        },
        {
          _key: 'profile',
          image: img(
            'ebook/result-insight-5.png',
            'Instagram-Ergebnis: 61.137 Profilaktivitäten und 1.096 Klicks auf den externen Link',
          ),
        },
        {
          _key: 'reel',
          image: img(
            'ebook/result-insight-2.png',
            'Instagram-Ergebnis: über 10 Millionen Aufrufe für ein Reel',
          ),
        },
        {
          _key: 'followers',
          image: img(
            'ebook/result-insight-3.png',
            'Instagram-Ergebnis: 138.208 Follower und starkes organisches Wachstum',
          ),
        },
        {
          _key: 'insight',
          image: img(
            'ebook/result-insight-4.png',
            'Instagram-Insight mit einem erfolgreichen Social-Media-Ergebnis',
          ),
        },
        {
          _key: 'community',
          image: img(
            'ebook/result-insight-6.png',
            'Instagram-Reel-Ergebnis: 1.766.701 Aufrufe, 838.627 erreichte Konten und 99,9 Prozent Nicht-Follower',
          ),
        },
        {
          _key: 'mindful-stays',
          image: img(
            'ebook/result-insight-7.png',
            'Instagram-Ergebnis von Mindful Stays: 19 Millionen Reel-Aufrufe, 588.862 Likes und 10.592 gespeicherte Beiträge',
          ),
        },
        {
          _key: 'mindful-stays-profile',
          image: img(
            'results-5.avif',
            'Instagram-Profil Mindful Stays mit 115.000 Followern und millionenfach angesehenen Reels',
          ),
        },
      ],
      kicker: 'Wissen mit Bestand',
      heading: 'Nicht noch so ein 0815-Social-Media-Buch.',
      text:
        'Social Media verändert sich rasant. Deshalb konzentriert sich dieses Buch auf Evergreen-Strategien, die unabhängig von kurzfristigen Trends oder einzelnen Algorithmus-Updates funktionieren. Die Methoden haben sich über Jahre in der Praxis bewährt – für nachhaltiges Wachstum, statt jedem neuen Hype hinterherzulaufen. Auch wenn die konkreten Beispiele aus Instagram stammen, lassen sich die grundlegenden Strategien auch auf andere Social-Media-Plattformen übertragen.',
    },
    bundle: {
      kicker: 'Das Komplettpaket',
      heading: 'Alles, was du für die Umsetzung brauchst.',
      intro: 'Zum E-Book bekommst du zwei praktische Extras ohne Aufpreis dazu.',
      items: [
        {
          _key: 'ebook',
          eyebrow: 'Das E-Book',
          title: 'Die Instagram Erfolgsformel',
          text: '140 Seiten mit 11 Kapiteln, Bonuskapitel, Praxisbeispielen und direkt umsetzbaren Strategien.',
          value: '160 €',
          price: '27 €',
          image: img('ebook/book-mockup-v3.png', 'Das Buch Die Instagram Erfolgsformel'),
        },
        {
          _key: 'bio-creator',
          eyebrow: 'Bonus 01',
          title: 'Insta BIO Creator',
          text: 'Ein vorbereiteter ChatGPT-Prompt, mit dem du Schritt für Schritt deine perfekte Instagram-Bio erarbeitest.',
          value: '20 €',
          price: 'inklusive',
          image: img('ebook/insta-bio-creator-v2.png', 'Insta BIO Creator Bonus zum E-Book'),
        },
        {
          _key: 'downloads',
          eyebrow: 'Bonus 02',
          title: 'Bonus-Downloads',
          text: 'Zusätzliche ChatGPT-Prompts, hilfreiche Tools, Content-Tipps und weitere praktische Vorlagen.',
          value: '>100 €',
          price: 'inklusive',
          image: img(
            'ebook/bonus-downloads-v2.png',
            'Bonus-Downloads mit Prompts, Tools und Content-Tipps',
          ),
        },
      ],
      totalLabel: 'Dein Gesamtwert',
      totalValue: '>280 €',
      priceLabel: 'Deine Investition',
      price: '27 €',
      ctaLabel: 'Komplettpaket auswählen',
    },
    audience: {
      kicker: 'Für wen ist es geeignet?',
      heading: 'Für alle, die mit Social Media mehr erreichen wollen.',
      items: [
        {
          _key: 'self-employed',
          title: 'Selbstständige',
          text: 'Mach deine Expertise sichtbar und nutze Social Media gezielt, um mehr Kunden und Umsatz zu gewinnen.',
          image: img('ebook/audience-self-employed.jpg', 'Selbstständiger beim Arbeiten in den Bergen'),
        },
        {
          _key: 'creators',
          title: 'Influencer & Content Creator',
          text: 'Baue eine loyale Community auf, steigere deine Reichweite und lerne, wie du sie nachhaltig monetarisierst.',
          image: img('ebook/audience-creator.jpg', 'Content Creator beim Fotografieren in der Natur'),
        },
        {
          _key: 'companies',
          title: 'Unternehmen',
          text: 'Erreiche deine Zielgruppe authentisch und stärke mit einer klaren Strategie Sichtbarkeit und Markenbindung.',
          image: img('ebook/audience-company.jpg', 'Team bei der gemeinsamen Arbeit am Laptop'),
        },
      ],
    },
    reviews: {
      kicker: 'Erfahrungen',
      heading: 'Strategien, die in der Praxis funktionieren.',
      featured: {
        name: 'Barbara Prantl',
        role: 'Hobbyköchin & Influencerin (170.000+ Follower)',
        text: 'Ich habe mir Tristans E-Book gekauft und bin auch im persönlichen Austausch mit ihm. Die Tipps sind verständlich erklärt, praxisnah und extrem hilfreich. Gerade die Kombination aus Strategie, echten Erfahrungen und konkreten Beispielen macht das Ganze zu einem richtig starken Werkzeug für alle, die Social Media nachhaltig aufbauen möchten.',
        image: img('testimonials/barbara-prantl.webp', 'Barbara Prantl'),
      },
      messages: [
        {
          _key: 'reach-doubled',
          image: img(
            'ebook/messages/reach-doubled.png',
            'Käufernachricht: Die Content-Funnel-Strategie aus dem E-Book hat die Reichweite in drei Wochen verdoppelt.',
          ),
        },
        {
          _key: 'structure',
          image: img(
            'ebook/messages/structure.png',
            'Käufernachricht: Das E-Book ist schön, gut strukturiert und steckt voller Wissen und Herzblut.',
          ),
        },
        {
          _key: 'first-impression',
          image: img(
            'ebook/messages/first-impression.png',
            'Käufernachricht: Der erste Eindruck ist mega und die Arbeit wird ausdrücklich gelobt.',
          ),
        },
        {
          _key: 'first-chapters',
          image: img(
            'ebook/messages/first-chapters.png',
            'Käufernachricht: Schon nach den ersten drei Kapiteln wurde viel aus dem E-Book mitgenommen.',
          ),
        },
        {
          _key: 'bought-mega',
          image: img(
            'ebook/messages/bought-mega.png',
            'Käufernachricht: Direkt nach dem Kauf ist der erste Eindruck mega.',
          ),
        },
        {
          _key: 'value-experience',
          image: img(
            'ebook/messages/value-experience.png',
            'Käufernachricht: Das E-Book bietet viel Mehrwert, Wissen und wertvolle Erfahrungen.',
          ),
        },
        {
          _key: 'bought-excited',
          image: img(
            'ebook/messages/bought-excited.png',
            'Käufernachricht: Freude über den Kauf und den günstigen Zugang zum E-Book.',
          ),
        },
        {
          _key: 'posting-is-fun',
          image: img(
            'ebook/messages/posting-is-fun.png',
            'Käufernachricht: Die Kombination aus Tipps, Einblicken und E-Book macht das Posten leichter und wieder motivierend.',
          ),
        },
        {
          _key: 'clarity-and-bought',
          image: img(
            'ebook/messages/clarity-and-bought.png',
            'Käufernachricht: Mehr Klarheit über den Start und Vorfreude auf das gekaufte E-Book.',
          ),
        },
        {
          _key: 'recommendation',
          image: img(
            'ebook/messages/recommendation.png',
            'Käufernachricht: Das E-Book wurde aufgrund einer begeisterten Empfehlung gekauft.',
          ),
        },
        {
          _key: 'ready-to-implement',
          image: img(
            'ebook/messages/ready-to-implement.png',
            'Käufernachricht: Das E-Book wurde gekauft und die Umsetzung kann beginnen.',
          ),
        },
      ],
    },
    finalCta: {
      kicker: 'Auf was wartest du noch?',
      heading: 'Jetzt mit Plan durchstarten.',
      text: 'Hol dir die Instagram Erfolgsformel inklusive Insta BIO Creator und Bonus-Downloads.',
      pricePrefix: 'Komplettpaket für nur',
      price: '27 €',
      totalValue: '>280 € Gesamtwert',
      ctaLabel: 'E-Book + Boni sofort erhalten',
    },
    faq: {
      heading: 'FAQs',
      items: [
        {
          _key: 'platforms',
          question: 'Ist das E-Book nur für Instagram geeignet?',
          answer: richParagraphs('faq-platforms', [
            'Der Fokus liegt klar auf Instagram, da hier die besten Möglichkeiten für organische Reichweite und nachhaltige Monetarisierung bestehen. Deshalb beziehen sich die konkreten Praxisbeispiele und Schritt-für-Schritt-Erklärungen im E-Book auf Instagram.',
            'Die vermittelten Strategien und Methoden lassen sich jedoch problemlos auch auf Plattformen wie Facebook, TikTok oder YouTube Shorts übertragen.',
          ]),
        },
        {
          _key: 'evergreen',
          question: 'Ist das E-Book nicht bald veraltet, weil sich Social Media ständig verändert?',
          answer: richParagraphs('faq-evergreen', [
            'Social Media entwickelt sich laufend weiter. Genau deshalb konzentriert sich das E-Book nicht auf kurzfristige Trends oder einzelne Algorithmus-Tricks, sondern auf bewährte Evergreen-Strategien. Diese grundlegenden Prinzipien funktionieren seit Jahren und werden auch künftig die Basis für nachhaltigen Reichweitenaufbau, eine starke Community und erfolgreiche Monetarisierung bilden.',
            'Ein wichtiger Bestandteil ist dabei die Erfolgsmessung: Durch regelmäßige Analysen erkennst du, was aktuell funktioniert, und kannst deine Strategie gezielt optimieren. Dadurch bleibt dein Vorgehen zeitgemäß und berücksichtigt automatisch Veränderungen der Plattformen, Algorithmen und des Nutzerverhaltens.',
            'Einzelne Funktionen können sich verändern – das strategische Grundgerüst bleibt jedoch relevant, anpassungsfähig und langfristig nutzbar.',
          ]),
        },
        {
          _key: 'ads',
          question: 'Behandelt das E-Book auch bezahlte Werbeanzeigen?',
          answer: richParagraphs('faq-ads', [
            'Der Fokus des E-Books liegt bewusst auf dem organischen Social-Media-Aufbau. Du lernst, wie du dir mit nachhaltigen Strategien Reichweite, eine starke Community und Möglichkeiten zur Monetarisierung aufbaust – ohne von einem Werbebudget abhängig zu sein.',
            'Bezahlte Werbeanzeigen werden im E-Book nicht direkt behandelt. Sie können bei Bedarf jedoch optimal auf diesem stabilen organischen Fundament aufbauen und deine bestehenden Maßnahmen gezielt verstärken.',
          ]),
        },
      ],
    },
  };
}
