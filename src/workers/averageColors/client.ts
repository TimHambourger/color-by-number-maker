import { workerClient } from "../workerClient";
import { AverageColorsRequest, AverageColorsResponse } from "./api";

export const averageColorsInBackground = workerClient<AverageColorsRequest, AverageColorsResponse>(
  () => new Worker(new URL("./worker.ts", import.meta.url)),
);
