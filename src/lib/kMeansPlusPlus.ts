export type Vector = readonly number[];
export type ComputedVector<T extends Vector> = T | { [Index in keyof T]: number };
export type PointTransformer<TPoint, R> = (point: TPoint, idx: number) => R;
export type WeightFn<TPoint> = PointTransformer<TPoint, number>;

export interface KMeansWeightingOptions<TPoint> {
  weightFn?: WeightFn<TPoint>;
}

function readCoordinate(coords: Vector, axis: number) {
  return coords[axis] ?? 0;
}

export function euclideanDistanceSquared(coords1: Vector, coords2: Vector) {
  let ds = 0;
  for (let axis = 0; axis < Math.max(coords1.length, coords2.length); axis++) {
    ds +=
      (readCoordinate(coords1, axis) - readCoordinate(coords2, axis)) *
      (readCoordinate(coords1, axis) - readCoordinate(coords2, axis));
  }
  return ds;
}

export function sumVectors<T extends Vector>(coords1: T, coords2: T) {
  const sum: number[] = new Array(Math.max(coords1.length, coords2.length));
  for (let axis = 0; axis < Math.max(coords1.length, coords2.length); axis++) {
    sum[axis] = readCoordinate(coords1, axis) + readCoordinate(coords2, axis);
  }
  return sum as unknown as ComputedVector<T>;
}

export function scaleVector<T extends Vector>(coords: T, scale: number) {
  return coords.map((coord) => coord * scale) as unknown as ComputedVector<T>;
}

export function computeMean<T extends Vector>(
  dataPoints: readonly T[],
  options?: KMeansWeightingOptions<T>,
): ComputedVector<T>;
export function computeMean<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  coordsFn: PointTransformer<TPoint, TCoords>,
  options?: KMeansWeightingOptions<TPoint>,
): ComputedVector<TCoords>;
export function computeMean<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  coordsFnOrOptions?: PointTransformer<TPoint, TCoords> | KMeansWeightingOptions<TPoint>,
  options?: KMeansWeightingOptions<TPoint>,
) {
  const { coordsFn, options: { weightFn = uniformWeight } = {} } = unsafeParseCoordsFnAndOptions(
    coordsFnOrOptions,
    options,
  );
  let totalWeight = 0;
  for (let i = 0; i < dataPoints.length; i++) {
    totalWeight += weightFn(dataPoints[i], i);
  }

  if (totalWeight === 0) throw new Error("At least one data point must exist and have positive weight.");

  let summedVector = undefined;
  for (let i = 0; i < dataPoints.length; i++) {
    const coords = coordsFn(dataPoints[i], i);
    const weightedCoords = scaleVector(coords, weightFn(dataPoints[i], i));
    summedVector = summedVector === undefined ? weightedCoords : sumVectors(summedVector, weightedCoords);
  }

  return scaleVector(summedVector!, 1 / totalWeight);
}

export function simultaneousMeans<T extends Vector, K>(
  dataPoints: readonly T[],
  keyFn: PointTransformer<T, K>,
  options?: KMeansWeightingOptions<T>,
): Map<K, ComputedVector<T>>;
export function simultaneousMeans<TPoint, TCoords extends Vector, K>(
  dataPoints: readonly TPoint[],
  keyFn: PointTransformer<TPoint, K>,
  coordsFn: PointTransformer<TPoint, TCoords>,
  options?: KMeansWeightingOptions<TPoint>,
): Map<K, ComputedVector<TCoords>>;
export function simultaneousMeans<TPoint, TCoords extends Vector, K>(
  dataPoints: readonly TPoint[],
  keyFn: PointTransformer<TPoint, K>,
  coordsFnOrOptions?: PointTransformer<TPoint, TCoords> | KMeansWeightingOptions<TPoint>,
  options?: KMeansWeightingOptions<TPoint>,
) {
  const { coordsFn, options: { weightFn = uniformWeight } = {} } = unsafeParseCoordsFnAndOptions(
    coordsFnOrOptions,
    options,
  );
  const totalWeightByKey = new Map<K, number>();
  for (let i = 0; i < dataPoints.length; i++) {
    const key = keyFn(dataPoints[i], i);
    totalWeightByKey.set(key, (totalWeightByKey.get(key) ?? 0) + weightFn(dataPoints[i], i));
  }

  const summedVectorByKey = new Map<K, ComputedVector<TCoords>>();
  for (let i = 0; i < dataPoints.length; i++) {
    const key = keyFn(dataPoints[i], i);
    const coords = coordsFn(dataPoints[i], i);
    const weightedCoords = scaleVector(coords, weightFn(dataPoints[i], i));
    const prevSum = summedVectorByKey.get(key);
    summedVectorByKey.set(key, prevSum === undefined ? weightedCoords : sumVectors(prevSum, weightedCoords));
  }

  return new Map<K, ComputedVector<TCoords>>(
    Array.from(totalWeightByKey)
      .filter(([, weight]) => weight > 0)
      .map(([key, weight]) => [key, scaleVector(summedVectorByKey.get(key)!, 1 / weight)]),
  );
}

export function uniformWeight() {
  return 1;
}

function arrayEq<T>(arr1: readonly T[], arr2: readonly T[]) {
  return arr1.length === arr2.length && arr1.every((item, idx) => item === arr2[idx]);
}

export class CentroidList<T extends Vector> {
  constructor(readonly centroids: readonly ComputedVector<T>[]) {
    if (centroids.length === 0) {
      throw new Error("At least one centroid is required.");
    }
  }

  get length() {
    return this.centroids.length;
  }

  /**
   * Returns the 0-based index within the `centroids` array of the centroid that is nearest to the given coordinates.
   */
  classify(coords: ComputedVector<T>) {
    return this.centroids
      .map((centroid) => euclideanDistanceSquared(coords, centroid))
      .reduce(
        (currentMinIndex, nextDistance, idx, distances) =>
          nextDistance < distances[currentMinIndex] ? idx : currentMinIndex,
        0,
      );
  }

  /**
   * Returns the squared distance from the given coordinates to the nearest centroid.
   */
  distanceTo(coords: ComputedVector<T>) {
    return this.centroids
      .map((centroid) => euclideanDistanceSquared(coords, centroid))
      .reduce((currentMin, next) => (next < currentMin ? next : currentMin));
  }
}

export interface KMeansOptions<TPoint> extends KMeansWeightingOptions<TPoint> {
  maxIterations?: number;
}

export function findCentroids<T extends Vector>(
  dataPoints: readonly T[],
  numberOfCentroids: number,
  options?: KMeansOptions<T>,
): CentroidList<T>;
export function findCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFn: PointTransformer<TPoint, TCoords>,
  options?: KMeansOptions<TPoint>,
): CentroidList<TCoords>;
export function findCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFnOrOptions?: PointTransformer<TPoint, TCoords> | KMeansOptions<TPoint>,
  options?: KMeansOptions<TPoint>,
) {
  const { coordsFn, options: { maxIterations = 500, weightFn = uniformWeight } = {} } = unsafeParseCoordsFnAndOptions(
    coordsFnOrOptions,
    options,
  );

  let centroids = chooseInitialCentroids(dataPoints, numberOfCentroids, coordsFn, weightFn);
  let oldAssignments: number[] | undefined;

  for (let iter = 0; iter < maxIterations; iter++) {
    // eslint-disable-next-line no-loop-func
    const newAssignments = dataPoints.map((point, idx) => centroids.classify(coordsFn(point, idx)));
    if (oldAssignments && arrayEq(oldAssignments, newAssignments)) {
      return centroids;
    }

    const meansByCentroidIdx = simultaneousMeans(
      dataPoints,
      (_, dataPointIdx) => newAssignments[dataPointIdx],
      coordsFn,
      { weightFn },
    );
    const newCentroids: ComputedVector<TCoords>[] = [];
    for (let centroidIdx = 0; centroidIdx < centroids.length; centroidIdx++) {
      const mean = meansByCentroidIdx.get(centroidIdx);
      if (mean) newCentroids.push(mean);
    }

    centroids = new CentroidList(newCentroids);
    oldAssignments = newAssignments;
  }

  return centroids;
}

function chooseInitialCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFn: PointTransformer<TPoint, TCoords>,
  weightFn: WeightFn<TPoint>,
) {
  if (numberOfCentroids < 1) {
    throw new Error("Must request at least one centroid.");
  }
  const initialIndex = chooseAtRandomWithWeights(dataPoints, weightFn);
  if (initialIndex < 0) {
    throw new Error("At least one data point must exist and have positive weight.");
  }
  let centroids = new CentroidList([coordsFn(dataPoints[initialIndex], initialIndex)]);
  while (centroids.length < numberOfCentroids) {
    const nextIndex = chooseAtRandomWithWeights(
      dataPoints,
      // eslint-disable-next-line no-loop-func
      (point, idx) => weightFn(point, idx) * centroids.distanceTo(coordsFn(point, idx)),
    );

    // A negative nextIndex here means all remaining data points have weight 0
    // or are distance 0 from an already chosen initial centroid. In this case
    // we'll bail and output fewer centroids than requested.
    if (nextIndex < 0) break;

    centroids = new CentroidList([...centroids.centroids, coordsFn(dataPoints[nextIndex], nextIndex)]);
  }
  return centroids;
}

function chooseAtRandomWithWeights<T>(items: readonly T[], weightFn: WeightFn<T>) {
  const weights = items.map((item, idx) => weightFn(item, idx));
  const totalWeight = weights.reduce((total, next) => total + next, 0);
  const testValue = Math.random() * totalWeight;
  let weightSoFar = 0;
  for (let i = 0; i < weights.length; i++) {
    weightSoFar += weights[i];
    if (weightSoFar > testValue) return i;
  }
  return -1;
}

export function computeVariance<T extends Vector>(
  dataPoints: readonly T[],
  centroids: CentroidList<T>,
  options?: KMeansWeightingOptions<T>,
): number;
export function computeVariance<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  centroids: CentroidList<TCoords>,
  coordsFn: PointTransformer<TPoint, TCoords>,
  options?: KMeansWeightingOptions<TPoint>,
): number;
export function computeVariance<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  centroids: CentroidList<TCoords>,
  coordsFnOrOptions?: PointTransformer<TPoint, TCoords> | KMeansOptions<TPoint>,
  options?: KMeansWeightingOptions<TPoint>,
) {
  const { coordsFn, options: { weightFn = uniformWeight } = {} } = unsafeParseCoordsFnAndOptions(
    coordsFnOrOptions,
    options,
  );
  const squareDistances = dataPoints.map((point, idx) => [centroids.distanceTo(coordsFn(point, idx))] as const);
  return computeMean(dataPoints, (_, idx) => squareDistances[idx], { weightFn })[0];
}

function unsafeParseCoordsFnAndOptions<TPoint, TCoords, TOptions extends KMeansWeightingOptions<TPoint>>(
  coordsFnOrOptions: PointTransformer<TPoint, TCoords> | TOptions | undefined,
  options: TOptions | undefined,
) {
  const coordsFn =
    typeof coordsFnOrOptions === "function"
      ? coordsFnOrOptions
      : // This helper function is ONLY for cases where we know that the absence of the coordsFn param means that TPoint and
        // TCoords must be the same type. Hence why we consider this cast sound.
        (point: TPoint) => point as unknown as TCoords;
  const effectiveOptions = typeof coordsFnOrOptions === "function" ? options : coordsFnOrOptions;
  return { coordsFn, options: effectiveOptions };
}
