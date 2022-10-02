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
