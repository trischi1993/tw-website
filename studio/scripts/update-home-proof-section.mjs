import { createReadStream } from 'node:fs';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCliClient } from 'sanity/cli';
import { HOME_PROOF_CARDS, HOME_PROOF_CLOSING_CARD } from '../../shared/data/home-proof.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['homePage', 'drafts.homePage'];
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const publicRoot = path.join(projectRoot, 'public');

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    "section": sections[_key == "results"][0]
  }`,
  { ids },
);

const published = documents.find((document) => document._id === 'homePage');
if (!published?.section) {
  throw new Error('Published homePage results section not found.');
}

const imageCount = HOME_PROOF_CARDS.reduce((sum, card) => sum + card.images.length, 0);

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        documents: documents.filter((document) => document.section).map(({ _id }) => _id),
        cards: HOME_PROOF_CARDS.length,
        images: imageCount,
        closingCard: HOME_PROOF_CLOSING_CARD,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

async function getOrUploadImage(proofImage) {
  const filename = path.basename(proofImage.path);
  const existingId = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename },
  );
  if (existingId) return existingId;

  const absolutePath = path.join(publicRoot, proofImage.path.replace(/^\//, ''));
  if (!existsSync(absolutePath)) {
    throw new Error(`Carousel image not found: ${absolutePath}`);
  }
  const asset = await client.assets.upload('image', createReadStream(absolutePath), { filename });
  return asset._id;
}

const cards = [];
for (const card of HOME_PROOF_CARDS) {
  const images = [];
  for (const proofImage of card.images) {
    const assetId = await getOrUploadImage(proofImage);
    images.push({
      _type: 'proofImage',
      _key: proofImage._key,
      image: {
        _type: 'imageWithAlt',
        asset: { _type: 'reference', _ref: assetId },
        alt: proofImage.alt,
      },
      ...(proofImage.badge ? { badge: proofImage.badge } : {}),
      ...(proofImage.badgePosition ? { badgePosition: proofImage.badgePosition } : {}),
      crop: proofImage.crop ?? 'none',
    });
  }
  cards.push({
    _type: 'proofCard',
    _key: card._key,
    kind: card.kind,
    source: card.source,
    value: card.value,
    label: card.label,
    images,
  });
}

const updates = documents
  .filter((document) => document.section)
  .map((document) => ({
    _id: document._id,
    next: {
      _type: 'sectionResults',
      _key: 'results',
      name: 'Meine Erfolge und Kundenerfolge',
      ...(document.section.anchor ? { anchor: document.section.anchor } : {}),
      heading: 'Lass Ergebnisse aus der Praxis sprechen.',
      ownLabel: 'Meine Erfolge',
      customerLabel: 'Kundenerfolge',
      cards,
      closingCard: {
        ...HOME_PROOF_CLOSING_CARD,
        ctaNewTab: false,
      },
    },
  }));

const transaction = client.transaction();
for (const update of updates) {
  transaction.patch(
    client.patch(update._id).set({
      'sections[_key=="results"]': update.next,
    }),
  );
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      documents: updates.map(({ _id }) => _id),
      cards: cards.length,
      images: imageCount,
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
