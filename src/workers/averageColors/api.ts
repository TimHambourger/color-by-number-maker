import { RgbVector } from "lib/color";

export interface AverageColorsRequest {
  imageData: ImageData;
  boxesWide: number;
  boxesHigh: number;
  backgroundColor: RgbVector;
}

export interface AverageColorsResponse {
  averagedColors: RgbVector[];
}
