import { useAppDispatch, useImageData } from "app/hooks";
import { rule } from "app/nano";
import { useColorByNumberMakerState } from "app/slice";
import { averageColors } from "lib/averageColors";
import { RgbColor, RgbVector } from "lib/color";
import { constrain } from "lib/constrain";
import { CentroidList, computeVariance, findCentroids } from "lib/kMeansPlusPlus";
import { useEffect, useMemo } from "react";
import LinkButton from "view/LinkButton";
import WizardNavigationControls from "view/WizardNavigationControls";
import { IntegerColorSetting, RgbVectorColorSetting } from "./ColorSetting";

// As a fraction of the width of a single box.
const LINE_WIDTH = 0.1;

const BEST_KMEANS_OF_N = 6;

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

const GenerateColors: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl, cropZone, boxesWide, boxesHigh, maxColors, backgroundColor, resolvedColors },
    setBoxesWide,
    setBoxesHigh,
    setMaxColors,
    setBackgroundColor,
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
        RgbColor.fromVector(backgroundColor),
      ),
    [imageData, boxesWide, boxesHigh, backgroundColor],
  );
  useEffect(() => {
    if (averagedColors && !resolvedColors) {
      // TODO: Compute in parallel with workers. See https://webpack.js.org/guides/web-workers/
      let centroids: CentroidList<RgbVector>;
      let minVariance: number | undefined;
      for (let i = 0; i < BEST_KMEANS_OF_N; i++) {
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
              <IntegerColorSetting
                label="Boxes Wide"
                on="left"
                value={boxesWide}
                onChange={(value) => dispatch(setBoxesWide(value))}
                minValue={1}
                maxValue={Math.min(150, cropZone.width)}
              />
              <IntegerColorSetting
                label="Max Colors"
                on="right"
                value={maxColors}
                onChange={(value) => dispatch(setMaxColors(value))}
                minValue={1}
                maxValue={50}
              />
            </div>
            <div className={CX_COLOR_SETTINGS_ROW}>
              <IntegerColorSetting
                label="Boxes High"
                on="left"
                value={boxesHigh}
                onChange={(value) => dispatch(setBoxesHigh(value))}
                minValue={1}
                maxValue={Math.min(150, cropZone.height)}
              />
              <RgbVectorColorSetting
                label="Background Color"
                on="right"
                value={backgroundColor}
                onChange={(value) => dispatch(setBackgroundColor(value))}
              />
            </div>
            <div className={CX_COLOR_SETTINGS_ROW}>
              <span />
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
