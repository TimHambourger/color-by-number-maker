import { computeVariance, findCentroids } from "lib/kMeansPlusPlus";
import { ResolveColorsRequest, ResolveColorsResponse } from "./api";

onmessage = ({ data: { averagedColors, maxColors } }: MessageEvent<ResolveColorsRequest>) => {
  const centroids = findCentroids(averagedColors, maxColors);
  const response: ResolveColorsResponse = {
    colors: centroids.centroids,
    variance: computeVariance(averagedColors, centroids),
  };
  postMessage(response);
};
