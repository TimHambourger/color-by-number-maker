/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

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

/**
 * Assert that a given number is nearly within a given range. Mainly intended for parameter validation scenarios where
 * we want to enforce a certain numerical range but we also want to tolerate small violations of that numerical range
 * that could be due to rounding errors.
 * @param value The number on which to perform assertions
 * @param min The minimum allowed value (inclusive)
 * @param max The maximum allowed value (inclusive)
 * @param delta The amount of deviation outside of the specified range to tolerate
 * @returns The `value` parameter constrained to the specified range
 */
export const assertNearlyInRange = (value: number, min: number, max: number, delta = 0.001) => {
  if (value < min - delta) {
    throw new Error(`value parameter ${value} is too far below min parameter ${min}. Must have value >= min - delta.`);
  }
  if (value > max + delta) {
    throw new Error(`value parameter ${value} is too far above max parameter ${max}. Must have value <= max + delta.`);
  }
  return constrain(value, min, max);
};
