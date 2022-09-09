import { RgbVector } from "lib/color";

export interface ResolveColorsRequest {
  averagedColors: readonly RgbVector[];
  maxColors: number;
}

export interface ResolveColorsResponse {
  colors: readonly RgbVector[];
  variance: number;
}
