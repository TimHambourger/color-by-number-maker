import { BLACK, WHITE } from "app/colorPalette";
import { ColorMetadata, useColorByNumberMakerState } from "app/slice";
import { arrayEq } from "lib/arrayEq";
import { RgbColor, RgbVector } from "lib/color";
import { CentroidList } from "lib/kMeansPlusPlus";
import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

// As a fraction of the width of a single box.
const LINE_WIDTH = 0.05;

export type BoxCallback<Result> = (color: RgbVector, boxIndex: number) => Result;

type TrimmedColorMetadata = Pick<ColorMetadata, "displayOrder" | "treatAsBlank">;
const areTrimmedMetadatasEqual = (
  metadatas1: readonly TrimmedColorMetadata[] | undefined,
  metadatas2: readonly TrimmedColorMetadata[] | undefined,
) =>
  metadatas1 && metadatas2
    ? arrayEq(
        metadatas1,
        metadatas2,
        (m1, m2) => m1.displayOrder === m2.displayOrder && m1.treatAsBlank === m2.treatAsBlank,
      )
    : metadatas1 === metadatas2;

export const useNumberedBoxContent = (): BoxCallback<ReactNode> => {
  const {
    state: { resolvedColors, colorMetadatas },
  } = useColorByNumberMakerState();
  const resolvedCentroids = useMemo(() => resolvedColors && new CentroidList(resolvedColors), [resolvedColors]);
  const [trimmedMetadatas, setTrimmedMetadatas] = useState<readonly TrimmedColorMetadata[]>();

  useEffect(() => {
    const newMetadatas = colorMetadatas?.map(
      ({ displayOrder, treatAsBlank }): TrimmedColorMetadata => ({ displayOrder, treatAsBlank }),
    );
    if (!areTrimmedMetadatasEqual(trimmedMetadatas, newMetadatas)) setTrimmedMetadatas(newMetadatas);
  }, [colorMetadatas, trimmedMetadatas]);

  const displayedNumbers = useMemo(() => {
    let nextDisplayedNumber = 1;
    return trimmedMetadatas
      ?.slice()
      .sort((m1, m2) => m1.displayOrder - m2.displayOrder)
      .map((m) => (m.treatAsBlank ? undefined : nextDisplayedNumber++));
  }, [trimmedMetadatas]);

  return useCallback(
    (color) =>
      displayedNumbers && resolvedCentroids ? (
        <text x={0.5} y={0.6} fontSize={0.6} dominantBaseline="middle" textAnchor="middle">
          {displayedNumbers[resolvedCentroids.classify(color)]}
        </text>
      ) : undefined,
    [displayedNumbers, resolvedCentroids],
  );
};

export interface ColorByNumberPreviewProps {
  boxesWide: number;
  boxesHigh: number;
  averagedColors: readonly RgbVector[];
  resolvedColors: readonly RgbVector[];
  previewFilledBoxes: BoxCallback<boolean>;
  boxContent?: BoxCallback<ReactNode>;
  className?: string;
  style?: CSSProperties;
}

const ColorByNumberPreview: React.FC<ColorByNumberPreviewProps> = ({
  boxesWide,
  boxesHigh,
  averagedColors,
  resolvedColors,
  previewFilledBoxes,
  boxContent,
  className,
  style,
}) => {
  const resolvedCentroids = useMemo(() => new CentroidList(resolvedColors), [resolvedColors]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      viewBox={`${-LINE_WIDTH / 2} ${-LINE_WIDTH / 2} ${boxesWide + LINE_WIDTH} ${boxesHigh + LINE_WIDTH}`}
      preserveAspectRatio="none"
    >
      <rect x={-LINE_WIDTH / 2} y={-LINE_WIDTH / 2} width={boxesWide + LINE_WIDTH} height={boxesHigh + LINE_WIDTH} />
      {averagedColors.map((color, boxIndex) => (
        <svg
          key={boxIndex}
          x={boxIndex % boxesWide}
          y={Math.floor(boxIndex / boxesWide)}
          width={1}
          height={1}
          viewBox="0 0 1 1"
        >
          <rect
            x={LINE_WIDTH / 2}
            y={LINE_WIDTH / 2}
            width={1 - LINE_WIDTH}
            height={1 - LINE_WIDTH}
            fill={
              previewFilledBoxes(color, boxIndex)
                ? RgbColor.fromVector(resolvedColors[resolvedCentroids.classify(color)]).toHexCode()
                : WHITE
            }
            stroke={BLACK}
            strokeWidth={LINE_WIDTH / 2}
          />
          {boxContent?.(color, boxIndex)}
        </svg>
      ))}
    </svg>
  );
};
export default ColorByNumberPreview;
