import { RgbVector } from "lib/color";
import { CentroidList } from "lib/kMeansPlusPlus";
import { CSSProperties, PropsWithChildren, ReactNode, useMemo } from "react";

// As a fraction of the width or height (including border) of a single box.
const LINE_THICKNESS = 0.05;

export interface ImageBoxBackgroundProps {
  fill: string;
}

export const ImageBoxBackground: React.FC<ImageBoxBackgroundProps> = ({ fill }) => (
  <rect x={0} y={0} width={1} height={1} fill={fill} />
);

export const ImageBoxText: React.FC<PropsWithChildren> = ({ children }) => (
  <text x={0.5} y={0.55} fontSize={0.6} dominantBaseline="middle" textAnchor="middle">
    {children}
  </text>
);

export interface ColorByNumberImageProps {
  boxesWide: number;
  boxesHigh: number;
  averagedColors: readonly RgbVector[];
  resolvedColors: readonly RgbVector[];
  renderBoxContent: (resolvedColorIndex: number) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ColorByNumberImage: React.FC<ColorByNumberImageProps> = ({
  boxesWide,
  boxesHigh,
  averagedColors,
  resolvedColors,
  renderBoxContent,
  className,
  style,
}) => {
  const resolvedCentroids = useMemo(() => new CentroidList(resolvedColors), [resolvedColors]);
  const colorAssignments = useMemo(
    () => averagedColors.map((color) => resolvedCentroids.classify(color)),
    [averagedColors, resolvedCentroids],
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      viewBox={`${-LINE_THICKNESS / 2} ${-LINE_THICKNESS / 2} ${boxesWide + LINE_THICKNESS} ${
        boxesHigh + LINE_THICKNESS
      }`}
      preserveAspectRatio="none"
    >
      <rect
        x={-LINE_THICKNESS / 2}
        y={-LINE_THICKNESS / 2}
        width={boxesWide + LINE_THICKNESS}
        height={boxesHigh + LINE_THICKNESS}
      />
      {colorAssignments.map((resolvedColorIndex, boxIndex) => (
        <svg
          key={boxIndex}
          x={(boxIndex % boxesWide) + LINE_THICKNESS / 2}
          y={Math.floor(boxIndex / boxesWide) + LINE_THICKNESS / 2}
          width={1 - LINE_THICKNESS}
          height={1 - LINE_THICKNESS}
          viewBox="0 0 1 1"
        >
          {renderBoxContent(resolvedColorIndex)}
        </svg>
      ))}
    </svg>
  );
};
export default ColorByNumberImage;
