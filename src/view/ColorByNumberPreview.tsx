import { RgbColor, RgbVector } from "lib/color";
import { CentroidList } from "lib/kMeansPlusPlus";

// As a fraction of the width of a single box.
const LINE_WIDTH = 0.1;

export interface ColorByNumberPreviewProps {
  boxesWide: number;
  boxesHigh: number;
  averagedColors: readonly RgbVector[];
  resolvedCentroids: CentroidList<RgbVector>;
  className?: string;
}

const ColorByNumberPreview: React.FC<ColorByNumberPreviewProps> = ({
  boxesWide,
  boxesHigh,
  averagedColors,
  resolvedCentroids,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox={`${-LINE_WIDTH / 2} ${-LINE_WIDTH / 2} ${boxesWide + LINE_WIDTH} ${boxesHigh + LINE_WIDTH}`}
    preserveAspectRatio="none"
  >
    <rect x={-LINE_WIDTH / 2} y={-LINE_WIDTH / 2} width={boxesWide + LINE_WIDTH} height={boxesHigh + LINE_WIDTH} />
    {averagedColors.map((color, boxIndex) => (
      <rect
        key={boxIndex}
        x={boxIndex % boxesWide}
        y={Math.floor(boxIndex / boxesWide)}
        width={1}
        height={1}
        fill={RgbColor.fromVector(resolvedCentroids.centroids[resolvedCentroids.classify(color)]).toHexCode()}
        stroke="#000"
        strokeWidth={LINE_WIDTH / 2}
      />
    ))}
  </svg>
);
export default ColorByNumberPreview;
