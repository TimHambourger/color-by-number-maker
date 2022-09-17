import { useAppDispatch, useImageData } from "app/hooks";
import { rule } from "app/nano";
import { useColorByNumberMakerState } from "app/slice";
import cx from "classnames";
import { useEffect, useRef } from "react";
import ColorByNumberPreview, { ColorByNumberPreviewProps } from "view/ColorByNumberPreview";
import LinkButton from "view/LinkButton";
import WizardNavigationControls from "view/WizardNavigationControls";
import WizardPage from "view/WizardPage";
import { averageColorsInBackground, resolveColorsInBackground } from "workers";
import { ResolveColorsResponse } from "workers/resolveColors/api";
import { IntegerColorSetting, RgbVectorColorSetting } from "./ColorSetting";

const PREVIEW_WIDTH_PX = 400;

const BEST_KMEANS_OF_N = 6;

const CX_PREVIEW_SHELL = rule({
  margin: "0 auto",
  position: "relative",
});

const CX_PREVIEW = rule({
  display: "block",
  height: "100%",
  width: "100%",
});

const CX_LOADING_TEXT_OVERLAY = "loading-text-overlay";

const CX_LOADING_TEXT = rule({
  alignItems: "center",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  left: 0,
  margin: "0 auto",
  position: "absolute",
  top: 0,
  width: "100%",
  [`&.${CX_LOADING_TEXT_OVERLAY}`]: {
    background: "rgba(255, 255, 255, 0.7)",
  },
});

const CX_COLOR_SETTINGS = rule({
  marginTop: "6px",
});

const CX_COLOR_SETTINGS_ROW = rule({
  display: "flex",
  justifyContent: "space-between",
  margin: "6px 0",
});

type RememberedPreviewProps = Pick<
  ColorByNumberPreviewProps,
  "boxesWide" | "boxesHigh" | "averagedColors" | "resolvedColors"
>;

const GenerateColors: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl, cropZone, boxesWide, boxesHigh, maxColors, backgroundColor, averagedColors, resolvedColors },
    setBoxesWide,
    setBoxesHigh,
    setMaxColors,
    setBackgroundColor,
    setAveragedColors,
    setResolvedColors,
  } = useColorByNumberMakerState();
  const imageData = useImageData(dataUrl, cropZone);

  useEffect(() => {
    if (imageData && !averagedColors) {
      const controller = new AbortController();
      averageColorsInBackground(
        {
          imageData,
          boxesWide,
          boxesHigh,
          backgroundColor,
        },
        controller.signal,
      )
        .then((resp) => dispatch(setAveragedColors(resp.averagedColors)))
        .catch(() => {
          /* Don't care about task cancellations. */
        });
      return () => controller.abort();
    }
  }, [imageData, averagedColors, resolvedColors, boxesWide, boxesHigh, backgroundColor, dispatch, setAveragedColors]);

  useEffect(() => {
    if (averagedColors && !resolvedColors) {
      const controller = new AbortController();
      const promises: Promise<ResolveColorsResponse>[] = [];
      for (let i = 0; i < BEST_KMEANS_OF_N; i++) {
        promises.push(
          resolveColorsInBackground(
            {
              averagedColors,
              maxColors,
            },
            controller.signal,
          ),
        );
      }
      Promise.all(promises)
        .then((responses) => {
          const bestResponse = responses.reduce((bestSoFar, next) =>
            next.variance < bestSoFar.variance ? next : bestSoFar,
          );
          dispatch(setResolvedColors(bestResponse.colors));
        })
        .catch(() => {
          /* Don't care about task cancellations */
        });
      return () => controller.abort();
    }
  }, [averagedColors, resolvedColors, dispatch, setResolvedColors, maxColors]);

  // Remember props for the color by number preview as of whenever we last had averagedColors and resolvedColors
  // available. This supports showing an "after memory" of the last color by number preview as we're still constructing
  // the next preview, even if the reason we're re-constructing the color by number preview is b/c of a change to
  // boxesWide or boxesHigh.
  const previewPropsRef = useRef<RememberedPreviewProps | undefined>(undefined);
  if (averagedColors && resolvedColors) {
    previewPropsRef.current = {
      boxesWide,
      boxesHigh,
      averagedColors,
      resolvedColors,
    };
  }
  const previewProps = previewPropsRef.current;

  return (
    <WizardPage>
      {cropZone && (
        <>
          <div
            className={CX_PREVIEW_SHELL}
            style={{
              width: PREVIEW_WIDTH_PX,
              height: (PREVIEW_WIDTH_PX / cropZone.width) * cropZone.height,
            }}
          >
            {previewProps && (
              <ColorByNumberPreview {...previewProps} className={CX_PREVIEW} previewFilledBoxes={() => true} />
            )}
            {(!averagedColors || !resolvedColors) && (
              <div className={cx(CX_LOADING_TEXT, { [CX_LOADING_TEXT_OVERLAY]: previewProps })}>
                Constructing color by number preview...
              </div>
            )}
          </div>
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
      <WizardNavigationControls forwardIsDisabled={!averagedColors || !resolvedColors} />
    </WizardPage>
  );
};
export default GenerateColors;