import type { SectionResults } from '../../lib/content/types';
import type { EditAttr } from './SectionsList';
import GlowButton from './GlowButton';

type ResultBadgePosition =
  | 'top-left'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'bio-link-right'
  | 'reel-right';

type ProofImage = {
  src: string;
  alt: string;
  badge?: string;
  badgePosition?: ResultBadgePosition;
  trimBottom?: boolean;
  cropAtCircle?: boolean;
  cropChatHeader?: boolean;
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
        badge: '100 % organisch',
        badgePosition: 'bio-link-right',
        profileCrop: 'tristan',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Mindful Stays · Travel Brand',
    value: '115.000',
    label: 'Follower mit der eigenen Travel Brand',
    images: [
      {
        src: '/images/home-results/mindful-stays-profile.webp',
        alt: 'Instagram-Profil von Mindful Stays mit 115.000 Followern',
        badge: 'Reels bis 11,1 Mio. Views',
        badgePosition: 'reel-right',
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
        badge: '+150.000 Follower',
        badgePosition: 'top-right',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Tristan Weithaler · Personal Brand',
    value: '300+ Leads',
    label: 'mit nur einem Post generiert',
    images: [
      {
        src: '/images/home-results/tristan-leads.webp',
        alt: 'Instagram-Beitragsstatistik eines Posts von Tristan Weithaler',
        badge: 'Content → Leads',
        badgePosition: 'middle-right',
      },
    ],
  },
  {
    kind: 'own',
    source: 'Tristan Weithaler · Personal Brand',
    value: '1,7 Mio. Views',
    label: 'und +2.000 neue Follower mit nur einem Reel',
    images: [
      {
        src: '/images/home-results/tristan-backpack-reel.webp',
        alt: 'Reel von Tristan Weithaler mit Rucksack, 1.766.701 Aufrufen und mehr als 2.000 neuen Followern',
        badge: '+2.000 Follower',
        badgePosition: 'bottom-right',
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
    label: 'Views hochskaliert und +1.200 neue Follower in nur 4 Tagen',
    images: [
      {
        src: '/images/home-results/friedrich-result.jpg',
        alt: 'Kundennachricht über starkes Followerwachstum und erfolgreiche Reels',
        badge: '+1.200 Follower',
        badgePosition: 'top-left',
      },
      {
        src: '/images/home-results/friedrich-views.jpg',
        alt: 'Drei Reels von Friedrich mit mehr als 400.000 Aufrufen',
        badge: '+400.000 Views',
        badgePosition: 'top-left',
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
        badgePosition: 'top-right',
      },
      {
        src: '/images/home-results/christina-growth.jpg',
        alt: 'Nachricht von Christina Starke über ihr organisches Wachstum',
        badge: 'Mehrere Mio. Views',
        badgePosition: 'top-left',
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
        badgePosition: 'top-right',
      },
      {
        src: '/images/home-results/chalet-views.jpg',
        alt: 'Reels von Chalet Lefiro mit bis zu 1,4 Millionen Aufrufen',
        badge: 'Mehrere Mio. Views',
        badgePosition: 'top-left',
        trimBottom: true,
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Naomi · Mentorin',
    value: '2.175 → 26.800+',
    label: 'Follower durch eine auf sie angepasste Content-Strategie',
    images: [
      {
        src: '/images/home-results/naomi-before.jpg',
        alt: 'Naomis Instagram-Profil vor der Zusammenarbeit mit 2.175 Followern',
        badge: 'Vorher',
        badgePosition: 'top-right',
      },
      {
        src: '/images/home-results/naomi-after.jpg',
        alt: 'Naomis Instagram-Profil nach der Zusammenarbeit mit 26.800 Followern',
        badge: '+24.626 Follower',
        badgePosition: 'top-right',
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
        badgePosition: 'top-right',
      },
      {
        src: '/images/home-results/naturnser-alm-profile.jpg',
        alt: 'Instagram-Profil der Naturnser Alm mit 4.105 Followern',
        badge: '+2.800 Follower',
        badgePosition: 'top-right',
      },
      {
        src: '/images/home-results/naturnser-alm-result.jpg',
        alt: 'Kundennachricht über das Followerwachstum der Naturnser Alm',
        cropChatHeader: true,
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
        badgePosition: 'middle-right',
      },
    ],
  },
  {
    kind: 'customer',
    source: 'Alpin Arena Schnals',
    value: '66.000+',
    label: 'Views mit dem gemeinsam produzierten Video',
    images: [
      {
        src: '/images/home-results/alpin-arena-result.jpg',
        alt: 'Instagram-Insights mit mehr als 66.000 organischen Aufrufen',
        badge: '66.000+ Views',
        badgePosition: 'middle-right',
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
          <h2>Aus der Praxis. Lass die Ergebnisse sprechen.</h2>
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
              aria-label={`${kind === 'own' ? 'Mein Erfolg' : 'Kundenerfolg'}: ${source}`}
              key={`${source}-${value}`}
            >
              <div
                className={`home-proof-card__media${images.length > 1 ? ' is-comparison' : ''}${images.length === 3 ? ' is-triple' : ''}`}
              >
                {images.map((image) => (
                  <figure
                    className={[
                      image.trimBottom ? 'is-bottom-trimmed' : '',
                      image.cropAtCircle ? 'is-circle-cropped' : '',
                      image.cropChatHeader ? 'is-chat-header-cropped' : '',
                      image.profileCrop ? `is-${image.profileCrop}-profile-cropped` : '',
                      image.badgePosition ? `is-badge-${image.badgePosition}` : '',
                    ].filter(Boolean).join(' ') || undefined}
                    key={image.src}
                  >
                    <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                    {image.badge ? <figcaption>{image.badge}</figcaption> : null}
                  </figure>
                ))}
              </div>

              <div className="home-proof-card__body">
                <p className="home-proof-card__source">
                  <i aria-hidden="true" />
                  {source}
                </p>
                <div className="home-proof-card__metric">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            </article>
          ))}

          <article
            className="home-proof-card home-proof-card--more"
            aria-label="Dein möglicher nächster Erfolg"
          >
            <div className="home-proof-card__more-visual">
              <p>Und viele weitere meiner Kunden&nbsp;...</p>
              <h3>
                ... haben mit klarer Strategie ihren nächsten
                Wachstumsschritt erreicht.
              </h3>
              <span>Hier könnte dein Erfolg stehen.</span>
              <strong aria-hidden="true">+</strong>
            </div>

            <div className="home-proof-card__body home-proof-card__more-body">
              <p className="home-proof-card__source">Dein nächster Schritt</p>
              <p className="home-proof-card__more-copy">
                Lass uns das Potenzial in deinem Account sichtbar machen.
              </p>
              <div className="home-proof-card__more-cta">
                <GlowButton label="Ich will auch wachsen!" action="modal" />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
