/**
 * Copyright 2022 - 2023 Tim Hambourger
 *
 * This file is part of Color by Number Maker.
 *
 * Color by Number Maker is free software: you can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * Color by Number maker is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with Color by Number Maker. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import {
  PointTransformer,
  WeightFn,
  computeVariance,
  euclideanDistanceSquared,
  findCentroids,
} from "lib/kMeansPlusPlus";
import { ResolveColorsRequest, ResolveColorsResponse } from "./api";
import { RgbVector } from "lib/color";

onmessage = ({
  data: { imageWidth, imageHeight, numBoxesWide, sampledColors, maxColors, pixelLocationExponent },
}: MessageEvent<ResolveColorsRequest>) => {
  const numBoxesHigh = Math.floor(sampledColors.length / numBoxesWide);
  const boxWeights = sampledColors.map((_, boxIndex) => {
    const boxRow = Math.floor(boxIndex / numBoxesWide);
    const boxCol = boxIndex % numBoxesWide;
    // TODO: Could certainly add flexibility to consider OTHER emphasized points other than the center of the image, and
    // could even add flexibility to specify MULTIPLE emphasized points with different exponents for each one.
    const squareDistanceOfBoxCenterFromImageCenter = euclideanDistanceSquared(
      [((boxCol + 0.5) * imageWidth) / numBoxesWide, ((boxRow + 0.5) * imageHeight) / numBoxesHigh],
      [imageWidth / 2, imageHeight / 2],
    );
    // Add one to the base of this expression so that the base is always positive. Divide pixelLocationExponent by 2 to
    // counteract the implied exponent of 2 left over from taking the SQUARED Euclidean distance. Then take the negative
    // of that b/c we want large pixelLocationExponent values to correlate with a STRONGER weight given towards samples
    // near the center of the image.
    return Math.pow(squareDistanceOfBoxCenterFromImageCenter + 1, -pixelLocationExponent / 2);
  });
  const allSamples = sampledColors.flatMap((colorsForBox, boxIndex) =>
    colorsForBox.map((color) => [color, boxIndex] as const),
  );
  const coordsFn: PointTransformer<typeof allSamples[number], RgbVector> = ([color]) => color;
  const weightFn: WeightFn<typeof allSamples[number]> = ([, boxIndex]) => boxWeights[boxIndex];
  const centroids = findCentroids(allSamples, maxColors, coordsFn, { weightFn });
  const response: ResolveColorsResponse = {
    colors: centroids.centroids,
    variance: computeVariance(allSamples, centroids, coordsFn, { weightFn }),
  };
  postMessage(response);
};
