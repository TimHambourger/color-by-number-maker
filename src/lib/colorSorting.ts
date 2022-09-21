import { HslColor } from "./color/hslColor";
import { RgbColor, RgbVector } from "./color/rgbColor";
import { shiftAngle } from "./shiftAngle";

const MAX_GRAY_CRHOMA = 0.075;

// Effect is of 6 hue buckets, each centered on one of the 6 primary and secondary colors in RGB space: red, yellow,
// green, cyan, blue, and magenta.
const NUM_HUE_BUCKETS = 6;

const computeHueBucket = (hue: number) =>
  Math.floor(((shiftAngle(hue, -180 / NUM_HUE_BUCKETS) + 180 / NUM_HUE_BUCKETS) / 360) * NUM_HUE_BUCKETS);

/**
 * Given an array of colors, compute a sort order that attempts to keep "similar" colors close together. This function
 * does **not** modify the provided `colors` array.
 * @param colors The array of colors for which to compute a sort order.
 * @returns A new array whose entries are indices from the provided `colors` array in a desirable sort order. The new
 * array will always have length equal to the that of the provided `colors` array.
 */
export const sortColorsIntuitively = (colors: readonly RgbVector[]) => {
  const hslColors = colors.map((color) => HslColor.fromRgb(RgbColor.fromVector(color)));
  const indices = colors.map((_, i) => i);

  // Indices within the original colors array of gray colors, in final sort order
  const grayIndices = indices
    .filter((index) => hslColors[index].chroma <= MAX_GRAY_CRHOMA)
    .sort(
      (index1, index2) =>
        // Sort grays by lightness only
        hslColors[index1].lightness - hslColors[index2].lightness,
    );

  // Indices within the original colors array of non-gray colors, in final sort order.
  const nonGrayIndices = indices
    .filter((index) => hslColors[index].chroma > MAX_GRAY_CRHOMA)
    .sort(
      (index1, index2) =>
        // Sory by hue bucket...
        computeHueBucket(hslColors[index1].hue) - computeHueBucket(hslColors[index2].hue) ||
        // ...falling back to lightness within a given bucket
        hslColors[index1].lightness - hslColors[index2].lightness,
    );

  return [...grayIndices, ...nonGrayIndices];
};
