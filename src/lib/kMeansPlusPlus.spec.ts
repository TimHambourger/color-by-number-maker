import { DIM_COLOR, EXPECTED_COLOR, RECEIVED_COLOR } from "jest-matcher-utils";
import { CentroidList, computeMean, euclideanDistanceSquared, findCentroids } from "./kMeansPlusPlus";

type Point3D = readonly [number, number, number];

interface HasCentroidMatcher<R = unknown> {
  toMatchCentroids(expected: CentroidList<Point3D>, tolerancePerAxis: number): R;
}

declare global {
  namespace jest {
    interface Expect extends HasCentroidMatcher {}
    interface Matchers<R> extends HasCentroidMatcher<R> {}
    interface InverseAsymmetricMatchers extends HasCentroidMatcher {}
  }
}

expect.extend({
  toMatchCentroids(received: CentroidList<Point3D>, expected: CentroidList<Point3D>, tolerancePerAxis: number) {
    if (received.length !== expected.length) {
      return {
        pass: false,
        message: () =>
          `Centroid counts do not match:\n\n${EXPECTED_COLOR(
            `- Expected  - ${expected.length} centroids`,
          )}\n${RECEIVED_COLOR(`+ Received  - ${received.length} centroids`)}\n\n${formatExpectedCentroidList(
            expected,
          )}\n${formatReceivedCentroidList(received)}`,
      };
    } else {
      return (
        matchNearestCentroids(received, expected, tolerancePerAxis, "received-to-expected") ??
        matchNearestCentroids(received, expected, tolerancePerAxis, "expected-to-received") ?? {
          pass: true,
          message: () =>
            `Expected ${RECEIVED_COLOR("received")} centroids not to match ${EXPECTED_COLOR(
              "expected",
            )} centroids.\n\n${formatExpectedCentroidList(expected)}\n${formatReceivedCentroidList(received)}`,
        }
      );
    }
  },
});

function formatFullCentroidList(list: CentroidList<Point3D>, linePrefix: string) {
  return JSON.stringify(list.centroids, undefined, 2)
    .split("\n")
    .map((line) => `${linePrefix} ${line}`)
    .join("\n");
}

function formatExpectedCentroidList(expected: CentroidList<Point3D>) {
  return EXPECTED_COLOR(formatFullCentroidList(expected, "-"));
}

function formatReceivedCentroidList(received: CentroidList<Point3D>) {
  return RECEIVED_COLOR(formatFullCentroidList(received, "+"));
}

function matchNearestCentroids(
  received: CentroidList<Point3D>,
  expected: CentroidList<Point3D>,
  tolerancePerAxis: number,
  direction: "received-to-expected" | "expected-to-received",
): jest.CustomMatcherResult | undefined {
  const listToIterate = direction === "received-to-expected" ? received : expected;
  const listToMatchAgainst = direction === "received-to-expected" ? expected : received;

  const matchFailuresByIteratedIndex = new Map<number, Point3D>();
  for (let iteratedIndex = 0; iteratedIndex < listToIterate.length; iteratedIndex++) {
    const iteratedCentroid = listToIterate.centroids[iteratedIndex];
    const matchedIndex = listToMatchAgainst.classify(iteratedCentroid);
    const matchedCentroid = listToMatchAgainst.centroids[matchedIndex];
    for (let axis = 0; axis < matchedCentroid.length; axis++) {
      if (Math.abs(iteratedCentroid[axis] - matchedCentroid[axis]) > tolerancePerAxis) {
        // Match failure
        matchFailuresByIteratedIndex.set(iteratedIndex, matchedCentroid);
      }
    }
  }

  if (matchFailuresByIteratedIndex.size > 0) {
    const formatSummary = () =>
      direction === "received-to-expected"
        ? `Some ${RECEIVED_COLOR("received")} centroids do not sufficiently match an ${EXPECTED_COLOR(
            "expected",
          )} centroid.`
        : `Some ${EXPECTED_COLOR("expected")} centroids do not sufficiently match a ${RECEIVED_COLOR(
            "received",
          )} centroid.`;
    const formatCentroid = (centroid: Point3D, prefix: string) =>
      centroid.map((coord) => `${prefix}    ${coord},\n`).join("");
    const formatExpectedCentroid = (centroid: Point3D) => EXPECTED_COLOR(formatCentroid(centroid, "-"));
    const formatReceivedCentroid = (centroid: Point3D) => RECEIVED_COLOR(formatCentroid(centroid, "+"));
    const formatInnerDiff = () =>
      listToIterate.centroids
        .map((centroid, iteratedIdx) => {
          const failure = matchFailuresByIteratedIndex.get(iteratedIdx);
          return `${DIM_COLOR("    Array [\n")}${
            failure
              ? direction === "received-to-expected"
                ? // failure === expected and centroid === received
                  `${formatExpectedCentroid(failure)}${formatReceivedCentroid(centroid)}`
                : // centroid === expected and failure === received
                  `${formatExpectedCentroid(centroid)}${formatReceivedCentroid(failure)}`
              : DIM_COLOR(formatCentroid(centroid, " "))
          }${DIM_COLOR("    ],\n")}`;
        })
        .join("");
    return {
      pass: false,
      message: () => `${formatSummary()}\n\n${DIM_COLOR("  Array [")}\n${formatInnerDiff()}\n${DIM_COLOR("  ]")}`,
    };
  }
}

test("findCentroids finds predetermined centroids", () => {
  const k = 10;
  const numDataPoints = 1600;
  // Higher == clumpier data and more predictable test behavior.
  const clumpinessFactor = 12;
  // Lower == test is more likely to fail. Tune in concert with the
  // clumpinessFactor.
  const assertionTolerance = 0.05;

  const expectedCentroids: Point3D[] = [];
  for (let i = 0; i < k; i++) {
    expectedCentroids.push([Math.random(), Math.random(), Math.random()]);
  }

  const minDistanceBetweenCentroids = Math.sqrt(
    Math.min(
      ...expectedCentroids.map((centroid1) =>
        Math.min(
          ...expectedCentroids
            .filter((centroid2) => centroid1 !== centroid2)
            .map((centroid2) => euclideanDistanceSquared(centroid1, centroid2)),
        ),
      ),
    ),
  );
  const maxDisplacementPerAxis = minDistanceBetweenCentroids / clumpinessFactor;

  const dataPoints: (readonly [number, number, number])[] = [];
  for (let i = 0; i < numDataPoints; i++) {
    const centroid = expectedCentroids[Math.floor(Math.random() * k)];
    dataPoints.push([
      centroid[0] + (Math.random() - 0.5) * maxDisplacementPerAxis,
      centroid[1] + (Math.random() - 0.5) * maxDisplacementPerAxis,
      centroid[2] + (Math.random() - 0.5) * maxDisplacementPerAxis,
    ]);
  }

  const perfStart = performance.now();
  const actualCentroids = findCentroids(dataPoints, k);

  const perfEnd = performance.now();
  console.log(
    `Found ${k} centroids for ${numDataPoints} data points in ${Math.round(perfEnd - perfStart)} milliseconds.`,
  );

  expect(actualCentroids).toMatchCentroids(new CentroidList(expectedCentroids), assertionTolerance);
});

test("Requesting at least as many centroids as distinct data points returns the distinct data points (unweighted)", () => {
  const numPoints = Math.floor(Math.random() * 6 + 5);
  const points = randomPoints(numPoints);
  const centroids = findCentroids(points, numPoints + Math.floor(Math.random() * 5));
  expect(centroids).toMatchCentroids(new CentroidList(points), 0.01);
});

test("Requesting at least as many centroids as distinct data points returns the distinct data points (weighted)", () => {
  const numPoints = Math.floor(Math.random() * 6 + 5);
  const points = randomPoints(numPoints);
  const weights = points.map(() => Math.random() * 5 + 0.1);
  const centroids = findCentroids(points, numPoints + Math.floor(Math.random() * 5), {
    weightFn: (_, idx) => weights[idx],
  });
  expect(centroids).toMatchCentroids(new CentroidList(points), 0.01);
});

test("chained findCentroids calls converge on the true centroid", () => {
  const numPoints = Math.floor(Math.random() * 6 + 5);
  const initialPoints = randomPoints(numPoints);
  const initialWeights = initialPoints.map(() => Math.random() * 3 + 0.1);

  const trueCentroid = computeMean(initialPoints, { weightFn: (_, i) => initialWeights[i] });

  let points = initialPoints;
  let weights = initialWeights;
  while (points.length > 1) {
    const numCentroids = Math.floor(Math.random() * (points.length - 1)) + 1;
    const centroids = findCentroids(points, numCentroids, {
      // eslint-disable-next-line no-loop-func
      weightFn: (_, i) => weights[i],
    });
    const nextWeights = centroids.centroids.map(() => 0);
    for (let i = 0; i < points.length; i++) {
      const newIndex = centroids.classify(points[i]);
      nextWeights[newIndex] += weights[i];
    }
    points = centroids.centroids;
    weights = nextWeights;
  }

  expect(new CentroidList(points)).toMatchCentroids(new CentroidList([trueCentroid]), 0.0001);
});

function randomPoints(count: number) {
  const points: Point3D[] = [];
  for (let i = 0; i < count; i++) points.push([Math.random(), Math.random(), Math.random()]);
  return points as readonly Point3D[];
}
