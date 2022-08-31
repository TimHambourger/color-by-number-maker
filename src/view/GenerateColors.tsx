import { BEST_N_KMEANS_OF, IMPLIED_BACKGROUND_COLOR } from "app/constants";
import { useAppDispatch, useImageData } from "app/hooks";
import { rule } from "app/nano";
import { useColorByNumberMakerState } from "app/slice";
import { averageColors } from "lib/averageColors";
import { RgbColor, RgbVector } from "lib/color";
import { constrain } from "lib/constrain";
import { CentroidList, computeVariance, findCentroids } from "lib/kMeansPlusPlus";
import { useEffect, useMemo } from "react";
import DebouncedIntegerInput from "./DebouncedIntegerInput";
import LinkButton from "./LinkButton";
import WizardNavigationControls from "./WizardNavigationControls";

// As a fraction of the width of a single box.
const LINE_WIDTH = 0.1;

const CX_GENERATE_COLORS = rule({
  margin: "10px auto",
  width: "600px",
});

const CX_PREVIEW_SHELL = rule({
  textAlign: "center",
});

const CX_LOADING_TEXT = rule({
  height: "200px",
  textAlign: "center",
});

const CX_COLOR_SETTINGS = rule({
  marginTop: "6px",
});

const CX_COLOR_SETTINGS_ROW = rule({
  display: "flex",
  justifyContent: "space-between",
  margin: "6px 0",
});

const CX_COLOR_SETTINGS_INPUT_LABEL = rule({
  textAlign: "right",
  width: "175px",
});

const CX_COLOR_SETTINGS_INPUT = rule({
  width: "80px",
});

const GenerateColors: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl, cropZone, boxesWide, boxesHigh, maxColors, resolvedColors },
    setBoxesWide,
    setBoxesHigh,
    setMaxColors,
    setResolvedColors,
  } = useColorByNumberMakerState();
  const imageData = useImageData(dataUrl, cropZone);

  const averagedColors = useMemo(
    () =>
      imageData &&
      averageColors(
        imageData,
        constrain(boxesWide, 1, imageData.width),
        constrain(boxesHigh, 1, imageData.height),
        IMPLIED_BACKGROUND_COLOR,
      ),
    [imageData, boxesWide, boxesHigh],
  );
  useEffect(() => {
    if (averagedColors && !resolvedColors) {
      // TODO: Compute in parallel with workers.
      let centroids: CentroidList<RgbVector>;
      let minVariance: number | undefined;
      for (let i = 0; i < BEST_N_KMEANS_OF; i++) {
        const newCentroids = findCentroids(averagedColors, maxColors);
        const newVariance = computeVariance(averagedColors, newCentroids);
        if (minVariance === undefined || newVariance < minVariance) {
          centroids = newCentroids;
          minVariance = newVariance;
        }
      }
      dispatch(
        setResolvedColors({
          colors: centroids!.centroids,
          assignments: averagedColors.map((color) => centroids!.classify(color)),
        }),
      );
    }
  }, [averagedColors, resolvedColors, dispatch, setResolvedColors, maxColors]);

  return (
    <div className={CX_GENERATE_COLORS}>
      {cropZone && (
        <>
          {resolvedColors ? (
            <div className={CX_PREVIEW_SHELL}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`${-LINE_WIDTH / 2} ${-LINE_WIDTH / 2} ${boxesWide + LINE_WIDTH} ${boxesHigh + LINE_WIDTH}`}
                preserveAspectRatio="none"
                style={{
                  width: 400,
                  height: (400 / cropZone.width) * cropZone.height,
                }}
              >
                <rect
                  x={-LINE_WIDTH / 2}
                  y={-LINE_WIDTH / 2}
                  width={boxesWide + LINE_WIDTH}
                  height={boxesHigh + LINE_WIDTH}
                />
                {resolvedColors.assignments.map((colorIndex, assignmentIndex) => (
                  <rect
                    key={assignmentIndex}
                    x={assignmentIndex % boxesWide}
                    y={Math.floor(assignmentIndex / boxesWide)}
                    width={1}
                    height={1}
                    fill={RgbColor.fromVector(resolvedColors.colors[colorIndex]).toHexCode()}
                    stroke="#000"
                    strokeWidth={LINE_WIDTH / 2}
                  />
                ))}
              </svg>
            </div>
          ) : (
            <div className={CX_LOADING_TEXT}>Constructing color by number preview...</div>
          )}
          <div className={CX_COLOR_SETTINGS}>
            <div className={CX_COLOR_SETTINGS_ROW}>
              <label className={CX_COLOR_SETTINGS_INPUT_LABEL}>
                Boxes Wide{" "}
                <DebouncedIntegerInput
                  className={CX_COLOR_SETTINGS_INPUT}
                  value={boxesWide}
                  onChange={(value) => dispatch(setBoxesWide(value))}
                  minValue={1}
                  maxValue={cropZone.width}
                  waitMillis={500}
                />
              </label>
              <label className={CX_COLOR_SETTINGS_INPUT_LABEL}>
                Max Colors{" "}
                <DebouncedIntegerInput
                  className={CX_COLOR_SETTINGS_INPUT}
                  value={maxColors}
                  onChange={(value) => dispatch(setMaxColors(value))}
                  minValue={1}
                  maxValue={50}
                  waitMillis={500}
                />
              </label>
            </div>
            <div className={CX_COLOR_SETTINGS_ROW}>
              <label className={CX_COLOR_SETTINGS_INPUT_LABEL}>
                Boxes High{" "}
                <DebouncedIntegerInput
                  className={CX_COLOR_SETTINGS_INPUT}
                  value={boxesHigh}
                  onChange={(value) => dispatch(setBoxesHigh(value))}
                  minValue={1}
                  maxValue={cropZone.height}
                  waitMillis={500}
                />
              </label>
              <LinkButton onClick={() => dispatch(setResolvedColors())}>Regenerate Colors</LinkButton>
            </div>
          </div>
        </>
      )}
      <WizardNavigationControls forwardIsDisabled />
    </div>
  );
};
export default GenerateColors;
