import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { computeSVD, reconstructFromSVD } from "svd.ts";
import { matrixEnergy } from "../src/engine/matrix.js";
import { buildKStops, findEffectiveK } from "../src/engine/kStops.js";

const MAX_K_CANDIDATE = 100;
const ENERGY_THRESHOLD = 0.999;

function bufferToChannels(
  data: Buffer | Uint8Array,
  width: number,
  height: number,
) {
  const r: number[][] = [];
  const g: number[][] = [];
  const b: number[][] = [];

  for (let y = 0; y < height; y++) {
    const rowR = new Array<number>(width);
    const rowG = new Array<number>(width);
    const rowB = new Array<number>(width);

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rowR[x] = data[i];
      rowG[x] = data[i + 1];
      rowB[x] = data[i + 2];
    }

    r.push(rowR);
    g.push(rowG);
    b.push(rowB);
  }

  return { r, g, b };
}

function channelsToBuffer(
  r: number[][],
  g: number[][],
  b: number[][],
  width: number,
  height: number,
) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = Math.max(0, Math.min(255, r[y][x]));
      data[i + 1] = Math.max(0, Math.min(255, g[y][x]));
      data[i + 2] = Math.max(0, Math.min(255, b[y][x]));
      data[i + 3] = 255;
    }
  }
  return data;
}

async function run() {
  const sourceImage = path.join(
    process.cwd(),
    "public",
    "MRI_of_Human_Brain.webp",
  );
  const outputDir = path.join(process.cwd(), "public", "hero-stops");

  await fs.mkdir(outputDir, { recursive: true });

  console.log("Loading image...");
  const image = sharp(sourceImage);
  const metadata = await image.metadata();
  const maxDimension = 256;

  let scale = 1;
  if (
    metadata.width &&
    metadata.height &&
    (metadata.width > maxDimension || metadata.height > maxDimension)
  ) {
    scale = maxDimension / Math.max(metadata.width, metadata.height);
  }
  const width = Math.max(1, Math.round((metadata.width || 1) * scale));
  const height = Math.max(1, Math.round((metadata.height || 1) * scale));

  const { data, info } = await image
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Resized to ${info.width}x${info.height}`);

  const { r, g, b } = bufferToChannels(data, info.width, info.height);

  const kMaxCandidate = Math.min(MAX_K_CANDIDATE, info.width, info.height);
  const totalEnergy = matrixEnergy(r) + matrixEnergy(g) + matrixEnergy(b);

  console.log("Computing SVD...");
  const channels = [r, g, b];
  const decompositions = channels.map((matrix) =>
    computeSVD({ A: matrix, k: kMaxCandidate }),
  );

  const kEffectiveMax = findEffectiveK(
    decompositions.map((d) => d.S),
    totalEnergy,
    kMaxCandidate,
    ENERGY_THRESHOLD,
  );

  const stops = buildKStops(kEffectiveMax);
  console.log(
    `Generated ${stops.length} stops. Max effective K = ${kEffectiveMax}`,
  );

  const stopRecords = [];

  for (let i = 0; i < stops.length; i++) {
    const k = stops[i];
    console.log(`Processing stop ${i + 1}/${stops.length} (k=${k})...`);

    const [rk, gk, bk] = decompositions.map((d) =>
      reconstructFromSVD({
        U: d.U.map((row) => row.slice(0, k)),
        S: d.S.slice(0, k),
        V: d.V.slice(0, k),
      }),
    );

    const outBuffer = channelsToBuffer(rk, gk, bk, info.width, info.height);
    const filename = `stop-${i}.webp`;
    const filepath = path.join(outputDir, filename);

    await sharp(outBuffer, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .webp({ quality: 92 })
      .toFile(filepath);

    stopRecords.push({
      k,
      src: `/hero-stops/${filename}`,
    });
  }

  const manifest = {
    stops: stopRecords,
    kEffectiveMax,
    width: info.width,
    height: info.height,
  };

  await fs.writeFile(
    path.join(process.cwd(), "src", "heroManifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    "Done! Precalculated images saved to public/hero-stops/ and manifest saved to src/heroManifest.json",
  );
}

run().catch(console.error);
