/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

export const arrayEq = <T>(
  array1: readonly T[],
  array2: readonly T[],
  areItemsEqual: (item1: T, item2: T) => boolean = (item1, item2) => item1 === item2,
) => array1.length === array2.length && array1.every((item, idx) => areItemsEqual(item, array2[idx]));
