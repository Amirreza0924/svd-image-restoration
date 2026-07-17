/** Splits RGBA pixel data into three independent per-channel matrices. */
export function imageDataToChannels(imageData: ImageData): {
  r: number[][];
  g: number[][];
  b: number[][];
} {
  const { data, width, height } = imageData;
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

/** Recombines three per-channel matrices back into opaque RGBA pixel data. */
export function channelsToImageData(
  r: number[][],
  g: number[][],
  b: number[][],
  width: number,
  height: number,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = r[y][x];
      data[i + 1] = g[y][x];
      data[i + 2] = b[y][x];
      data[i + 3] = 255;
    }
  }

  return new ImageData(data, width, height);
}

/** Sum of squared entries — the Frobenius norm squared, i.e. total "energy". */
export function matrixEnergy(matrix: number[][]): number {
  let sum = 0;
  for (const row of matrix) {
    for (const value of row) {
      sum += value * value;
    }
  }
  return sum;
}
