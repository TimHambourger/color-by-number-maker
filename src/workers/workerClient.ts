/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is part of Color by Number Maker.
 *
 * Color by Number Maker is free software: you can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * Color by Number maker is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with Color by Number Maker. If not, see
 * <https://www.gnu.org/licenses/>.
 */

/**
 * A client harness for running simple Web Workers. Workers are assumed to receive a request in the form of a single
 * message and to return a single message in response.
 * @param workerFactory A callback that creates the worker. To leverage webpack's Web Worker support (see
 * https://webpack.js.org/guides/web-workers/), this callback should be of the form
 * ```
 * () => new Worker(new URL("./worker.ts", import.meta.url))
 * ```
 * @returns A callback that takes a request and an `AbortSignal` and returns a promise that resolves with the worker's
 * response, in the success case, or else rejects with an error in the event that the `AbortSignal` is aborted before
 * the worker returns a response.
 */
export const workerClient =
  <TRequest, TResponse>(
    // NOTE: It might be tempting to replace workerFactory with a param like `workerUrl: URL`, but this doesn't play
    // well with webpack's Web Worker support (see https://webpack.js.org/guides/web-workers/). In particular, webpack
    // needs to see the entire expression `new Worker(new URL("./worker.ts", import.meta.url))` at compile time,
    // otherwise it treats the referenced worker file as a standalone file and won't bundle in files imported by the
    // worker file or serve the resulting file with the correct MIME type.
    workerFactory: () => Worker,
  ) =>
  (request: TRequest, abortSignal: AbortSignal) =>
    new Promise<TResponse>((resolve, reject) => {
      if (abortSignal.aborted) {
        reject(new Error("Worker task was aborted."));
      } else {
        const worker = workerFactory();
        const onCancel = () => {
          worker.terminate();
          reject(new Error("Worker task was aborted."));
        };
        abortSignal.addEventListener("abort", onCancel);
        worker.onmessage = ({ data }) => {
          resolve(data);
          abortSignal.removeEventListener("abort", onCancel);
        };
        worker.postMessage(request);
      }
    });
