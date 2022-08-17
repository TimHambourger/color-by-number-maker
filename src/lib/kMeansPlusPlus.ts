export type Vector = readonly number[];
export type ComputedVector<T extends Vector> =
  | T
  | { [Index in keyof T]: number };
export type DistanceFn<T extends Vector> = (
  coords1: ComputedVector<T>,
  coords2: ComputedVector<T>,
) => number;
export type CoordsFn<TPoint, TCoords> = (point: TPoint) => TCoords;
export type WeightFn<TPoint> = (point: TPoint) => number;

export function euclideanDistanceSquared(coords1: Vector, coords2: Vector) {
  let ds = 0;
  for (let axis = 0; axis < Math.max(coords1.length, coords2.length); axis++) {
    ds +=
      (readCoordinate(coords1, axis) - readCoordinate(coords2, axis)) *
      (readCoordinate(coords1, axis) - readCoordinate(coords2, axis));
  }
  return ds;
}

function readCoordinate(coords: Vector, axis: number) {
  return coords[axis] ?? 0;
}

function sumVectors<T extends Vector>(coords1: T, coords2: T) {
  const sum: number[] = new Array(Math.max(coords1.length, coords2.length));
  for (let axis = 0; axis < Math.max(coords1.length, coords2.length); axis++) {
    sum[axis] = readCoordinate(coords1, axis) + readCoordinate(coords2, axis);
  }
  return sum as unknown as ComputedVector<T>;
}

function scaleVector<T extends Vector>(coords: T, scale: number) {
  return coords.map((coord) => coord * scale) as unknown as ComputedVector<T>;
}

function arrayEq<T>(arr1: readonly T[], arr2: readonly T[]) {
  return (
    arr1.length === arr2.length && arr1.every((item, idx) => item === arr2[idx])
  );
}

function uniformWeight() {
  return 1;
}

export class CentroidList<T extends Vector> {
  constructor(
    readonly centroids: readonly ComputedVector<T>[],
    readonly distanceFn: DistanceFn<T>,
  ) {
    if (centroids.length === 0) {
      throw new Error("At least one centroid is required.");
    }
  }

  get length() {
    return this.centroids.length;
  }

  classify(coords: ComputedVector<T>) {
    return this.centroids
      .map((centroid) => this.distanceFn.call(undefined, coords, centroid))
      .reduce(
        (currentMinIndex, nextDistance, idx, distances) =>
          nextDistance < distances[currentMinIndex] ? idx : currentMinIndex,
        0,
      );
  }

  distanceTo(coords: ComputedVector<T>) {
    return this.centroids
      .map((centroid) => this.distanceFn.call(undefined, coords, centroid))
      .reduce((currentMin, next) => (next < currentMin ? next : currentMin));
  }
}

export interface KMeansOptions<TPoint, TCoords extends Vector> {
  maxIterations?: number;
  distanceFn?: DistanceFn<TCoords>;
  weightFn?: WeightFn<TPoint>;
}

export function findCentroids<T extends Vector>(
  dataPoints: readonly T[],
  numberOfCentroids: number,
  options?: KMeansOptions<T, T>,
): CentroidList<T>;
export function findCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFn: CoordsFn<TPoint, TCoords>,
  options?: KMeansOptions<TPoint, TCoords>,
): CentroidList<TCoords>;
export function findCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFnOrOptions?:
    | ((point: TPoint) => TCoords)
    | KMeansOptions<TPoint, TCoords>,
  options?: KMeansOptions<TPoint, TCoords>,
) {
  const coordsFn =
    typeof coordsFnOrOptions === "function"
      ? coordsFnOrOptions
      : // The only overload that makes coordsFn optional is the one that forces TPoint and TCoords to be the same type.
        // Hence why this cast is sound.
        (point: TPoint) => point as unknown as TCoords;
  const {
    maxIterations = 500,
    distanceFn = euclideanDistanceSquared,
    weightFn = uniformWeight,
  } = (typeof coordsFnOrOptions === "function" ? options : coordsFnOrOptions) ??
  {};

  let centroids = chooseInitialCentroids(
    dataPoints,
    numberOfCentroids,
    coordsFn,
    weightFn,
    distanceFn,
  );
  let oldAssignments: number[] | undefined;

  for (let iter = 0; iter < maxIterations; iter++) {
    // eslint-disable-next-line no-loop-func
    const newAssignments = dataPoints.map((point) =>
      centroids.classify(coordsFn(point)),
    );
    if (oldAssignments && arrayEq(oldAssignments, newAssignments)) {
      return centroids;
    }

    const groupWeights: (number | undefined)[] = new Array(centroids.length);
    for (
      let dataPointIdx = 0;
      dataPointIdx < dataPoints.length;
      dataPointIdx++
    ) {
      groupWeights[newAssignments[dataPointIdx]] =
        (groupWeights[newAssignments[dataPointIdx]] ?? 0) +
        weightFn(dataPoints[dataPointIdx]);
    }

    const summedVectors: (ComputedVector<TCoords> | undefined)[] = new Array(
      centroids.length,
    );
    for (
      let dataPointIdx = 0;
      dataPointIdx < dataPoints.length;
      dataPointIdx++
    ) {
      const coords = coordsFn(dataPoints[dataPointIdx]);
      const weightedCoords = scaleVector(
        coords,
        weightFn(dataPoints[dataPointIdx]),
      );
      const prevSum = summedVectors[newAssignments[dataPointIdx]];
      summedVectors[newAssignments[dataPointIdx]] =
        prevSum === undefined
          ? weightedCoords
          : sumVectors(prevSum, weightedCoords);
    }

    centroids = new CentroidList(
      centroids.centroids.map((_, centroidIdx) =>
        scaleVector(
          summedVectors[centroidIdx]!,
          1 / groupWeights[centroidIdx]!,
        ),
      ),
      distanceFn,
    );
    oldAssignments = newAssignments;
  }

  return centroids;
}

function chooseInitialCentroids<TPoint, TCoords extends Vector>(
  dataPoints: readonly TPoint[],
  numberOfCentroids: number,
  coordsFn: CoordsFn<TPoint, TCoords>,
  weightFn: WeightFn<TPoint>,
  distanceFn: DistanceFn<TCoords>,
) {
  const initialIndex = chooseAtRandomWithWeights(dataPoints, weightFn);
  if (initialIndex < 0) {
    throw new Error(
      "At least one data point must exist and have positive weight.",
    );
  }
  let centroids = new CentroidList(
    [coordsFn(dataPoints[initialIndex])],
    distanceFn,
  );
  while (centroids.length < numberOfCentroids) {
    const nextIndex = chooseAtRandomWithWeights(
      dataPoints,
      // eslint-disable-next-line no-loop-func
      (point) => weightFn(point) * centroids.distanceTo(coordsFn(point)),
    );

    // A negative nextIndex here means all remaining data points have weight 0
    // or are distance 0 from an already chosen initial centroid. In this case
    // we'll bail and output fewer centroids than requested.
    if (nextIndex < 0) break;

    centroids = new CentroidList(
      [...centroids.centroids, coordsFn(dataPoints[nextIndex])],
      distanceFn,
    );
  }
  return centroids;
}

function chooseAtRandomWithWeights<T>(
  items: readonly T[],
  weightFn: WeightFn<T>,
) {
  const weights = items.map((item) => weightFn(item));
  const totalWeight = weights.reduce((total, next) => total + next, 0);
  const testValue = Math.random() * totalWeight;
  let weightSoFar = 0;
  for (let i = 0; i < weights.length; i++) {
    weightSoFar += weights[i];
    if (weightSoFar > testValue) return i;
  }
  return -1;
}
