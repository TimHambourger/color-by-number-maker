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

import { rule } from "app/nano";
import cx from "classnames";
import { RgbVector } from "lib/color";
import { CentroidList } from "lib/kMeansPlusPlus";
import { createContext, memo, PropsWithChildren, ReactNode, useContext, useMemo } from "react";

// We use a multiplier to overcome rounding artifacts running on Firefox.
const BOX_HEIGHT_IN_SVG_UNITS = 1000;

// As a fraction of the width or height (including border) of a single box.
const LINE_THICKNESS = 0.05;

const IMAGE_SIZING_CONTEXT = createContext<{ boxWidthInSVGUnits: number } | null>(null);

const useImageSizingContext = () => {
  const ctxt = useContext(IMAGE_SIZING_CONTEXT);
  if (ctxt === null)
    throw new Error(
      "Could not locate image sizing context. Did you forget to wrap your content in a <ColorByNumberImage /> element?",
    );
  return ctxt;
};

export interface ImageBoxBackgroundProps {
  fill: string;
}

export const ImageBoxBackground: React.FC<ImageBoxBackgroundProps> = ({ fill }) => {
  const { boxWidthInSVGUnits } = useImageSizingContext();
  return <rect x={0} y={0} width={boxWidthInSVGUnits} height={BOX_HEIGHT_IN_SVG_UNITS} fill={fill} />;
};

export const ImageBoxText: React.FC<PropsWithChildren> = ({ children }) => {
  const { boxWidthInSVGUnits } = useImageSizingContext();
  return (
    <text
      x={boxWidthInSVGUnits / 2}
      y={BOX_HEIGHT_IN_SVG_UNITS / 2}
      fontSize={Math.min(0.6 * BOX_HEIGHT_IN_SVG_UNITS, 0.6 * boxWidthInSVGUnits)}
      dominantBaseline="central"
      textAnchor="middle"
    >
      {children}
    </text>
  );
};

const CX_IMAGE = rule({
  display: "block",
});

export interface ColorByNumberImageProps {
  pixelsWide: number;
  pixelsHigh: number;
  boxesWide: number;
  boxesHigh: number;
  averagedColors: readonly RgbVector[];
  resolvedColors: readonly RgbVector[];
  renderBoxContent: (resolvedColorIndex: number) => ReactNode;
  className?: string;
}

const ColorByNumberImage: React.FC<ColorByNumberImageProps> = ({
  pixelsWide,
  pixelsHigh,
  boxesWide,
  boxesHigh,
  averagedColors,
  resolvedColors,
  renderBoxContent,
  className,
}) => {
  const resolvedCentroids = useMemo(() => new CentroidList(resolvedColors), [resolvedColors]);
  const colorAssignments = useMemo(
    () => averagedColors.map((color) => resolvedCentroids.classify(color)),
    [averagedColors, resolvedCentroids],
  );

  // Aspect ratio of a single box
  const boxAspectRatio = ((pixelsWide / pixelsHigh) * boxesHigh) / boxesWide;
  const boxWidthInSVGUnits = BOX_HEIGHT_IN_SVG_UNITS * boxAspectRatio;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelsWide, height: pixelsHigh }}
      className={cx(className, CX_IMAGE)}
      viewBox={`${(-LINE_THICKNESS * boxWidthInSVGUnits) / 2} ${(-LINE_THICKNESS * BOX_HEIGHT_IN_SVG_UNITS) / 2} ${
        (boxesWide + LINE_THICKNESS) * boxWidthInSVGUnits
      } ${(boxesHigh + LINE_THICKNESS) * BOX_HEIGHT_IN_SVG_UNITS}`}
      preserveAspectRatio="none"
    >
      <rect
        x={(-LINE_THICKNESS * boxWidthInSVGUnits) / 2}
        y={(-LINE_THICKNESS * BOX_HEIGHT_IN_SVG_UNITS) / 2}
        width={(boxesWide + LINE_THICKNESS) * boxWidthInSVGUnits}
        height={(boxesHigh + LINE_THICKNESS) * BOX_HEIGHT_IN_SVG_UNITS}
      />
      <IMAGE_SIZING_CONTEXT.Provider value={{ boxWidthInSVGUnits }}>
        {colorAssignments.map((resolvedColorIndex, boxIndex) => (
          <svg
            key={boxIndex}
            x={((boxIndex % boxesWide) + LINE_THICKNESS / 2) * boxWidthInSVGUnits}
            y={(Math.floor(boxIndex / boxesWide) + LINE_THICKNESS / 2) * BOX_HEIGHT_IN_SVG_UNITS}
            width={(1 - LINE_THICKNESS) * boxWidthInSVGUnits}
            height={(1 - LINE_THICKNESS) * BOX_HEIGHT_IN_SVG_UNITS}
            viewBox={`0 0 ${boxWidthInSVGUnits} ${BOX_HEIGHT_IN_SVG_UNITS}`}
          >
            {renderBoxContent(resolvedColorIndex)}
          </svg>
        ))}
      </IMAGE_SIZING_CONTEXT.Provider>
    </svg>
  );
};
export default memo(ColorByNumberImage);
