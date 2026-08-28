import { getCliClient } from 'sanity/cli';
import { AIO_CUSTOMER_RESULTS } from '../../shared/aio-customer-results.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "existing": sections[_key == "resultate"][0].customerResults.customers.seelenGruen
  }`,
  { ids },
);

const published = documents.find(({ _id }) => _id === 'page-all-in-one-coaching');
if (!published) {
  throw new Error('Published AIO page not found in the production dataset.');
}

const next = AIO_CUSTOMER_RESULTS.customers.seelenGruen;

if (DRY_RUN) {
  console.log(JSON.stringify({ mode: 'dry-run', documents, next }, null, 2));
  process.exit(0);
}

const transaction = client.transaction();
for (const { _id } of documents) {
  transaction.patch(
    client.patch(_id).set({
      'sections[_key=="resultate"].customerResults.customers.seelenGruen': next,
    }),
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
