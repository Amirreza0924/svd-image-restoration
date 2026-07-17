import { computeSVD, reconstructFromSVD, type SVDResult } from "svd.ts";
import {
  imageDataToChannels,
  channelsToImageData,
  matrixEnergy,
} from "./matrix";
import { buildKStops, findEffectiveK } from "./kStops";
import type { EngineRequest, EngineResponse } from "./types";

interface WorkerScope {
  postMessage(message: EngineResponse): void;
  onmessage: ((event: MessageEvent<EngineRequest>) => void) | null;
}

declare const self: WorkerScope;

const MAX_K_CANDIDATE = 100;
const ENERGY_THRESHOLD = 0.995;

self.onmessage = async (event: MessageEvent<EngineRequest>) => {
  const { source, maxDimension } = event.data;

  try {
    const bitmap = await loadBitmap(source);
    const { width, height } = fitDimensions(
      bitmap.width,
      bitmap.height,
      maxDimension,
    );

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire a 2D canvas context.");

    ctx.drawImage(bitmap, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { r, g, b } = imageDataToChannels(imageData);

    const kMaxCandidate = Math.min(MAX_K_CANDIDATE, width, height);
    const totalEnergy = matrixEnergy(r) + matrixEnergy(g) + matrixEnergy(b);

    const channels = [r, g, b];
    const decompositions: SVDResult[] = channels.map((matrix) =>
      computeSVD({ A: matrix, k: kMaxCandidate }),
    );

    const kEffectiveMax = findEffectiveK(
      decompositions.map((d) => d.S),
      totalEnergy,
      kMaxCandidate,
      ENERGY_THRESHOLD,
    );

    const stops = buildKStops(kEffectiveMax);

    const stopPromises = stops.map(async (k, i) => {
      const [rk, gk, bk] = decompositions.map((d) =>
        reconstructFromSVD({
          U: d.U.map((row) => row.slice(0, k)),
          S: d.S.slice(0, k),
          V: d.V.slice(0, k),
        }),
      );

      const outImageData = channelsToImageData(rk, gk, bk, width, height);
      const outCanvas = new OffscreenCanvas(width, height);
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) throw new Error("Could not acquire a 2D canvas context.");

      outCtx.putImageData(outImageData, 0, 0);

      const blob = await outCanvas.convertToBlob({
        type: "image/webp",
        quality: 0.92,
      });

      postResponse({
        type: "stop",
        k,
        kEffectiveMax,
        index: i,
        total: stops.length,
        blob,
      });
    });

    await Promise.all(stopPromises);

    postResponse({ type: "done", kEffectiveMax, width, height });
  } catch (error) {
    postResponse({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown engine error",
    });
  }
};

function postResponse(response: EngineResponse) {
  self.postMessage(response);
}

async function loadBitmap(source: File | Blob | string): Promise<ImageBitmap> {
  if (typeof source === "string") {
    const response = await fetch(source);
    const blob = await response.blob();
    return createImageBitmap(blob);
  }
  return createImageBitmap(source);
}

function fitDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
