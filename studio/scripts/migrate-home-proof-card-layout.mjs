import { getCliClient } from 'sanity/cli';
import { HOME_PROOF_CARD_SLOTS } from '../../shared/data/home-proof-card-slots.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const ids = ['homePage', 'drafts.homePage'];

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "section": sections[_key == "results"][0]
  }`,
  { ids },
);

const published = documents.find((document) => document._id === 'homePage');
if (!published?.section) {
  throw new Error('Published homePage results section not found.');
}

function buildResultCards(document) {
  if (document.section.resultCards) {
    throw new Error(`${document._id} already contains resultCards; migration stopped to protect newer edits.`);
  }
  if (!Array.isArray(document.section.cards)) {
    throw new Error(`${document._id} does not contain the existing cards array.`);
  }

  const cardsByKey = new Map(document.section.cards.map((card) => [card?._key, card]));
  const knownKeys = new Set(HOME_PROOF_CARD_SLOTS.map((slot) => slot.key));
  const missing = HOME_PROOF_CARD_SLOTS.filter((slot) => !cardsByKey.has(slot.key)).map((slot) => slot.key);
  const unknown = document.section.cards
    .map((card) => card?._key)
    .filter((key) => key && !knownKeys.has(key));

  if (missing.length || unknown.length) {
    throw new Error(
      `${document._id} card structure differs from the expected layout. `
      + `Missing: ${missing.join(', ') || 'none'}. Unknown: ${unknown.join(', ') || 'none'}.`,
    );
  }

  const resultCards = {};
  for (const slot of HOME_PROOF_CARD_SLOTS) {
    const card = cardsByKey.get(slot.key);
    if (!card?.source || !card?.value || !card?.label || !Array.isArray(card.images) || card.images.length === 0) {
      throw new Error(`${document._id} card ${slot.key} is incomplete.`);
    }

    const badges = card.images
      .map((image) => image?.badge)
      .filter((badge) => typeof badge === 'string' && badge.trim());
    const images = card.images.map((image) => {
      if (!image?._key || !image?.image) {
        throw new Error(`${document._id} card ${slot.key} contains an incomplete screenshot.`);
      }
      return {
        _type: 'fixedProofImage',
        _key: image._key,
        image: image.image,
        hasBadge: typeof image.badge === 'string' && Boolean(image.badge.trim()),
        ...(image.badgePosition ? { badgePosition: image.badgePosition } : {}),
        crop: image.crop ?? 'none',
      };
    });

    resultCards[slot.field] = {
      source: card.source,
      value: card.value,
      label: card.label,
      badges,
      images,
    };
  }
  return resultCards;
}

const updates = documents
  .filter((document) => document.section)
  .map((document) => {
    const resultCards = buildResultCards(document);
    return {
      _id: document._id,
      _rev: document._rev,
      resultCards,
      nextSection: { ...document.section, resultCards },
    };
  });

const summary = updates.map(({ _id, resultCards }) => ({
  _id,
  cards: HOME_PROOF_CARD_SLOTS.length,
  images: HOME_PROOF_CARD_SLOTS.reduce(
    (count, slot) => count + resultCards[slot.field].images.length,
    0,
  ),
  badges: HOME_PROOF_CARD_SLOTS.reduce(
    (count, slot) => count + resultCards[slot.field].badges.length,
    0,
  ),
}));

if (DRY_RUN) {
  console.log(JSON.stringify({ mode: 'dry-run', updates: summary }, null, 2));
  process.exit(0);
}

const transaction = client.transaction();
for (const update of updates) {
  transaction.patch(
    client
      .patch(update._id)
      .ifRevisionId(update._rev)
      .set({ 'sections[_key=="results"]': update.nextSection }),
  );
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      updates: summary,
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
