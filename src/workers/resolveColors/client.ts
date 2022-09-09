import { workerClient } from "../workerClient";
import { ResolveColorsRequest, ResolveColorsResponse } from "./api";

export const resolveColorsInBackground = workerClient<ResolveColorsRequest, ResolveColorsResponse>(
  () => new Worker(new URL("./worker.ts", import.meta.url)),
);
