import { getCliClient } from 'sanity/cli';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['homePage', 'drafts.homePage'];

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    "section": sections[_key == "results"][0]{
      _type,
      _key,
      name,
      heading,
      ownLabel,
      customerLabel
    }
  }`,
  { ids },
);

const published = documents.find((document) => document._id === 'homePage');
if (!published?.section) {
  throw new Error('Published homePage results section not found.');
}

const updates = documents
  .filter((document) => document.section)
  .map((document) => ({
    _id: document._id,
    previous: document.section,
    next: {
      _type: 'sectionResults',
      _key: 'results',
      name: 'Meine Erfolge und Kundenerfolge',
      heading: 'Lass Ergebnisse aus der Praxis sprechen.',
      ownLabel: 'Meine Erfolge',
      customerLabel: 'Kundenerfolge',
    },
  }));

if (DRY_RUN) {
  console.log(JSON.stringify({ mode: 'dry-run', updates }, null, 2));
  process.exit(0);
}

const transaction = client.transaction();
for (const update of updates) {
  transaction.patch(
    client
      .patch(update._id)
      .set({
        'sections[_key=="results"].name': update.next.name,
        'sections[_key=="results"].heading': update.next.heading,
        'sections[_key=="results"].ownLabel': update.next.ownLabel,
        'sections[_key=="results"].customerLabel': update.next.customerLabel,
      })
      .unset([
        'sections[_key=="results"].subtitle',
        'sections[_key=="results"].title',
        'sections[_key=="results"].images',
      ]),
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
