import { getCliClient } from 'sanity/cli';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });

const descriptions = {
  homePage:
    'Tristan Weithaler zeigt Selbstständigen und Unternehmen, wie sie mit Social Media organisch Reichweite, Follower und Kunden gewinnen.',
  'page-all-in-one-coaching':
    'Das ALL-IN-ONE Social Media Coaching für Selbstständige und Unternehmen: Strategien für Reichweite, Kundengewinnung und professionelle Content-Erstellung.',
};

const publishedIds = Object.keys(descriptions);
const ids = [...publishedIds, ...publishedIds.map((id) => `drafts.${id}`)];
const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _type,
    "description": seo.description
  }`,
  { ids },
);

for (const id of publishedIds) {
  if (!documents.some((document) => document._id === id)) {
    throw new Error(`Published document not found: ${id}`);
  }
}

const updates = documents.map((document) => {
  const baseId = document._id.replace(/^drafts\./, '');
  return {
    ...document,
    nextDescription: descriptions[baseId],
  };
});

if (DRY_RUN) {
  console.log(JSON.stringify({ mode: 'dry-run', updates }, null, 2));
  process.exit(0);
}

const transaction = client.transaction();
for (const update of updates) {
  transaction.patch(
    client.patch(update._id).set({ 'seo.description': update.nextDescription }),
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
