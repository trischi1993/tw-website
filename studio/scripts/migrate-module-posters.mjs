import { createReadStream, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCliClient } from 'sanity/cli';

const DRY_RUN = process.argv.includes('--dry-run');
const client = getCliClient({ apiVersion: '2024-10-01' });
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const posters = [
  { key: 'modul-1', file: 'modul1-poster.jpg', alt: 'Video-Standbild für Modul 1: Social Media Fundament' },
  { key: 'modul-2', file: 'modul2-poster.jpg', alt: 'Video-Standbild für Modul 2: Social Media Strategien' },
  { key: 'modul-3', file: 'modul3-poster.jpg', alt: 'Video-Standbild für Modul 3: Erfolgsmessung und Optimierung' },
  { key: 'modul-4', file: 'modul4-poster.jpg', alt: 'Video-Standbild für Modul 4: Monetarisierung und Fallstudien' },
  { key: 'modul-5', file: 'modul5-poster.jpg', alt: 'Video-Standbild für Modul 5: Content-Produktion' },
].map((poster) => ({
  ...poster,
  path: path.join(repoRoot, 'public/videos', poster.file),
}));

for (const poster of posters) {
  if (!existsSync(poster.path)) throw new Error(`Poster file not found: ${poster.path}`);
}

const ids = ['page-all-in-one-coaching', 'drafts.page-all-in-one-coaching'];
const keys = posters.map(({ key }) => key);
const documents = await client.fetch(
  `*[_id in $ids]{
    _id,
    sections[_key in $keys]{
      _key,
      videoPoster,
      videoPosterImage{
        alt,
        asset->{ _id, url, originalFilename }
      }
    }
  }`,
  { ids, keys },
);

if (!documents.some(({ _id }) => _id === 'page-all-in-one-coaching')) {
  throw new Error('Published ALL-IN-ONE page not found in the production dataset.');
}

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        documents,
        uploads: posters.map(({ key, file, alt }) => ({ key, file, alt })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const assets = await Promise.all(
  posters.map(async ({ key, file, path: filePath, alt }) => {
    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename: `aio-${file}`,
      title: alt,
    });
    return { key, alt, assetId: asset._id, url: asset.url };
  }),
);

const transaction = client.transaction();
for (const { _id } of documents) {
  let patch = client.patch(_id);
  for (const { key, alt, assetId } of assets) {
    patch = patch.set({
      [`sections[_key=="${key}"].videoPosterImage`]: {
        _type: 'imageWithAlt',
        alt,
        asset: { _type: 'reference', _ref: assetId },
      },
    });
  }
  transaction.patch(patch);
}

const result = await transaction.commit();
console.log(
  JSON.stringify(
    {
      mode: 'updated',
      documents: documents.map(({ _id }) => _id),
      assets,
      transactionId: result.transactionId,
    },
    null,
    2,
  ),
);
