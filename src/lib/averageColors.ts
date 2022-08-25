import { RgbaColor, RgbColor, RgbVector } from "./color";
import { simultaneousMeans } from "./kMeansPlusPlus";

export function averageColors(image: ImageData, numBoxesWide: number, numBoxesHigh: number, backgroundColor: RgbColor) {
  if (
    !Number.isSafeInteger(numBoxesWide) ||
    !Number.isSafeInteger(numBoxesHigh) ||
    numBoxesWide <= 0 ||
    numBoxesHigh <= 0
  ) {
    throw new Error("numBoxesWide and numBoxesHigh must both be positive integers.");
  }
  if (numBoxesWide > image.width || numBoxesHigh > image.height) {
    throw new Error("Requested boxes can't be smaller that the original pixel size.");
  }
  const rgbaColors: RgbaColor[] = [];
  for (let i = 0; i < image.data.length - 3; i += 4) {
    rgbaColors.push(new RgbaColor(image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3]));
  }
  const means = simultaneousMeans(
    rgbaColors.map((color) => color.toRgb(backgroundColor).toVector()),
    (_, i) => {
      const pixelRow = Math.floor(i / image.width);
      const pixelCol = i % image.width;
      const boxRow = Math.floor((pixelRow * numBoxesHigh) / image.height);
      const boxCol = Math.floor((pixelCol * numBoxesWide) / image.width);
      return boxRow * numBoxesWide + boxCol;
    },
  );
  const averagedColors: RgbVector[] = [];
  for (let i = 0; i < numBoxesWide * numBoxesHigh; i++) {
    averagedColors.push(means.get(i)!);
  }
  return averagedColors;
}
