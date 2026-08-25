import { getCliClient } from 'sanity/cli';
import { AIO_CUSTOMER_RESULTS } from '../../shared/aio-customer-results.mjs';
import { AIO_PROGRAMME } from '../../shared/aio-programme.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];

const heroIntro = [
  'Das Komplettpaket für Selbstständige und Unternehmen – mit über 40 Videolektionen und persönlicher 1:1 Begleitung.',
  'Schritt für Schritt entwickelst du eine Social-Media-Präsenz, die Reichweite aufbaut, Kunden gewinnt und sich eigenständig weiterführen lässt.',
].map((line, index) => ({
  _key: `aio-hero-current-${index + 1}`,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [
    {
      _key: `aio-hero-current-${index + 1}-span`,
      _type: 'span',
      marks: [],
      text: line,
    },
  ],
}));

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "hero": sections[_key == "hero"][0]{intro},
    "programme": sections[_key == "modul-1"][0].programme,
    "growthSystem": sections[_key == "resultate"][0].customerResults.growthSystem,
    "legacyResultImage": sections[_key == "resultate"][0].image,
    "legacyResultImageWide": sections[_key == "resultate"][0].imageWide
  }`,
  { ids },
);

const published = documents.find(({ _id }) => _id === 'page-all-in-one-coaching');
if (!published) {
  throw new Error('Published AIO page not found in the production dataset.');
}

const next = {
  heroIntro,
  programme: { _type: 'aioProgramme', ...AIO_PROGRAMME },
  growthSystem: AIO_CUSTOMER_RESULTS.growthSystem,
};

if (DRY_RUN) {
  console.log(JSON.stringify({ mode: 'dry-run', documents, next }, null, 2));
  process.exit(0);
}

const transaction = client.transaction();
for (const { _id } of documents) {
  transaction.patch(
    client
      .patch(_id)
      .set({
        'sections[_key=="hero"].intro': next.heroIntro,
        'sections[_key=="modul-1"].programme': next.programme,
        'sections[_key=="resultate"].customerResults.growthSystem': next.growthSystem,
      })
      .unset([
        'sections[_key=="resultate"].image',
        'sections[_key=="resultate"].imageWide',
      ]),
  );
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      documents: documents.map(({ _id }) => _id),
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
