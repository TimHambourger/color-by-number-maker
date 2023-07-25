/**
 * Copyright 2023 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

import { RgbColor } from "./color";
import { CentroidList, chooseAtRandomWithWeights } from "./kMeansPlusPlus";

/**
 * Assign a color to a single color-by-number box, choosing from the list of resolved colors.
 * @param samplesForBox The colors sampled from the given box.
 * @param resolvedColors The list of resolved colors to choose from.
 * @param exponent A number specifying how biased the algorithm should be towards colors that are more prevalent than
 * others. 0 indicates no bias; of the resolved colors detected for the given box, all have an equal chance of being
 * chosen. 1 indicates that a color detected in N samples is N times more likely to be chosen than a color detected in
 * merely one sample. 2 indicates that a color detected in N samples is N^2 times more likely to be chosen than a color
 * detected in merely one sample. Etc for positive numbers. Negative numbers mean that the algorithm is biased AGAINST
 * prevalent colors; a color detected in 2 or more samples would be LESS likely to be chosen than a color detected in
 * merely one sample.
 * @returns The 0-based index within the `resolvedColors` array of the chosen color.
 */
export function assignColorToBox(samplesForBox: RgbColor[], resolvedColors: RgbColor[], exponent: number) {
  const centroids = new CentroidList(resolvedColors.map((color) => color.toVector()));
  const numOccurrences = resolvedColors.map(() => 0);
  for (let sample of samplesForBox) {
    numOccurrences[centroids.classify(sample.toVector())]++;
  }
  const chosenIndex = chooseAtRandomWithWeights(resolvedColors, (_, idx) =>
    numOccurrences[idx] > 0 ? Math.pow(numOccurrences[idx], exponent) : 0,
  );
  if (chosenIndex < 0) {
    throw new Error("The samples array must contain at least one sample.");
  }
  return chosenIndex;
}
