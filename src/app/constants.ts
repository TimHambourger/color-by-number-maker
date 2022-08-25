import { RgbColor } from "../lib/color";

export const IMPLIED_BACKGROUND_COLOR =
  RgbColor.fromHexCode(process.env.REACT_APP_IMPLIED_BACKGROUND_COLOR || "#fff") ||
  (() => {
    throw new Error(
      `Unable to parse REACT_APP_IMPLIED_BACKGROUND_COLOR value '${process.env.REACT_APP_IMPLIED_BACKGROUND_COLOR}'.`,
    );
  })();

export const BEST_N_KMEANS_OF = +(process.env.REACT_APP_BEST_N_KMEANS_OF || 6);
if (isNaN(BEST_N_KMEANS_OF)) {
  throw new Error(
    `Unable to parse REACT_APP_BEST_N_KMEANS_OF value '${process.env.REACT_APP_BEST_N_KMEANS_OF}'.`,
  );
}
if (BEST_N_KMEANS_OF < 1) {
  throw new Error(
    `REACT_APP_BEST_N_KMEANS_OF value must be positive (was '${process.env.REACT_APP_BEST_N_KMEANS_OF}').`,
  );
}
