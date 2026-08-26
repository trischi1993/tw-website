import { getCliClient } from 'sanity/cli';
import { AIO_CUSTOMER_RESULTS } from '../../shared/aio-customer-results.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "resultSection": sections[_key == "resultate"][0]{
      _key,
      titleRowText,
      heading,
      bullets,
      customerResults
    }
  }`,
  { ids },
);

const published = documents.find(({ _id }) => _id === 'page-all-in-one-coaching');
if (!published?.resultSection) {
  throw new Error('Published AIO result section not found in the production dataset.');
}

const existing = documents.filter(({ resultSection }) => resultSection?.customerResults);
if (existing.length && !FORCE) {
  throw new Error(
    `Kundenerfolge sind bereits vorhanden in: ${existing.map(({ _id }) => _id).join(', ')}. ` +
      'Migration absichtlich nicht ueberschrieben; fuer einen bewussten Reset --force verwenden.',
  );
}

const customerResults = {
  _type: 'aioCustomerResults',
  ...AIO_CUSTOMER_RESULTS,
};

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        documents: documents.map(({ _id, _rev, resultSection }) => ({
          _id,
          _rev,
          resultSection,
        })),
        next: {
          titleRowText: 'Dein Ergebnis',
          customerResults,
        },
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const transaction = client.transaction();
for (const { _id } of documents) {
  transaction.patch(
    client.patch(_id).set({
      'sections[_key=="resultate"].titleRowText': 'Dein Ergebnis',
      'sections[_key=="resultate"].customerResults': customerResults,
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
