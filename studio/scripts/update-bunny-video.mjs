import { getCliClient } from 'sanity/cli';
import datenschutzBody from '../../shared/legal/datenschutz-pt.mjs';

const VIDEO_URL =
  'https://tristan-website.b-cdn.net/NEW%20Video%20-%20All-In-One%20Social%20Media%20Coaching%20-%20compressed.mp4';
const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });

const aioIds = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];
const privacyIds = ['page-datenschutz', 'drafts.page-datenschutz'];
const existing = await client.fetch(
  `*[_id in $ids]{
    _id,
    "videoUrl": sections[_key == "hero"][0].videoUrl,
    "vimeoId": sections[_key == "hero"][0].vimeoId
  }`,
  { ids: [...aioIds, ...privacyIds] },
);

if (!existing.some(({ _id }) => aioIds.includes(_id))) {
  throw new Error('ALL-IN-ONE page not found in the production dataset.');
}
if (!existing.some(({ _id }) => privacyIds.includes(_id))) {
  throw new Error('Datenschutz page not found in the production dataset.');
}

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        existing,
        nextVideoUrl: VIDEO_URL,
        privacyBlocks: datenschutzBody.length,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const transaction = client.transaction();

for (const { _id } of existing) {
  if (aioIds.includes(_id)) {
    transaction.patch(
      client
        .patch(_id)
        .set({ 'sections[_key=="hero"].videoUrl': VIDEO_URL })
        .unset(['sections[_key=="hero"].vimeoId']),
    );
  }
  if (privacyIds.includes(_id)) {
    transaction.patch(
      client.patch(_id).set({
        'sections[_key=="head"].meta': 'Aktualisierungs-Datum: 23. Juli 2026',
        'sections[_key=="body"].body': datenschutzBody,
      }),
    );
  }
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      documents: existing.map(({ _id }) => _id),
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
