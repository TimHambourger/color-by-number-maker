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

import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(value: T, waitMillis: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  // TODO: This effect works great if value is changing but doesn't really do what you'd expect if waitMillis is the
  // thing that's changing. In that case we'd wanna remember how much time had already elapsed already since the last
  // value update and only set a timeout for the REMAINING time (according to the new waitMillis). Oh well, the only
  // use case we care about in practice is one in which waitMillis is constant.
  useEffect(() => {
    setIsUpdatePending(true);
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
      setIsUpdatePending(false);
    }, waitMillis);
    return () => window.clearTimeout(timeoutId);
  }, [value, waitMillis]);
  return [debouncedValue, isUpdatePending] as const;
};
