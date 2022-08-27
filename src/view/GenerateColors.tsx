import { BEST_N_KMEANS_OF, IMPLIED_BACKGROUND_COLOR } from "app/constants";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import { averageColors } from "lib/averageColors";
import { RgbColor, RgbVector } from "lib/color";
import { CentroidList, computeVariance, findCentroids } from "lib/kMeansPlusPlus";
import { useEffect, useMemo, useState } from "react";

// Will replace this with file picking and image pasting capabilities on the 1st screen of the wizard.
const image = document.createElement("img");
image.src = `${process.env.PUBLIC_URL}/th-2751800954.jpg`;

// TODO: Get these from redux...
const NUM_BOXES_WIDE = 40;
const NUM_BOXES_HIGH = 40;
const NUM_COLORS = 10;

// As a fraction of the width of a single box.
const LINE_WIDTH = 0.1;

interface ColorAssignments {
  colors: RgbColor[];
  assignments: number[];
}

const GenerateColors: React.FC = () => {
  const { state } = useColorByNumberMakerState();

  const [imageData, setImageData] = useState<ImageData | undefined>();
  const [colorAssignments, setColorAssignments] = useState<ColorAssignments | undefined>();

  useEffect(() => {
    image.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to obtain canvas 2D rendering context.");
      context.drawImage(image, 0, 0);
      setImageData(context.getImageData(0, 0, image.width, image.height));
    });
  }, []);

  const averagedColors = useMemo(
    () => imageData && averageColors(imageData, NUM_BOXES_WIDE, NUM_BOXES_HIGH, IMPLIED_BACKGROUND_COLOR),
    [imageData],
  );
  const [reassignColorsCount, setReassignColorsCount] = useState(0);

  useEffect(() => {
    if (averagedColors) {
      // TODO: Compute in parallel with workers.
      let centroids: CentroidList<RgbVector>;
      let minVariance: number | undefined;
      for (let i = 0; i < BEST_N_KMEANS_OF; i++) {
        const newCentroids = findCentroids(averagedColors, NUM_COLORS);
        const newVariance = computeVariance(averagedColors, newCentroids);
        if (minVariance === undefined || newVariance < minVariance) {
          centroids = newCentroids;
          minVariance = newVariance;
        }
      }
      setColorAssignments({
        colors: centroids!.centroids.map(RgbColor.fromVector),
        assignments: averagedColors.map((color) => centroids!.classify(color)),
      });
    }
    return () => setColorAssignments(undefined);
  }, [averagedColors, reassignColorsCount]);

  return state.phase === ColorByNumberMakerPhase.GenerateColors ? (
    <div>
      {colorAssignments ? (
        <div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`${-LINE_WIDTH / 2} ${-LINE_WIDTH / 2} ${NUM_BOXES_WIDE + LINE_WIDTH} ${
                NUM_BOXES_HIGH + LINE_WIDTH
              }`}
              preserveAspectRatio="none"
              style={{
                width: 400,
                height: (400 / image.width) * image.height,
              }}
            >
              <rect
                x={-LINE_WIDTH / 2}
                y={-LINE_WIDTH / 2}
                width={NUM_BOXES_WIDE + LINE_WIDTH}
                height={NUM_BOXES_HIGH + LINE_WIDTH}
              />
              {colorAssignments.assignments.map((colorIndex, assignmentIndex) => (
                <rect
                  key={assignmentIndex}
                  x={assignmentIndex % NUM_BOXES_WIDE}
                  y={Math.floor(assignmentIndex / NUM_BOXES_WIDE)}
                  width={1}
                  height={1}
                  fill={colorAssignments.colors[colorIndex].toHexCode()}
                  stroke="#000"
                  strokeWidth={LINE_WIDTH / 2}
                />
              ))}
            </svg>
          </div>
        </div>
      ) : (
        <div>Constructing color by number preview...</div>
      )}
      <div>
        <button onClick={() => setReassignColorsCount((count) => count + 1)}>Regenerate Colors</button>
      </div>
    </div>
  ) : null;
};
export default GenerateColors;
