import { getCliClient } from 'sanity/cli';
import { AIO_PROGRAMME } from '../../shared/aio-programme.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];
const removedPracticeBullets = new Set([
  'Post-Beschreibung verfassen',
  'Finale Einstellungen fürs Posting',
]);

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "programme": sections[_key == "modul-1"][0].programme,
    "practiceBullets": sections[_key == "modul-5"][0].bullets
  }`,
  { ids },
);

const published = documents.find(({ _id }) => _id === 'page-all-in-one-coaching');
if (!published?.programme || !Array.isArray(published.practiceBullets)) {
  throw new Error('Published AIO programme content not found in the production dataset.');
}

const updates = documents
  .filter(({ programme, practiceBullets }) => programme && Array.isArray(practiceBullets))
  .map((document) => ({
    ...document,
    nextPracticeBullets: document.practiceBullets.filter(
      (bullet) => !removedPracticeBullets.has(bullet),
    ),
  }));

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        updates: updates.map(({ _id, programme, practiceBullets, nextPracticeBullets }) => ({
          _id,
          previousProgramme: programme,
          nextCoaching: {
            coachingLabel: AIO_PROGRAMME.coachingLabel,
            coachingEyebrow: AIO_PROGRAMME.coachingEyebrow,
            coachingText: AIO_PROGRAMME.coachingText,
            coachingBenefits: AIO_PROGRAMME.coachingBenefits,
          },
          practiceBullets,
          nextPracticeBullets,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const transaction = client.transaction();
for (const update of updates) {
  transaction.patch(
    client
      .patch(update._id)
      .ifRevisionId(update._rev)
      .set({
        'sections[_key=="modul-1"].programme.coachingLabel': AIO_PROGRAMME.coachingLabel,
        'sections[_key=="modul-1"].programme.coachingEyebrow': AIO_PROGRAMME.coachingEyebrow,
        'sections[_key=="modul-1"].programme.coachingText': AIO_PROGRAMME.coachingText,
        'sections[_key=="modul-1"].programme.coachingBenefits': AIO_PROGRAMME.coachingBenefits,
        'sections[_key=="modul-5"].bullets': update.nextPracticeBullets,
      }),
  );
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      documents: updates.map(({ _id }) => _id),
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
