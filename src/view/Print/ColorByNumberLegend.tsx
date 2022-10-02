import { BLACK } from "app/colorPalette";
import { SortedColorMetadata } from "app/hooks";
import { rule } from "app/nano";
import { useMemo } from "react";

const CX_LEGEND_CELL = rule({
  border: `1px solid ${BLACK}`,
  padding: "4px 4px 4px 0",
});

const CX_LEGEND_CELL_CONTENT = rule({
  alignItems: "center",
  display: "flex",
});

const CX_LEGEND_CELL_NUMBER = rule({
  textAlign: "center",
  width: "28px",
});

const CX_LEGEND_CELL_LABEL = rule({
  flex: 1,
  textAlign: "center",
});

interface LegendCellProps {
  metadata: SortedColorMetadata;
  displayedNumbers: (number | undefined)[];
  width: string;
}

const LegendCell: React.FC<LegendCellProps> = ({ metadata, displayedNumbers, width }) => (
  <td className={CX_LEGEND_CELL} style={{ width }}>
    <span className={CX_LEGEND_CELL_CONTENT}>
      <span className={CX_LEGEND_CELL_NUMBER}>{displayedNumbers[metadata.originalIndex]}</span>
      <span className={CX_LEGEND_CELL_LABEL}>{metadata.label}</span>
    </span>
  </td>
);

const CX_LEGEND = rule({
  borderCollapse: "collapse",
  width: "100%",
});

export interface ColorByNumberLegendProps {
  sortedMetadatas: SortedColorMetadata[];
  displayedNumbers: (number | undefined)[];
  maxColumns: number;
}

const ColorByNumberLegend: React.FC<ColorByNumberLegendProps> = ({ sortedMetadatas, displayedNumbers, maxColumns }) => {
  const displayedMetadatas = useMemo(() => sortedMetadatas.filter((m) => !m.treatAsBlank), [sortedMetadatas]);

  const numRows = Math.ceil(displayedMetadatas.length / maxColumns);
  const numColumns = Math.ceil(displayedMetadatas.length / numRows);
  const rows: JSX.Element[] = [];
  for (let rowNum = 0; rowNum < numRows; rowNum++) {
    // Layout the legend column by column, e.g. 1 - 3 in one column, then 4 - 6 in the next, etc.
    const metadatasForRow: SortedColorMetadata[] = [];
    for (let i = 0; i < numColumns && numRows * i + rowNum < displayedMetadatas.length; i++) {
      metadatasForRow.push(displayedMetadatas[numRows * i + rowNum])
    }
    rows.push(
      <tr key={rowNum}>
        {metadatasForRow.map((m) => (
          <LegendCell
            key={m.originalIndex}
            metadata={m}
            displayedNumbers={displayedNumbers}
            width={`${100 / maxColumns}%`}
          />
        ))}
      </tr>,
    );
  }

  return <table className={CX_LEGEND}>{rows}</table>;
};
export default ColorByNumberLegend;
