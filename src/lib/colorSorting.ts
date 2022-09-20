import { HslColor } from "./color/hslColor";
import { RgbColor, RgbVector } from "./color/rgbColor";
import { shiftAngle } from "./shiftAngle";

const MAX_GRAY_CRHOMA = 0.2;
const HUE_DELTA_TOLERANCE_DEGREES = 30;
const LIGHTNESS_DELTA_TOLERANCE = 0.1;

/**
 * Given an array of colors, compute a sort order that attempts to keep "similar" colors close together. This function
 * does **not** modify the provided `colors` array.
 * @param colors The array of colors for which to compute a sort order.
 * @returns A new array whose entries are indices from the provided `colors` array in a desirable sort order. The new
 * array will always have length equal to the that of the provided `colors` array.
 */
// TODO: Make me better. The resulting sort still isn't very intuitive visually.
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

  const nonGrayIndices = indices.filter((index) => hslColors[index].chroma > MAX_GRAY_CRHOMA);
  if (nonGrayIndices.length > 0) {
    // Basic idea is we wanna sort non-grays by hue then by lightness then by chroma. But there are a few wrinkles, the
    // biggest of which is that hue is an angle, so there's no natural way to decide which hues are "big" and which hues
    // are "small". What we'll do instead is look for an arbitrary cutoff point between big and small hues that
    // minimizes the risk that two provided colors with nearby hue values wind up on opposite sides of the cutoff point.

    // First sort by hue in the naive way, i.e. where a hue of 0 degrees is arbitrarily considered small and hues
    // approaching 360 degrees are arbitrarily considered large.
    nonGrayIndices.sort((index1, index2) => hslColors[index1].hue - hslColors[index2].hue);

    // Angle from one hue value to the next hue value going clockwise (i.e. the previous one in an increasing sort by
    // hue). Angles are always from 0 up to but excluding 360 and entries in this array parallel entries in
    // nonGrayIndices.
    const anglesFromPreviousHue = nonGrayIndices.map((indexInColors, indexInNonGrayIndices) =>
      shiftAngle(
        hslColors[indexInColors].hue -
          hslColors[nonGrayIndices[(indexInNonGrayIndices + nonGrayIndices.length - 1) % nonGrayIndices.length]].hue,
        0,
      ),
    );

    // Index within anglesFromPreviousHue of a maximum angle from the previous hue
    const indexOfMaxAngleFromPreviousHue = anglesFromPreviousHue.reduce(
      (bestIndexSoFar, nextAngle, nextIndex) =>
        nextAngle > anglesFromPreviousHue[bestIndexSoFar] ? nextIndex : bestIndexSoFar,
      0,
    );
    // We finally get our hue cutoff. It's a hue admitting the largest possible angle until the next distinct hue going
    // clockwise.
    const hueCutoff = hslColors[nonGrayIndices[indexOfMaxAngleFromPreviousHue]].hue;

    // Now sort nonGrayIndices for real, treating hueCutoff degrees as the smallest hue value, and also falling back to
    // lightness and chroma to make our comparison more selective.
    nonGrayIndices.sort((index1, index2) => {
      const color1 = hslColors[index1];
      const color2 = hslColors[index2];
      // Yes, we wanna shift the angles BEFORE subtracting them, not after. Shifting after subtracting, say into the
      // range starting at -180 degrees, would break transitivty of the resulting comparator function.
      const hueDelta = shiftAngle(color1.hue, hueCutoff) - shiftAngle(color2.hue, hueCutoff);
      return Math.abs(hueDelta) < HUE_DELTA_TOLERANCE_DEGREES
        ? Math.abs(color1.lightness - color2.lightness) < LIGHTNESS_DELTA_TOLERANCE
          ? // Chroma is tie breaker.
            color1.chroma - color2.chroma
          : // Lightness values are different enough to compare on lightness.
            color1.lightness - color2.lightness
        : // Shifted hue values are different enough to compare on hue.
          hueDelta;
    });
  }

  return [...grayIndices, ...nonGrayIndices];
};
