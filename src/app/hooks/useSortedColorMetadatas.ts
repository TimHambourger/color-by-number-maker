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
