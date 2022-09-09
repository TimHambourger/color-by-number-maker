import { averageColors } from "lib/averageColors";
import { RgbColor } from "lib/color";
import { constrain } from "lib/constrain";
import { AverageColorsRequest, AverageColorsResponse } from "./api";

onmessage = ({ data: { imageData, boxesWide, boxesHigh, backgroundColor } }: MessageEvent<AverageColorsRequest>) => {
  const response: AverageColorsResponse = {
    averagedColors: averageColors(
      imageData,
      constrain(boxesWide, 1, imageData.width),
      constrain(boxesHigh, 1, imageData.height),
      RgbColor.fromVector(backgroundColor),
    ),
  };
  postMessage(response);
};
