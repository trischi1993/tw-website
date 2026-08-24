import type { SectionResults } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';

type ProofImage = {
  src: string;
  alt: string;
  badge?: string;
  trimBottom?: boolean;
  cropAtCircle?: boolean;
  profileCrop?: 'tristan' | 'mindful';
};

type ProofCard = {
  kind: 'own' | 'customer';
  source: string;
  value: string;
  label: string;
  images: ProofImage[];
};

const OWN_RESULTS: ProofCard[] = [
  {
    kind: 'own',
    source: 'Tristan Weithaler · Personal Brand',
    value: '0 → 8.800+',
    label: 'Follower mit nur zwei Postings pro Woche',
    images: [
      {
        src: '/images/home-results/tristan-profile.jpg',
        alt: 'Instagram-Profil von Tristan Weithaler mit mehr als 8.800 Followern',
        badge: '8.800+ Follower',
        profileCrop: 'tristan',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Mindful Stays · Travel Brand',
    value: '115.000',
    label: 'Follower organisch aufgebaut',
    images: [
      {
        src: '/images/home-results/mindful-stays-profile.webp',
        alt: 'Instagram-Profil von Mindful Stays mit 115.000 Followern',
        badge: '115.000 Follower',
        profileCrop: 'mindful',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Southtyrolian · Destination Brand',
    value: '50.000 → 200.000+',
    label: 'Follower organisch aufgebaut',
    images: [
      {
        src: '/images/home-results/southtyrolian-profile.jpg',
        alt: 'Instagram-Profil von Southtyrolian mit mehr als 200.000 Followern',
        badge: '200.000+ Follower',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Tristan Weithaler · Lead-Post',
    value: '300+ Leads',
    label: 'mit nur einem Post generiert',
    images: [
      {
        src: '/images/home-results/tristan-leads.webp',
        alt: 'Instagram-Beitragsstatistik eines Posts von Tristan Weithaler',
        badge: '300+ Leads',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Tristan Weithaler · Personal Brand',
    value: '1.000 → 1,7 Mio.',
    label: 'Views mit einem Reel',
    images: [
      {
        src: '/images/home-results/tristan-backpack-reel.webp',
        alt: 'Reel von Tristan Weithaler mit Rucksack und 1.766.701 Aufrufen',
        badge: '1,7 Mio. Views',
        cropAtCircle: true,
      },
    ],
  },
];

const CUSTOMER_RESULTS: ProofCard[] = [
  {
    kind: 'customer',
    source: 'Friedrich · Metallkünstler',
    value: '1.600 → 400.000+',
    label: 'Views und +1.200 neue Follower in nur vier Tagen',
    images: [
      {
        src: '/images/home-results/friedrich-result.jpg',
        alt: 'Kundennachricht über starkes Followerwachstum und erfolgreiche Reels',
        badge: '+1.200 Follower',
      },
      {
        src: '/images/home-results/friedrich-views.jpg',
        alt: 'Drei Reels von Friedrich mit mehr als 400.000 Aufrufen',
        badge: '+400.000 Views',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Christina Starke · DIY & Interior',
    value: '50.000 → 129.000',
    label: 'Follower seit der gemeinsamen Account-Analyse',
    images: [
      {
        src: '/images/home-results/christina-profile.jpg',
        alt: 'Christina Starkes Instagram-Profil mit 129.000 Followern',
        badge: '+79.000 Follower',
      },
      {
        src: '/images/home-results/christina-growth.jpg',
        alt: 'Nachricht von Christina Starke über ihr organisches Wachstum',
        badge: '+4,3 Mio. Views',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Chalet Lefiro · Luxury Chalet',
    value: '2.500 → 20.400',
    label: 'Follower in sechs Monaten und mehr Buchungsanfragen',
    images: [
      {
        src: '/images/home-results/chalet-lefiro-result.jpg',
        alt: 'Instagram-Profil von Chalet Lefiro mit 20.400 Followern',
        badge: '+17.900 Follower',
      },
      {
        src: '/images/home-results/chalet-views.jpg',
        alt: 'Reels von Chalet Lefiro mit bis zu 1,4 Millionen Aufrufen',
        badge: '1,4 Mio. Views',
        trimBottom: true,
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Naomi · Mentorin',
    value: '2.175 → 26.800+',
    label: 'Follower mit einer individuell angepassten Content-Strategie',
    images: [
      {
        src: '/images/home-results/naomi-before.jpg',
        alt: 'Naomis Instagram-Profil vor der Zusammenarbeit mit 2.175 Followern',
        badge: 'Vorher',
      },
      {
        src: '/images/home-results/naomi-after.jpg',
        alt: 'Naomis Instagram-Profil nach der Zusammenarbeit mit 26.800 Followern',
        badge: '+24.626 Follower',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Naturnser Alm',
    value: '146.000+',
    label: 'Views mit dem gemeinsam produzierten Video',
    images: [
      {
        src: '/images/home-results/naturnser-alm-reel.jpg',
        alt: 'Das beim Praxis-Coaching produzierte Reel der Naturnser Alm',
        badge: '146.000+ Views',
      },
      {
        src: '/images/home-results/naturnser-alm-profile.jpg',
        alt: 'Instagram-Profil der Naturnser Alm mit 4.105 Followern',
        badge: '+2.800 Follower',
      },
      {
        src: '/images/home-results/naturnser-alm-result.jpg',
        alt: 'Kundennachricht über das Followerwachstum der Naturnser Alm',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'die Küche by Untermarzoner',
    value: '84.000+',
    label: 'Views mit dem gemeinsam produzierten Video',
    images: [
      {
        src: '/images/home-results/untermarzoner-result.jpg',
        alt: 'Kundennachricht über mehr als 84.000 TikTok-Aufrufe',
        badge: '84.000+ Views',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Alpin Arena Schnals',
    value: '66.000+',
    label: 'organische Views mit einem Reel',
    images: [
      {
        src: '/images/home-results/alpin-arena-result.jpg',
        alt: 'Instagram-Insights mit mehr als 66.000 organischen Aufrufen',
        badge: '66.000+ Views',
      },
    ],
  },
];

const RESULTS = [...OWN_RESULTS, ...CUSTOMER_RESULTS];

export default function HomeProofCarouselSection({
  section,
  edit,
}: {
  section: SectionResults;
  edit?: EditAttr;
}) {
  const { _key, anchor } = section;
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className="home-proof"
      data-home-proof=""
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <header className="home-proof__head" data-anim="reveal">
          <h2>Genug erzählt. Lass die Ergebnisse sprechen.</h2>
          <div className="home-proof__legend" aria-label="Ergebnisgruppe auswählen">
            <button
              type="button"
              className="is-own is-active"
              data-proof-jump="own"
              aria-pressed="true"
            >
              <i aria-hidden="true" /> Meine Erfolge
            </button>
            <button
              type="button"
              className="is-customer"
              data-proof-jump="customer"
              aria-pressed="false"
            >
              <i aria-hidden="true" /> Kundenerfolge
            </button>
          </div>
          <span className="home-proof__hint" aria-hidden="true">Scrollen&nbsp; →</span>
        </header>

        <div
          className="home-proof__carousel"
          data-home-proof-carousel=""
          aria-label="Meine Erfolge und Kundenerfolge"
        >
          {RESULTS.map(({ kind, source, value, label, images }) => (
            <article
              className={`home-proof-card is-${kind}`}
              data-result-kind={kind}
              key={`${source}-${value}`}
            >
              <div
                className={`home-proof-card__media${images.length > 1 ? ' is-comparison' : ''}${images.length === 3 ? ' is-triple' : ''}`}
              >
                <span className="home-proof-card__category">
                  {kind === 'own' ? 'Meine Erfolge' : 'Kundenerfolg'}
                </span>
                {images.map((image) => (
                  <figure
                    className={[
                      image.trimBottom ? 'is-bottom-trimmed' : '',
                      image.cropAtCircle ? 'is-circle-cropped' : '',
                      image.profileCrop ? `is-${image.profileCrop}-profile-cropped` : '',
                    ].filter(Boolean).join(' ') || undefined}
                    key={image.src}
                  >
                    <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                    {image.badge && <figcaption>{image.badge}</figcaption>}
                  </figure>
                ))}
              </div>

              <div className="home-proof-card__body">
                <p className="home-proof-card__source">{source}</p>
                <div className="home-proof-card__metric">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
