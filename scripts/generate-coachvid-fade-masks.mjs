import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const width = 256;
const height = 1024;
const maxJitter = 0.018;
const outputDir = path.resolve('src/assets/masks');

function hash(x, y) {
  let value = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function smootherStep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function createBlueNoise() {
  const source = new Float64Array(width * height);
  const horizontalBlur = new Float64Array(width * height);
  const blueNoise = new Float64Array(width * height);
  const weights = [1, 4, 6, 4, 1];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      source[y * width + x] = hash(x, y);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let offset = -2; offset <= 2; offset += 1) {
        const wrappedX = (x + offset + width) % width;
        sum += source[y * width + wrappedX] * weights[offset + 2];
      }
      horizontalBlur[y * width + x] = sum / 16;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let offset = -2; offset <= 2; offset += 1) {
        const clampedY = Math.max(0, Math.min(height - 1, y + offset));
        sum += horizontalBlur[clampedY * width + x] * weights[offset + 2];
      }
      const index = y * width + x;
      blueNoise[index] = Math.max(-1, Math.min(1, (source[index] - sum / 16) * 2.5));
    }
  }

  // Every row uses the exact same, zero-mean value distribution. Only the
  // horizontal order changes. This prevents the dither itself from changing
  // the average opacity from one row to the next and becoming a visible band.
  for (let y = 0; y < height; y += 1) {
    const ranked = Array.from({ length: width }, (_, x) => ({
      x,
      value: blueNoise[y * width + x],
    })).sort((a, b) => a.value - b.value);

    for (let rank = 0; rank < width; rank += 1) {
      blueNoise[y * width + ranked[rank].x] = ((rank + 0.5) / width) * 2 - 1;
    }
  }

  return blueNoise;
}

async function createOverlay(fileName, fadeEnd, blueNoise) {
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const position = y / (height - 1);
    const t = Math.min(1, position / fadeEnd);
    const fade = position >= fadeEnd ? 1 : smootherStep(t);
    const targetAlpha = 1 - fade * 0.2;
    const envelope = position >= fadeEnd ? 0 : Math.sin(Math.PI * t) ** 0.7;
    const targetAlpha8 = targetAlpha * 255;
    const alphaRow = new Uint8Array(width);
    const residuals = new Float64Array(width);
    let alphaSum = 0;

    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const rawAlpha = Math.max(
        0,
        Math.min(255, targetAlpha8 + blueNoise[index] * maxJitter * 255 * envelope),
      );
      const alpha = Math.round(rawAlpha);

      alphaRow[x] = alpha;
      residuals[x] = rawAlpha - alpha;
      alphaSum += alpha;
    }

    // Keep the mean opacity on the mathematical fade curve to within 1/256
    // of an alpha step. The correction is distributed where rounding error is
    // smallest, so it cannot form a bright or dark horizontal line.
    let correction = Math.round(targetAlpha8 * width) - alphaSum;
    const correctionOrder = Array.from({ length: width }, (_, x) => x).sort((a, b) =>
      correction > 0 ? residuals[b] - residuals[a] : residuals[a] - residuals[b],
    );

    for (const x of correctionOrder) {
      if (correction === 0) break;
      if (correction > 0 && alphaRow[x] < 255) {
        alphaRow[x] += 1;
        correction -= 1;
      } else if (correction < 0 && alphaRow[x] > 0) {
        alphaRow[x] -= 1;
        correction += 1;
      }
    }

    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const pixelIndex = index * 4;

      pixels[pixelIndex] = 12;
      pixels[pixelIndex + 1] = 12;
      pixels[pixelIndex + 2] = 12;
      pixels[pixelIndex + 3] = alphaRow[x];
    }
  }

  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(path.join(outputDir, fileName));
}

await mkdir(outputDir, { recursive: true });
const blueNoise = createBlueNoise();
await Promise.all([
  createOverlay('coachvid-overlay-desktop.png', 0.45, blueNoise),
  createOverlay('coachvid-overlay-mobile.png', 0.3, blueNoise),
]);
