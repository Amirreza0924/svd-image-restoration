/**
 * @param t - The current time, typically normalized between 0 and 1.
 * @returns The eased value corresponding to the input time.
 */
export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/**
 * @param t - The current time, typically normalized between 0 and 1.
 * @returns The eased value corresponding to the input time.
 */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
