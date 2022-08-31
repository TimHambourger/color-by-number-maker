import { ALERT, GRAY_MEDIUM } from "app/colorPalette";
import { useDebouncedValue } from "app/hooks";
import { rule } from "app/nano";
import cx from "classnames";
import { constrain } from "lib/constrain";
import { useEffect, useMemo, useState } from "react";

const CX_ROOT = rule({
  display: "inline-block",
});

const CX_INPUT_ELEMENT = rule({
  border: `1px solid ${GRAY_MEDIUM}`,
  borderRadius: "4px",
  padding: "6px",
  width: "100%",
});

const CX_VALIDATION_ERROR = rule({
  color: ALERT,
  fontSize: "13px",
  margin: "6px 4px",
});

export interface DebouncedIntegerInputProps {
  value: number;
  onChange: (newValue: number) => void;
  /**
   * The minimum allowed value (inclusive).
   */
  minValue: number;
  /**
   * The maximum allowed value (inclusive).
   */
  maxValue: number;
  waitMillis: number;
  className?: string;
}

const SIGNED_INTEGER = /^(\+|-)?(\d+)$/;

const DebouncedIntegerInput: React.FC<DebouncedIntegerInputProps> = ({
  value,
  onChange,
  minValue,
  maxValue,
  waitMillis,
  className,
}) => {
  const [rawValue, setRawValue] = useState("" + constrain(value, minValue, maxValue));
  const debouncedValue = useDebouncedValue(rawValue, waitMillis);
  const parsedValue = useMemo(() => {
    const match = debouncedValue.match(SIGNED_INTEGER);
    return match ? (match[1] === "-" ? -1 : 1) * +match[2] : undefined;
  }, [debouncedValue]);
  const validValue = useMemo(
    () => (parsedValue === undefined || parsedValue < minValue || parsedValue > maxValue ? undefined : parsedValue),
    [parsedValue, minValue, maxValue],
  );
  useEffect(() => {
    if (validValue !== undefined && validValue !== value) onChange(validValue);
  }, [validValue, value, onChange]);
  return (
    <div className={cx(CX_ROOT, className)}>
      <div>
        <input className={CX_INPUT_ELEMENT} value={rawValue} onChange={(e) => setRawValue(e.currentTarget.value)} />
      </div>
      {validValue === undefined && (
        <div className={CX_VALIDATION_ERROR}>
          Must be a whole number between {minValue} and {maxValue}.
        </div>
      )}
    </div>
  );
};
export default DebouncedIntegerInput;
