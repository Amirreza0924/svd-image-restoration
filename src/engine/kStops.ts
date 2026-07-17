/**
 * Proportional template (out of 100) used to derive curated k-stops for any
 * kEffectiveMax — denser at low k, where each added singular value changes
 * the image dramatically, sparser at high k, where changes are subtle.
 */
const K_STOP_TEMPLATE = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 26, 30, 35, 40, 50, 60, 75, 90, 100,
];

/** Scales the curated template to fit a specific effective k ceiling. */
export function buildKStops(kEffectiveMax: number): number[] {
  const scaled = K_STOP_TEMPLATE.map((k) =>
    Math.max(1, Math.min(kEffectiveMax, Math.round((k / 100) * kEffectiveMax))),
  );

  const stops = Array.from(new Set(scaled)).sort((a, b) => a - b);

  if (stops[0] !== 1) stops.unshift(1);
  if (stops[stops.length - 1] !== kEffectiveMax) stops.push(kEffectiveMax);

  return stops;
}

/**
 * Finds the smallest k (up to kMaxCandidate) at which cumulative singular
 * value energy — summed across all channels — crosses `threshold` (a
 * fraction of total signal energy). Falls back to kMaxCandidate if the
 * threshold is never reached, e.g. for very high-detail/noisy images.
 */
export function findEffectiveK(
  singularValuesPerChannel: number[][],
  totalEnergy: number,
  kMaxCandidate: number,
  threshold = 0.995,
): number {
  let cumulative = 0;

  for (let k = 1; k <= kMaxCandidate; k++) {
    for (const values of singularValuesPerChannel) {
      const s = values[k - 1] ?? 0;
      cumulative += s * s;
    }

    if (cumulative / totalEnergy >= threshold) {
      return k;
    }
  }

  return kMaxCandidate;
}
