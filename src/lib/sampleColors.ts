/**
 * Copyright 2023 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

import { RgbaColor, RgbColor } from "./color";

/**
 * Sample the colors present in the given image to produce an initial set of colors that can be used as input for
 * downstream color resolution.
 * @param image The image from which to sample colors.
 * @param numBoxesWide The width of the desired color-by-number sheet in boxes.
 * @param numBoxesHigh The height of the desired color-by-number sheet in boxes.
 * @param samplesPerBox The number of samples to collect per box.
 * @param backgroundColor The background color to use for transparent pixels. (Only relevant if the given image contains
 * transparent pixels.)
 * @returns An array of arrays of `RgbColor` instances. Each inner array holds the sampled colors for a given box. The
 * outer array iterates through boxes row by row.
 */
export function sampleColors(
  image: ImageData,
  numBoxesWide: number,
  numBoxesHigh: number,
  samplesPerBox: number,
  backgroundColor: RgbColor,
) {
  if (
    !Number.isSafeInteger(numBoxesWide) ||
    !Number.isSafeInteger(numBoxesHigh) ||
    numBoxesWide <= 0 ||
    numBoxesHigh <= 0
  ) {
    throw new Error("numBoxesWide and numBoxesHigh must both be positive integers.");
  }
  if (!Number.isSafeInteger(samplesPerBox) || samplesPerBox <= 0) {
    throw new Error("samplesPerBox must be a positive integer.");
  }

  const samples: RgbColor[][] = [];
  for (let boxIndex = 0; boxIndex < numBoxesWide * numBoxesHigh; boxIndex++) {
    const boxRow = Math.floor(boxIndex / numBoxesWide);
    const boxCol = boxIndex % numBoxesWide;
    const minPixelRowInclusive = Math.ceil(boxRow * (image.height / numBoxesHigh));
    const minPixelColInclusive = Math.ceil(boxCol * (image.width / numBoxesWide));
    const maxPixelRowExclusive = Math.max(
      Math.floor((boxRow + 1) * (image.height / numBoxesHigh)),
      minPixelRowInclusive + 1,
    );
    const maxPixelColExclusive = Math.max(
      Math.floor((boxCol + 1) * (image.width / numBoxesWide)),
      minPixelColInclusive + 1,
    );

    const samplesForBox: RgbColor[] = [];

    for (let i = 0; i < samplesPerBox; i++) {
      const samplePixelRow = Math.floor(
        Math.random() * (maxPixelRowExclusive - minPixelRowInclusive) + minPixelRowInclusive,
      );
      const samplePixelCol = Math.floor(
        Math.random() * (maxPixelColExclusive - minPixelColInclusive) + minPixelColInclusive,
      );
      const samplePixelIndex = samplePixelRow * image.width + samplePixelCol;
      samplesForBox.push(
        new RgbaColor(
          image.data[4 * samplePixelIndex],
          image.data[4 * samplePixelIndex + 1],
          image.data[4 * samplePixelIndex + 2],
          image.data[4 * samplePixelIndex + 3],
        ).toRgb(backgroundColor),
      );
    }

    samples.push(samplesForBox);
  }

  return samples;
}
