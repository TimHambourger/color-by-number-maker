import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(value: T, waitMillis: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  // TODO: This effect works great if value is changing but doesn't really do what you'd expect if waitMillis is the
  // thing that's changing. In that case we'd wanna remember how much time had already elapsed already since the last
  // value update and only set a timeout for the REMAINING time (according to the new waitMillis). Oh well, the only
  // use case we care about in practice is one in which waitMillis is constant.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), waitMillis);
    return () => window.clearTimeout(timeoutId);
  }, [value, waitMillis]);
  return debouncedValue;
};
