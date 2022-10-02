import { ColorMetadata } from "app/slice";
import { RgbVector } from "lib/color";
import { sortColorsIntuitively } from "lib/colorSorting";
import { useMemo } from "react";

export interface SortedColorMetadata extends ColorMetadata {
  originalIndex: number;
}

export const useSortedColorMetadatas = (
  resolvedColors: readonly RgbVector[] | undefined,
  colorMetadatas: readonly ColorMetadata[] | undefined,
) => {
  const colorIndicesInPreferredOrder = useMemo(
    () => resolvedColors && sortColorsIntuitively(resolvedColors),
    [resolvedColors],
  );

  return useMemo(
    () =>
      colorIndicesInPreferredOrder &&
      resolvedColors &&
      colorMetadatas &&
      colorIndicesInPreferredOrder.map(
        (index): SortedColorMetadata => ({
          ...colorMetadatas[index],
          originalIndex: index,
        }),
      ),
    [colorIndicesInPreferredOrder, resolvedColors, colorMetadatas],
  );
};
