import { createReadStream } from 'node:fs';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCliClient } from 'sanity/cli';
import { AIO_CUSTOMER_RESULTS } from '../../shared/aio-customer-results.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const filename = 'seelen-gruen-reel-followers-20k.jpg';
const sourcePath = path.join(projectRoot, 'public/images/aio-results', filename);
const proofKey = 'seelen-gruen-reel-followers-20k';
const proofAlt = 'Reel-Insights von Seelen Grün mit 20.800 neuen Followern';
const proofBadge = '+20.800 Follower';
const organicBadge = '100 % organisch';
const viewsBadge = '557.000 Views';
const ids = [
  'homePage',
  'drafts.homePage',
  'page-all-in-one-coaching',
  'drafts.page-all-in-one-coaching',
];

const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    _rev,
    "fixed": sections[_key == "results"][0].resultCards.customerSeelenGruen,
    "legacy": sections[_key == "results"][0].cards[_key == "customer-seelen-gruen"][0],
    "aio": sections[_key == "resultate"][0].customerResults.customers.seelenGruen
  }`,
  { ids },
);

for (const requiredId of ['homePage', 'page-all-in-one-coaching']) {
  if (!documents.some(({ _id }) => _id === requiredId)) {
    throw new Error(`Published document ${requiredId} not found in the production dataset.`);
  }
}

const homeDocuments = documents.filter(({ fixed }) => fixed);
const aioDocuments = documents.filter(({ aio }) => aio);
if (!homeDocuments.length || !aioDocuments.length) {
  throw new Error('The Seelen Grün cards are missing from the homepage or AIO page.');
}

function updateFixedCard(card, imageAssetId = 'dry-run-image-asset') {
  const currentBadges = Array.isArray(card.badges) ? card.badges : [];
  let badgeIndex = 0;
  const imagesWithBadges = (Array.isArray(card.images) ? card.images : []).map((image) => {
    const badge = image?.hasBadge === false ? undefined : currentBadges[badgeIndex++];
    return { image, badge };
  });

  const retained = imagesWithBadges.filter(({ image }) => image?._key !== proofKey);
  const images = retained.map(({ image }) => {
    if (image?._key === 'seelen-gruen-profile') {
      return { ...image, hasBadge: true, badgePosition: 'top-right' };
    }
    if (image?._key === 'seelen-gruen-testreel-260k') {
      const { badgePosition: _badgePosition, ...organicProof } = image;
      return { ...organicProof, hasBadge: false };
    }
    return image;
  });
  images.push({
    _type: 'fixedProofImage',
    _key: proofKey,
    image: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: imageAssetId },
      alt: proofAlt,
    },
    hasBadge: true,
    badgePosition: 'top-right',
    crop: 'none',
  });

  const currentViewsBadge = retained.find(
    ({ image }) => image?._key === 'seelen-gruen-reel-557k',
  )?.badge;
  const badges = [
    organicBadge,
    typeof currentViewsBadge === 'string' && currentViewsBadge.trim()
      ? currentViewsBadge
      : viewsBadge,
    proofBadge,
  ];

  return { ...card, badges, images };
}

function updateLegacyCard(card, imageAssetId = 'dry-run-image-asset') {
  if (!card) return card;
  const images = (Array.isArray(card.images) ? card.images : [])
    .filter((image) => image?._key !== proofKey)
    .map((image) => {
      if (image?._key === 'seelen-gruen-profile') {
        return { ...image, badge: organicBadge, badgePosition: 'top-right' };
      }
      if (image?._key === 'seelen-gruen-testreel-260k') {
        const { badge: _badge, badgePosition: _badgePosition, ...organicProof } = image;
        return organicProof;
      }
      return image;
    });
  images.push({
    _type: 'proofImage',
    _key: proofKey,
    image: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: imageAssetId },
      alt: proofAlt,
    },
    badge: proofBadge,
    badgePosition: 'top-right',
    crop: 'none',
  });
  return { ...card, images };
}

const summary = {
  mode: DRY_RUN ? 'dry-run' : 'updated',
  homeDocuments: homeDocuments.map(({ _id, fixed, legacy }) => ({
    _id,
    currentImages: fixed.images?.length ?? 0,
    currentBadges: fixed.badges ?? [],
    profileHasBadge: fixed.images?.find((image) => image?._key === 'seelen-gruen-profile')?.hasBadge !== false,
    profileBadgePosition: fixed.images?.find((image) => image?._key === 'seelen-gruen-profile')?.badgePosition ?? null,
    organicProofHasBadge: fixed.images?.find((image) => image?._key === 'seelen-gruen-testreel-260k')?.hasBadge !== false,
    followerProofPresent: fixed.images?.some((image) => image?._key === proofKey) ?? false,
    afterImages: updateFixedCard(fixed).images.length,
    afterBadges: updateFixedCard(fixed).badges,
    afterProfileHasBadge: updateFixedCard(fixed).images.find((image) => image?._key === 'seelen-gruen-profile')?.hasBadge !== false,
    afterOrganicProofHasBadge: updateFixedCard(fixed).images.find((image) => image?._key === 'seelen-gruen-testreel-260k')?.hasBadge !== false,
    legacyImages: legacy?.images?.length ?? 0,
    legacyProfileBadge: legacy?.images?.find((image) => image?._key === 'seelen-gruen-profile')?.badge ?? null,
    legacyOrganicProofBadge: legacy?.images?.find((image) => image?._key === 'seelen-gruen-testreel-260k')?.badge ?? null,
    legacyFollowerBadge: legacy?.images?.find((image) => image?._key === proofKey)?.badge ?? null,
  })),
  aioDocuments: aioDocuments.map(({ _id }) => _id),
  aioBadges: AIO_CUSTOMER_RESULTS.customers.seelenGruen.badges,
};

const existingAsset = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{
    _id,
    originalFilename,
    "width": metadata.dimensions.width,
    "height": metadata.dimensions.height
  }`,
  { filename },
);
summary.asset = existingAsset ?? { originalFilename: filename, status: 'not uploaded yet' };

if (DRY_RUN) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (!existsSync(sourcePath)) {
  throw new Error(`Follower proof image not found: ${sourcePath}`);
}
const assetId = existingAsset?._id
  ?? (await client.assets.upload('image', createReadStream(sourcePath), { filename }))._id;

const transaction = client.transaction();
for (const document of homeDocuments) {
  const fields = {
    'sections[_key=="results"].resultCards.customerSeelenGruen': updateFixedCard(document.fixed, assetId),
  };
  if (document.legacy) {
    fields['sections[_key=="results"].cards[_key=="customer-seelen-gruen"]'] =
      updateLegacyCard(document.legacy, assetId);
  }
  transaction.patch(client.patch(document._id).ifRevisionId(document._rev).set(fields));
}
for (const document of aioDocuments) {
  transaction.patch(
    client.patch(document._id).ifRevisionId(document._rev).set({
      'sections[_key=="resultate"].customerResults.customers.seelenGruen':
        AIO_CUSTOMER_RESULTS.customers.seelenGruen,
    }),
  );
}

const result = await transaction.commit();
console.log(JSON.stringify({ ...summary, assetId, transactionId: result.transactionId }, null, 2));
