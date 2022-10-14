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

import { arrayEq } from "lib/arrayEq";
import { useMemo, useRef } from "react";
import { SortedColorMetadata } from "./useSortedColorMetadatas";

export const useDisplayedColorNumbers = (sortedColorMetadatas: readonly SortedColorMetadata[] | undefined) => {
  // sortedColorMetadatas can change purely due to changes in labels that have no effect on the displayed color numbers.
  // Use a ref here to avoid returning a different array to calling code unless the contents of that array have actually
  // changed.
  const displayedNumbersRef = useRef<(number | undefined)[] | undefined>();
  return useMemo(() => {
    if (sortedColorMetadatas) {
      let nextDisplayedNumber = 1;
      const _displayedNumbers = new Array<number | undefined>(sortedColorMetadatas.length);
      for (const { originalIndex, treatAsBlank } of sortedColorMetadatas) {
        _displayedNumbers[originalIndex] = treatAsBlank ? undefined : nextDisplayedNumber++;
      }
      return displayedNumbersRef.current && arrayEq(_displayedNumbers, displayedNumbersRef.current)
        ? displayedNumbersRef.current
        : (displayedNumbersRef.current = _displayedNumbers);
    } else {
      displayedNumbersRef.current = undefined;
    }
  }, [sortedColorMetadatas]);
};
