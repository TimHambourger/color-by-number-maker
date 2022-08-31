/**
 * Constrain a number to be between two bounds.
 * @param value The number to constrain
 * @param min The minimum allowed value (inclusive)
 * @param max The maximum allowed value (inclusive)
 * @returns The constrained number
 */
export const constrain = (value: number, min: number, max: number) => {
  if (max < min) {
    throw new Error(`Invalid min and max parameters ${min} and ${max}. Must have max >= min.`);
  }
  return Math.min(Math.max(value, min), max);
};
