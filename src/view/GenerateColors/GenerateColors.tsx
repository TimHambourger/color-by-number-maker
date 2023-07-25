/**
 * Copyright 2022 - 2023 Tim Hambourger
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

import { useAppDispatch, useImageData } from "app/hooks";
import { rule } from "app/nano";
import { useColorByNumberMakerState } from "app/slice";
import cx from "classnames";
import { RgbColor, RgbVector } from "lib/color";
import { useEffect, useMemo, useRef, useState } from "react";
import ColorByNumberImage, { ColorByNumberImageProps, ImageBoxBackground } from "view/ColorByNumberImage";
import LinkButton from "view/LinkButton";
import WizardNavigationControls from "view/WizardNavigationControls";
import WizardPage from "view/WizardPage";
import { sampleColorsInBackground, resolveColorsInBackground, assignColorsInBackground } from "workers";
import { ResolveColorsResponse } from "workers/resolveColors/api";
import { IntegerColorSetting, RgbVectorColorSetting } from "./ColorSetting";
import {
  BEST_KMEANS_OF_N,
  COLOR_ASSIGNMENT_PREVALENCE_BIAS,
  MAX_RETRIES_PER_BOX,
  SAMPLES_PER_BOX,
} from "app/colorGenerationParams";

const PREVIEW_WIDTH_PX = 400;

type ColorByNumberPreviewProps = Pick<ColorByNumberImageProps, "boxesWide" | "boxesHigh" | "colorAssignments"> & {
  resolvedColors: readonly RgbVector[];
};

const ColorByNumberPreview: React.FC<ColorByNumberPreviewProps> = (props) => {
  const resolvedHexCodes = useMemo(
    () => props.resolvedColors.map((color) => RgbColor.fromVector(color).toHexCode()),
    [props.resolvedColors],
  );
  const {
    state: { cropZone },
  } = useColorByNumberMakerState();
  return cropZone ? (
    <ColorByNumberImage
      {...props}
      pixelsWide={PREVIEW_WIDTH_PX}
      pixelsHigh={(PREVIEW_WIDTH_PX * cropZone.height) / cropZone.width}
      renderBoxContent={(resolvedColorIndex) => <ImageBoxBackground fill={resolvedHexCodes[resolvedColorIndex]} />}
    />
  ) : null;
};

const CX_PREVIEW_SHELL = rule({
  margin: "0 auto",
  position: "relative",
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

const GenerateColors: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl, cropZone, boxesWide, boxesHigh, maxColors, backgroundColor, resolvedColors, colorAssignments },
    setBoxesWide,
    setBoxesHigh,
    setMaxColors,
    setBackgroundColor,
    setResolvedColors,
    setColorAssignments,
  } = useColorByNumberMakerState();
  const imageData = useImageData(dataUrl, cropZone);
  const [sampledColors, setSampledColors] = useState<readonly (readonly RgbVector[])[]>();

  // 1.a. Sample colors....
  useEffect(() => {
    if (imageData && !sampledColors && !colorAssignments) {
      const controller = new AbortController();
      sampleColorsInBackground(
        {
          imageData,
          boxesWide,
          boxesHigh,
          samplesPerBox: SAMPLES_PER_BOX,
          maxRetriesPerBox: MAX_RETRIES_PER_BOX,
          backgroundColor,
        },
        controller.signal,
      )
        .then((resp) => setSampledColors(resp.sampledColors))
        .catch(() => {
          // Don't care about task cancellations.
        });
      return () => controller.abort();
    }
  }, [imageData, resolvedColors, sampledColors, colorAssignments, boxesWide, boxesHigh, backgroundColor, dispatch]);

  // 1.b. Invalidate previously sampled colors if prior inputs change....
  useEffect(() => {
    setSampledColors(undefined);
  }, [imageData, boxesWide, boxesHigh, backgroundColor]);

  // 2. Resolve colors....
  useEffect(() => {
    if (sampledColors && !resolvedColors) {
      const controller = new AbortController();
      const promises: Promise<ResolveColorsResponse>[] = [];
      for (let i = 0; i < BEST_KMEANS_OF_N; i++) {
        promises.push(
          resolveColorsInBackground(
            {
              sampledColors,
              maxColors,
            },
            controller.signal,
          ),
        );
      }
      Promise.all(promises)
        .then((responses) => {
          if (process.env.REACT_APP_LOG_VERBOSE_COLOR_GENERATION_STATS === "true") {
            console.log(
              `Choosing best resolveColorsInBackground response from ${
                responses.length
              } responses with variances of ${JSON.stringify(
                responses.map((resp) => resp.variance).sort((a, b) => a - b),
                undefined,
                2,
              )}`,
            );
          }
          const bestResponse = responses.reduce((bestSoFar, next) =>
            next.variance < bestSoFar.variance ? next : bestSoFar,
          );
          dispatch(setResolvedColors(bestResponse.colors));
        })
        .catch(() => {
          // Don't care about task cancellations.
        });
      return () => controller.abort();
    }
  }, [resolvedColors, sampledColors, dispatch, setResolvedColors, maxColors]);

  // 3. Assign colors....
  useEffect(() => {
    if (sampledColors && resolvedColors && !colorAssignments) {
      const controller = new AbortController();
      assignColorsInBackground(
        {
          sampledColors,
          resolvedColors,
          prevalenceBias: COLOR_ASSIGNMENT_PREVALENCE_BIAS,
        },
        controller.signal,
      )
        .then((resp) => dispatch(setColorAssignments(resp.colorAssignments)))
        .catch(() => {
          // Don't care about task cancellations.
        });
      return () => controller.abort();
    }
  }, [sampledColors, resolvedColors, colorAssignments, dispatch, setColorAssignments]);

  // Remember props for the color by number preview as of whenever we last had averagedColors and resolvedColors
  // available. This supports showing an "after memory" of the last color by number preview as we're still constructing
  // the next preview, even if the reason we're re-constructing the color by number preview is b/c of a change to
  // boxesWide or boxesHigh.
  const previewPropsRef = useRef<ColorByNumberPreviewProps | undefined>(undefined);
  if (resolvedColors && colorAssignments) {
    previewPropsRef.current = {
      boxesWide,
      boxesHigh,
      resolvedColors,
      colorAssignments,
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
            {previewProps && <ColorByNumberPreview {...previewProps} />}
            {!resolvedColors || !colorAssignments ? (
              <div className={cx(CX_LOADING_TEXT, { [CX_LOADING_TEXT_OVERLAY]: previewProps })}>
                Constructing color by number preview...
              </div>
            ) : null}
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
              <LinkButton
                onClick={() => {
                  setSampledColors(undefined);
                  dispatch(setResolvedColors());
                }}
              >
                Regenerate Colors
              </LinkButton>
            </div>
          </div>
        </>
      )}
      <WizardNavigationControls forwardIsDisabled={!resolvedColors || !colorAssignments} />
    </WizardPage>
  );
};
export default GenerateColors;
