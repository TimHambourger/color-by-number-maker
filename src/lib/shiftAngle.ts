/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

/**
 * Shift the given angle by a multiple of 360 degrees so that it falls within the range starting at `rangeStart` degrees
 * (inclusive) and ending at `rangeStart + 360` degrees (exclusive).
 * @param angleInDegrees The ange to shift, in degrees.
 * @param rangeStart The start of the target range, in degrees.
 * @returns The shifted angle, in degrees.
 */
export const shiftAngle = (angleInDegrees: number, rangeStart: number) =>
  angleInDegrees - 360 * Math.floor((angleInDegrees - rangeStart) / 360);
