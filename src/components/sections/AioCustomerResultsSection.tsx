import GlowButton from './GlowButton';
import type { CSSProperties } from 'react';
import type {
  AioCustomerResultKey,
  SectionModule,
} from '../../lib/content/types';
import { DEFAULT_AIO_CUSTOMER_RESULTS } from '../../lib/content/aio-customer-results';
import type { EditAttr } from './SectionsList';

type ResultBadgePosition =
  | 'top-left'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-right';

type ResultImage = {
  src: string;
  alt: string;
  badgePosition?: ResultBadgePosition;
  trimBottom?: boolean;
  cropChatHeader?: boolean;
};

type ResultVisual = {
  key: AioCustomerResultKey;
  images: ResultImage[];
};

const RESULT_VISUALS: ResultVisual[] = [
  {
    key: 'seelenGruen',
    images: [
      { src: '/images/aio-results/seelen-gruen-profile-spaced.jpg', alt: 'Instagram-Profil von Seelen Grün mit 58.400 Followern', badgePosition: 'top-right' },
      { src: '/images/aio-results/seelen-gruen-reel-557k.jpg', alt: 'Reel von Seelen Grün mit 557.000 Aufrufen', badgePosition: 'top-left' },
      { src: '/images/aio-results/seelen-gruen-testreel-260k.jpg', alt: 'Kundennachricht über ein Testreel von Seelen Grün mit 260.677 organischen Aufrufen', badgePosition: 'top-right' },
    ],
  },
  {
    key: 'friedrich',
    images: [
      { src: '/images/aio-results/friedrich-result.jpg', alt: 'Kundennachricht über starkes Followerwachstum und mehrere erfolgreiche Reels', badgePosition: 'top-left' },
      { src: '/images/aio-results/friedrich-views.jpg', alt: 'Drei Reels von Friedrich mit mehr als 400.000 Aufrufen', badgePosition: 'top-left' },
    ],
  },
  {
    key: 'christina',
    images: [
      { src: '/images/aio-results/christina-profile.jpg', alt: 'Christina Starkes Instagram-Profil mit 129.000 Followern', badgePosition: 'top-right' },
      { src: '/images/aio-results/christina-growth.jpg', alt: 'Kundennachricht von Christina Starke über mehr als 50.000 neue Follower', badgePosition: 'top-left' },
    ],
  },
  {
    key: 'chaletLefiro',
    images: [
      { src: '/images/aio-results/chalet-lefiro-result.jpg', alt: 'Instagram-Profil von Chalet Lefiro mit 20.400 Followern', badgePosition: 'top-right' },
      { src: '/images/aio-results/chalet-views.jpg', alt: 'Drei Reels von Chalet Lefiro mit bis zu 1,4 Millionen Aufrufen', badgePosition: 'top-left', trimBottom: true },
    ],
  },
  {
    key: 'naomi',
    images: [
      { src: '/images/aio-results/naomi-before.jpg', alt: 'Naomis Instagram-Profil mit 2.175 Followern', badgePosition: 'top-right' },
      { src: '/images/aio-results/naomi-after.jpg', alt: 'Naomis Instagram-Profil mit 26.800 Followern', badgePosition: 'top-right' },
    ],
  },
  {
    key: 'naturnserAlm',
    images: [
      { src: '/images/aio-results/naturnser-alm-reel.jpg', alt: 'Das beim Praxis-Coaching produzierte Reel der Naturnser Alm mit mehr als 146.000 Aufrufen', badgePosition: 'top-right' },
      { src: '/images/aio-results/naturnser-alm-profile.jpg', alt: 'Instagram-Profil der Naturnser Alm mit 4.105 Followern', badgePosition: 'top-right' },
      { src: '/images/aio-results/naturnser-alm-result.jpg', alt: 'Kundennachricht über den Sprung von rund 1.300 auf 2.061 Follower über Nacht', cropChatHeader: true },
    ],
  },
  {
    key: 'untermarzoner',
    images: [
      { src: '/images/aio-results/untermarzoner-result.jpg', alt: 'Kundennachricht über mehr als 84.000 TikTok-Aufrufe', badgePosition: 'middle-right' },
    ],
  },
  {
    key: 'alpinArena',
    images: [
      { src: '/images/aio-results/alpin-arena-result.jpg', alt: 'Instagram-Insights mit mehr als 66.000 organischen Aufrufen', badgePosition: 'middle-right' },
    ],
  },
];

const STEFFI_PROOF_VISUALS = [
  {
    copyKey: 'proofFollowers' as const,
    src: '/images/aio-results/steffi-profile.jpg',
    alt: 'Aktuelles Instagram-Profil von Steffi – Tierisch Natürlich mit 6.036 Followern',
    beforeSrc: '/images/aio-results/steffi-profile-before.jpg',
    beforeAlt: 'Früheres Instagram-Profil von Steffi – Tierisch Natürlich mit 1.773 Followern',
    className: 'is-profile is-profile-comparison',
    mark: {
      width: 1179,
      height: 335,
      circles: [{ cx: 714, cy: 199, rx: 96, ry: 38, rotate: -3 }],
    },
  },
  {
    copyKey: 'proofViews' as const,
    src: '/images/aio-results/steffi-result-cropped.jpg',
    alt: 'Steffis Instagram-Dashboard mit einer Million Aufrufen in 30 Tagen',
    className: 'is-dashboard',
    mark: {
      width: 745,
      height: 680,
      circles: [{ cx: 218, cy: 578, rx: 70, ry: 20, rotate: -2 }],
    },
  },
  {
    copyKey: 'proofLeads' as const,
    src: '/images/aio-results/steffi-comments.jpg',
    alt: 'Steffis Reel mit 892 Kommentaren',
    className: 'is-comments',
    mark: {
      width: 1179,
      height: 1516,
      circles: [{ cx: 370, cy: 1438, rx: 97, ry: 42, rotate: -2 }],
    },
  },
];

type CircleMark = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate?: number;
};

type MarkLayer = {
  width: number;
  height: number;
  circles: CircleMark[];
};

function ScreenshotMarks({ mark }: { mark: MarkLayer }) {
  const primaryStroke = Math.max(4, mark.width * 0.006);
  const secondaryStroke = Math.max(2.5, mark.width * 0.0035);

  return (
    <svg
      className="aio-case-study__annotation"
      viewBox={`0 0 ${mark.width} ${mark.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {mark.circles.map((circle, index) => (
        <g
          key={`${circle.cx}-${circle.cy}`}
          transform={`rotate(${circle.rotate ?? -3} ${circle.cx} ${circle.cy})`}
        >
          <ellipse
            className="is-primary"
            cx={circle.cx}
            cy={circle.cy}
            rx={circle.rx}
            ry={circle.ry}
            strokeWidth={primaryStroke}
          />
          <ellipse
            className="is-secondary"
            cx={circle.cx + circle.rx * 0.015}
            cy={circle.cy - circle.ry * 0.04}
            rx={circle.rx * 1.055}
            ry={circle.ry * 1.08}
            strokeWidth={secondaryStroke}
            transform={`rotate(${index % 2 === 0 ? 5 : -5} ${circle.cx} ${circle.cy})`}
          />
        </g>
      ))}
    </svg>
  );
}

function FeedScreenshot({
  src,
  alt,
  mark,
}: {
  src: string;
  alt: string;
  mark: MarkLayer;
}) {
  return (
    <figure>
      <div
        className="aio-case-study__feed-media"
        style={{ aspectRatio: `${mark.width} / ${mark.height}` }}
      >
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        <ScreenshotMarks mark={mark} />
      </div>
    </figure>
  );
}

function MobileReelScreenshot({
  src,
  alt,
  reelIndex,
  mark,
}: {
  src: string;
  alt: string;
  reelIndex: number;
  mark: MarkLayer;
}) {
  return (
    <figure className="aio-case-study__mobile-reel">
      <div className="aio-case-study__mobile-reel-media">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ '--aio-reel-index': reelIndex } as CSSProperties}
        />
        <ScreenshotMarks mark={mark} />
      </div>
    </figure>
  );
}

const FEED_MARKS_905_BEFORE: MarkLayer = {
  width: 905,
  height: 1592,
  circles: [
    { cx: 76, cy: 486, rx: 62, ry: 25, rotate: -4 },
    { cx: 378, cy: 486, rx: 64, ry: 25, rotate: 3 },
    { cx: 679, cy: 486, rx: 63, ry: 25, rotate: -2 },
  ],
};

const FEED_MARKS_1179_BEFORE: MarkLayer = {
  width: 1179,
  height: 2074,
  circles: [
    { cx: 108, cy: 630, rx: 82, ry: 31, rotate: -4 },
    { cx: 500, cy: 630, rx: 84, ry: 31, rotate: 3 },
    { cx: 892, cy: 630, rx: 82, ry: 31, rotate: -2 },
  ],
};

const FEED_MARKS_1179_AFTER: MarkLayer = {
  width: 1179,
  height: 2074,
  circles: [
    { cx: 126, cy: 631, rx: 115, ry: 35, rotate: -3 },
    { cx: 514, cy: 631, rx: 116, ry: 35, rotate: 2 },
    { cx: 915, cy: 631, rx: 119, ry: 35, rotate: -2 },
  ],
};

const FEED_MARKS_905_AFTER: MarkLayer = {
  width: 905,
  height: 1592,
  circles: [
    { cx: 97, cy: 486, rx: 88, ry: 27, rotate: -3 },
    { cx: 381, cy: 486, rx: 77, ry: 27, rotate: 2 },
    { cx: 699, cy: 486, rx: 91, ry: 27, rotate: -2 },
  ],
};

const MOBILE_REEL_MARKS = {
  beforeFirst: {
    width: 302,
    height: 531,
    circles: [{ cx: 76, cy: 486, rx: 62, ry: 25, rotate: -4 }],
  },
  beforeSecond: {
    width: 302,
    height: 531,
    circles: [{ cx: 76, cy: 486, rx: 64, ry: 25, rotate: 3 }],
  },
  afterThird: {
    width: 302,
    height: 531,
    circles: [{ cx: 95, cy: 486, rx: 91, ry: 27, rotate: -2 }],
  },
  afterFirst: {
    width: 302,
    height: 531,
    circles: [{ cx: 97, cy: 486, rx: 88, ry: 27, rotate: -3 }],
  },
} satisfies Record<string, MarkLayer>;

/** Lokale Konzeptvariante mit belegbaren Ergebnissen aus Kundenscreenshots. */
export default function AioCustomerResultsSection({
  section,
  edit,
}: {
  section: SectionModule;
  edit?: EditAttr;
}) {
  const {
    _key,
    titleRowText,
    heading: outcomesHeading,
    bullets: outcomes,
    customerResults = DEFAULT_AIO_CUSTOMER_RESULTS,
  } = section;
  const path = `sections[_key=="${_key}"]`;
  const resultCards = RESULT_VISUALS.map(({ key, images }) => ({
    key,
    images,
    ...customerResults.customers[key],
  }));
  const steffiProofs = STEFFI_PROOF_VISUALS.map((visual) => ({
    ...visual,
    ...customerResults[visual.copyKey],
  }));
  const growth = customerResults.growthSystem;

  return (
    <section
      className="aio-results section"
      id="resultate"
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="aio-results__outcomes">
          <div className="aio-results__outcomes-head" data-anim="reveal">
            <p
              className="aio-programme__eyebrow aio-section-eyebrow"
              {...edit?.(`${path}.titleRowText`)}
            >
              {titleRowText}
            </p>
            <h3 {...edit?.(`${path}.heading`)}>{outcomesHeading}</h3>
          </div>
          <ul data-anim="reveal" data-delay="0.1">
            {outcomes.map((outcome, index) => (
              <li key={`${outcome}-${index}`} {...edit?.(`${path}.bullets[${index}]`)}>
                {outcome}
              </li>
            ))}
          </ul>

          <div
            className="aio-growth-system"
            data-anim="aio-growth-system"
            aria-label={growth.heading}
          >
            <header className="aio-growth-system__head">
              <div>
                <h4 {...edit?.(`${path}.customerResults.growthSystem.heading`)}>
                  {growth.heading}
                </h4>
              </div>
              <span
                className="aio-growth-system__status"
                {...edit?.(`${path}.customerResults.growthSystem.status`)}
              >
                <i aria-hidden="true" /> {growth.status}
              </span>
            </header>

            <div className="aio-growth-system__stages">
              <article className="aio-growth-stage">
                <div className="aio-growth-stage__copy">
                  <span {...edit?.(`${path}.customerResults.growthSystem.reach.label`)}>
                    {growth.reach.label}
                  </span>
                  <h5 {...edit?.(`${path}.customerResults.growthSystem.reach.heading`)}>
                    {growth.reach.heading}
                  </h5>
                  <p {...edit?.(`${path}.customerResults.growthSystem.reach.text`)}>
                    {growth.reach.text}
                  </p>
                </div>
                <div className="aio-growth-stage__graphic is-reach">
                  <svg viewBox="0 0 360 170" role="img" aria-label="Ansteigende Reichweitenkurve">
                    <defs>
                      <linearGradient id="aio-growth-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                      <filter id="aio-growth-glow" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur stdDeviation="6" />
                      </filter>
                    </defs>
                    <path className="aio-growth-stage__grid" d="M12 142H348M12 101H348M12 60H348M12 19H348M12 19V142M96 19V142M180 19V142M264 19V142M348 19V142" />
                    <path
                      className="aio-growth-stage__reach-area"
                      data-aio-growth-area
                      d="M12 137C55 135 72 126 105 119C145 110 153 121 193 93C230 66 243 78 278 50C303 30 325 28 348 15V157H12Z"
                      fill="url(#aio-growth-area)"
                    />
                    <path
                      className="aio-growth-stage__reach-line"
                      data-aio-growth-line
                      d="M12 137C55 135 72 126 105 119C145 110 153 121 193 93C230 66 243 78 278 50C303 30 325 28 348 15"
                    />
                    <circle className="aio-growth-stage__reach-glow" data-aio-growth-glow cx="348" cy="15" r="15" />
                    <circle className="aio-growth-stage__reach-point" data-aio-growth-point cx="348" cy="15" r="5" />
                  </svg>
                  <span
                    className="aio-growth-stage__signal"
                    data-aio-growth-label
                    {...edit?.(`${path}.customerResults.growthSystem.reach.signal`)}
                  >
                    {growth.reach.signal}
                  </span>
                </div>
              </article>

              <article className="aio-growth-stage">
                <div className="aio-growth-stage__copy">
                  <span {...edit?.(`${path}.customerResults.growthSystem.community.label`)}>
                    {growth.community.label}
                  </span>
                  <h5 {...edit?.(`${path}.customerResults.growthSystem.community.heading`)}>
                    {growth.community.heading}
                  </h5>
                  <p {...edit?.(`${path}.customerResults.growthSystem.community.text`)}>
                    {growth.community.text}
                  </p>
                </div>
                <div className="aio-growth-stage__graphic is-community" aria-hidden="true">
                  <svg viewBox="0 0 360 170">
                    <g transform="translate(180 85) scale(1.15) translate(-180 -85)">
                      <circle className="aio-growth-stage__orbit" data-aio-growth-orbit cx="180" cy="86" r="63" />
                      <circle className="aio-growth-stage__orbit is-inner" data-aio-growth-orbit cx="180" cy="86" r="39" />
                      <path className="aio-growth-stage__network" data-aio-growth-network d="M180 86L105 48M180 86L254 42M180 86L285 101M180 86L234 144M180 86L126 139M180 86L73 100" />
                      <g data-aio-growth-nodes>
                        <circle cx="105" cy="48" r="5" />
                        <circle cx="254" cy="42" r="6" />
                        <circle cx="285" cy="101" r="4" />
                        <circle cx="234" cy="144" r="5" />
                        <circle cx="126" cy="139" r="6" />
                        <circle cx="73" cy="100" r="4" />
                      </g>
                      <circle className="aio-growth-stage__core-halo" data-aio-growth-halo cx="180" cy="86" r="25" />
                      <circle className="aio-growth-stage__core" data-aio-growth-core cx="180" cy="86" r="10" />
                    </g>
                  </svg>
                  <span
                    className="aio-growth-stage__signal"
                    data-aio-growth-label
                    {...edit?.(`${path}.customerResults.growthSystem.community.signal`)}
                  >
                    {growth.community.signal}
                  </span>
                </div>
              </article>

              <article className="aio-growth-stage">
                <div className="aio-growth-stage__copy">
                  <span {...edit?.(`${path}.customerResults.growthSystem.customers.label`)}>
                    {growth.customers.label}
                  </span>
                  <h5 {...edit?.(`${path}.customerResults.growthSystem.customers.heading`)}>
                    {growth.customers.heading}
                  </h5>
                  <p {...edit?.(`${path}.customerResults.growthSystem.customers.text`)}>
                    {growth.customers.text}
                  </p>
                </div>
                <div className="aio-growth-stage__graphic is-conversion" aria-hidden="true">
                  <svg viewBox="0 0 360 170">
                    <path className="aio-growth-stage__flow" data-aio-growth-flow d="M28 37H112C145 37 145 85 178 85H228" />
                    <path className="aio-growth-stage__flow" data-aio-growth-flow d="M28 85H228" />
                    <path className="aio-growth-stage__flow" data-aio-growth-flow d="M28 133H112C145 133 145 85 178 85H228" />
                    <g className="aio-growth-stage__sources" data-aio-growth-sources>
                      <rect x="17" y="26" width="22" height="22" rx="6" />
                      <rect x="17" y="74" width="22" height="22" rx="6" />
                      <rect x="17" y="122" width="22" height="22" rx="6" />
                    </g>
                    <circle className="aio-growth-stage__conversion-halo" data-aio-growth-conversion cx="274" cy="85" r="42" />
                    <circle className="aio-growth-stage__conversion-ring" data-aio-growth-conversion cx="274" cy="85" r="28" />
                    <text
                      className="aio-growth-stage__currency"
                      data-aio-growth-currency
                      x="274"
                      y="85"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      €
                    </text>
                  </svg>
                  <span
                    className="aio-growth-stage__signal"
                    data-aio-growth-label
                    {...edit?.(`${path}.customerResults.growthSystem.customers.signal`)}
                  >
                    {growth.customers.signal}
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>

        <header className="aio-results__head" data-anim="reveal">
          <p
            className="aio-programme__eyebrow aio-section-eyebrow"
            {...edit?.(`${path}.customerResults.eyebrow`)}
          >
            {customerResults.eyebrow}
          </p>
          <h2 {...edit?.(`${path}.customerResults.heading`)}>{customerResults.heading}</h2>
          <p {...edit?.(`${path}.customerResults.intro`)}>{customerResults.intro}</p>
        </header>

        <article className="aio-case-study" id="steffi-case" data-anim="aio-case-study">
          <header className="aio-case-study__head">
            <div className="aio-case-study__head-meta">
              <p
                className="aio-results__source"
                {...edit?.(`${path}.customerResults.caseLabel`)}
              >
                {customerResults.caseLabel}
              </p>
              <div className="aio-case-study__identity">
                <img
                  src="/images/aio-results/steffi-avatar.jpg"
                  alt={`Porträt von ${customerResults.caseIdentity}`}
                  loading="lazy"
                  decoding="async"
                />
                <span {...edit?.(`${path}.customerResults.caseIdentity`)}>
                  {customerResults.caseIdentity}
                </span>
              </div>
            </div>
            <h3 {...edit?.(`${path}.customerResults.caseHeadline`)}>
              {customerResults.caseHeadline}
            </h3>
            <span
              className="aio-case-study__duration"
              {...edit?.(`${path}.customerResults.durationBadge`)}
            >
              <i aria-hidden="true" /> {customerResults.durationBadge}
            </span>
          </header>

          <div className="aio-case-study__proofs-shell">
            <div
              className="aio-case-study__proofs"
              data-aio-proof-slider
              aria-label="Dokumentierte Ergebnisse von Steffi"
            >
              {steffiProofs.map((proof) => (
                <figure className={proof.className} key={proof.src}>
                  <div className="aio-case-study__proof-media">
                    {'beforeSrc' in proof ? (
                      <div className="aio-case-study__profile-stack">
                        <div className="aio-case-study__profile-shot is-before">
                          <img
                            src={proof.beforeSrc}
                            alt={proof.beforeAlt}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="aio-case-study__profile-shot is-current">
                          <img src={proof.src} alt={proof.alt} loading="lazy" decoding="async" />
                          <ScreenshotMarks mark={proof.mark} />
                        </div>
                      </div>
                    ) : (
                      <div className="aio-case-study__proof-shot">
                        <img src={proof.src} alt={proof.alt} loading="lazy" decoding="async" />
                        <ScreenshotMarks mark={proof.mark} />
                      </div>
                    )}
                    <figcaption
                      {...edit?.(`${path}.customerResults.${proof.copyKey}.badge`)}
                    >
                      {proof.badge}
                    </figcaption>
                  </div>
                  <div className="aio-case-study__proof-metric">
                    <strong
                      {...edit?.(`${path}.customerResults.${proof.copyKey}.value`)}
                    >
                      {proof.value}
                    </strong>
                    <span
                      {...edit?.(`${path}.customerResults.${proof.copyKey}.description`)}
                    >
                      {proof.description}
                    </span>
                  </div>
                </figure>
              ))}
            </div>

            <div className="aio-case-study__proof-nav" aria-label="Ergebnisse wechseln">
              <button type="button" data-aio-proof-prev aria-label="Vorheriges Ergebnis">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <span data-aio-proof-status aria-live="polite">1 / {steffiProofs.length}</span>
              <button type="button" data-aio-proof-next aria-label="Nächstes Ergebnis">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="aio-case-study__journey-head">
            <strong {...edit?.(`${path}.customerResults.comparisonValue`)}>
              {customerResults.comparisonValue}
            </strong>
            <span {...edit?.(`${path}.customerResults.comparisonText`)}>
              {customerResults.comparisonText}
            </span>
          </div>

          <div className="aio-case-study__journey" data-before-after>
            <div className="aio-case-study__feed-layer is-after" aria-hidden="true">
              <FeedScreenshot
                src="/images/aio-results/steffi-after-feed-2-aligned.jpg"
                alt=""
                mark={FEED_MARKS_1179_AFTER}
              />
              <FeedScreenshot
                src="/images/aio-results/steffi-during-feed.jpg"
                alt=""
                mark={FEED_MARKS_905_AFTER}
              />
            </div>

            <div className="aio-case-study__feed-layer is-before">
              <FeedScreenshot
                src="/images/aio-results/steffi-before-feed.jpg"
                alt="Steffis vollständiger Reel-Feed vor dem Coaching mit konstant ungefähr 500 Aufrufen"
                mark={FEED_MARKS_905_BEFORE}
              />
              <FeedScreenshot
                src="/images/aio-results/steffi-before-feed-2-aligned.jpg"
                alt="Weiterer vollständiger Reel-Feed von Steffi vor dem Coaching mit dreistelligen Aufrufzahlen"
                mark={FEED_MARKS_1179_BEFORE}
              />
            </div>

            <div className="aio-case-study__mobile-feed-layer is-after" aria-hidden="true">
              <MobileReelScreenshot
                src="/images/aio-results/steffi-during-feed.jpg"
                alt=""
                reelIndex={2}
                mark={MOBILE_REEL_MARKS.afterThird}
              />
              <MobileReelScreenshot
                src="/images/aio-results/steffi-during-feed.jpg"
                alt=""
                reelIndex={0}
                mark={MOBILE_REEL_MARKS.afterFirst}
              />
            </div>

            <div className="aio-case-study__mobile-feed-layer is-before">
              <MobileReelScreenshot
                src="/images/aio-results/steffi-before-feed.jpg"
                alt="Steffis Reel vor dem Coaching mit 495 Aufrufen"
                reelIndex={0}
                mark={MOBILE_REEL_MARKS.beforeFirst}
              />
              <MobileReelScreenshot
                src="/images/aio-results/steffi-before-feed.jpg"
                alt="Steffis Reel vor dem Coaching mit 509 Aufrufen"
                reelIndex={1}
                mark={MOBILE_REEL_MARKS.beforeSecond}
              />
            </div>

            <span
              className="aio-case-study__comparison-label is-before"
              {...edit?.(`${path}.customerResults.beforeLabel`)}
            >
              {customerResults.beforeLabel}
            </span>
            <span
              className="aio-case-study__comparison-label is-after"
              {...edit?.(`${path}.customerResults.afterLabel`)}
            >
              {customerResults.afterLabel}
            </span>

            <span className="aio-case-study__comparison-divider" aria-hidden="true">
              <i data-before-after-handle>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
                </svg>
              </i>
            </span>
            <input
              className="aio-case-study__comparison-range"
              data-before-after-range
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              aria-label="Zwischen den Vorher- und Nachher-Feeds wechseln"
            />
          </div>
        </article>

        <div className="aio-results__more-head" data-anim="reveal">
          <h3 {...edit?.(`${path}.customerResults.moreHeading`)}>
            {customerResults.moreHeading}
          </h3>
          <span
            aria-hidden="true"
            {...edit?.(`${path}.customerResults.scrollLabel`)}
          >
            {customerResults.scrollLabel}
          </span>
        </div>

        <div
          className="aio-results__grid"
          data-anim="aio-results-carousel"
          aria-label={customerResults.moreHeading}
        >
          {resultCards.map(({ key, source, value, label, badges, images }) => (
            <article className="aio-results__card" key={key}>
              <div className={`aio-results__media${images.length > 1 ? ' is-comparison' : ''}${images.length === 3 ? ' is-triple' : ''}${key === 'seelenGruen' ? ' is-profile-proof-pair' : ''}`}>
                {images.map((image, imageIndex) => {
                  const badge = badges[imageIndex];
                  return (
                    <figure
                      className={[
                        image.trimBottom ? 'is-bottom-trimmed' : '',
                        image.cropChatHeader ? 'is-chat-header-cropped' : '',
                        image.badgePosition ? `is-badge-${image.badgePosition}` : '',
                      ].filter(Boolean).join(' ') || undefined}
                      key={image.src}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                      />
                      {badge && (
                        <figcaption
                          {...edit?.(`${path}.customerResults.customers.${key}.badges[${imageIndex}]`)}
                        >
                          {badge}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>

              <div className="aio-results__body">
                <p
                  className="aio-results__source"
                  {...edit?.(`${path}.customerResults.customers.${key}.source`)}
                >
                  {source}
                </p>
                <div className="aio-results__metric">
                  <strong
                    {...edit?.(`${path}.customerResults.customers.${key}.value`)}
                  >
                    {value}
                  </strong>
                  <span
                    {...edit?.(`${path}.customerResults.customers.${key}.label`)}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </article>
          ))}

          <article className="aio-results__card aio-results__card--more">
            <div className="aio-results__more-visual">
              <p {...edit?.(`${path}.customerResults.closingIntro`)}>
                {customerResults.closingIntro}
              </p>
              <h4 {...edit?.(`${path}.customerResults.closingHeading`)}>
                {customerResults.closingHeading}
              </h4>
              <span {...edit?.(`${path}.customerResults.closingHighlight`)}>
                {customerResults.closingHighlight}
              </span>
              <strong aria-hidden="true">+</strong>
            </div>

            <div className="aio-results__body aio-results__more-body">
              <p
                className="aio-results__source"
                {...edit?.(`${path}.customerResults.closingSource`)}
              >
                {customerResults.closingSource}
              </p>
              <p
                className="aio-results__more-copy"
                {...edit?.(`${path}.customerResults.closingText`)}
              >
                {customerResults.closingText}
              </p>
              <div className="aio-results__more-cta">
                <div {...edit?.(`${path}.customerResults.closingCta`)}>
                  <GlowButton label={customerResults.closingCta} action="modal-aio" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
