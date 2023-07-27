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

import { ALERT, GRAY_MEDIUM } from "app/colorPalette";
import { useDebouncedValue } from "app/hooks";
import { rule } from "app/nano";
import cx from "classnames";
import { RgbColor, RgbVector } from "lib/color";
import { constrain } from "lib/constrain";
import { useCallback, useEffect, useMemo, useState } from "react";

export const CX_ROOT = rule({
  display: "inline-block",
});

export const CX_INPUT_ELEMENT = rule({
  border: `1px solid ${GRAY_MEDIUM}`,
  borderRadius: "4px",
  padding: "6px",
  width: "80px",
});

export const CX_VALIDATION_ERROR = rule({
  color: ALERT,
  fontSize: "13px",
  margin: "6px 4px",
});

export type ParseResult<TValue> = { isSuccess: true; value: TValue } | { isSuccess: false; error: string };

export interface ColorSettingProps<TValue> {
  label: string;
  value: TValue;
  onChange: (newValue: TValue) => void;
  display: (value: TValue) => string;
  parse: (debouncedValue: string) => ParseResult<TValue>;
  areValuesEqual?: (value1: TValue, value2: TValue) => boolean;
  waitMillis?: number;
  className?: string;
}

export function ColorSetting<TValue>({
  label,
  value,
  onChange,
  display,
  parse,
  areValuesEqual = (value1, value2) => value1 === value2,
  waitMillis = 300,
  className,
}: ColorSettingProps<TValue>) {
  const [inputValue, setInputValue] = useState(display(value));
  const [debouncedValue] = useDebouncedValue(inputValue, waitMillis);
  const parseResult = useMemo(() => parse(debouncedValue), [parse, debouncedValue]);

  useEffect(() => {
    if (parseResult.isSuccess && !areValuesEqual(parseResult.value, value)) onChange(parseResult.value);
  }, [parseResult, areValuesEqual, value, onChange]);

  return (
    <div className={cx(CX_ROOT, className)}>
      <div>
        <label>
          {label}{" "}
          <input
            className={CX_INPUT_ELEMENT}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
          />
        </label>
      </div>
      {parseResult && !parseResult.isSuccess && <div className={CX_VALIDATION_ERROR}>{parseResult.error}</div>}
    </div>
  );
}

export interface IntegerColorSettingProps extends Omit<ColorSettingProps<number>, "display" | "parse"> {
  /**
   * The minimum allowed value (inclusive).
   */
  minValue: number;
  /**
   * The maximum allowed value (inclusive).
   */
  maxValue: number;
}

const SIGNED_INTEGER = /^(\+|-)?(\d+)$/;

export const IntegerColorSetting: React.FC<IntegerColorSettingProps> = ({ minValue, maxValue, ...rest }) => {
  const display = useCallback((value: number) => "" + constrain(value, minValue, maxValue), [minValue, maxValue]);
  const parse = useCallback(
    (debouncedValue: string): ParseResult<number> => {
      const match = debouncedValue.match(SIGNED_INTEGER);
      const parsed = match ? (match[1] === "-" ? -1 : 1) * +match[2] : undefined;
      return parsed === undefined || parsed < minValue || parsed > maxValue
        ? {
            isSuccess: false,
            error: `Must be a whole number between ${minValue} and ${maxValue}.`,
          }
        : {
            isSuccess: true,
            value: parsed,
          };
    },
    [minValue, maxValue],
  );
  return <ColorSetting display={display} parse={parse} {...rest} />;
};

export type FloatColorSettingProps = Omit<ColorSettingProps<number>, "display" | "parse"> &
  (
    | {
        /**
         * An optional validator to limit which values are allowed.
         */
        validator?: undefined;
        /**
         * Optional text filling in the blank in the sentence "Must be a ___."
         */
        numberTypeText?: undefined;
      }
    | {
        /**
         * An optional validator to limit which values are allowed.
         * @param value The value proposed by the user.
         * @returns `true` if the value is allowed, `false` otherwise.
         */
        validator: (value: number) => boolean;
        /**
         * Optional text filling in the blank in the sentence "Must be a ___."
         */
        numberTypeText: string;
      }
  );

const SIGNED_FLOAT = /^(\+|-)?((?:\d*\.)?\d+)$/;

export const FloatColorSetting: React.FC<FloatColorSettingProps> = ({ validator, numberTypeText, ...rest }) => {
  const display = useCallback((value: number) => "" + value, []);
  const parse = useCallback(
    (debouncedValue: string): ParseResult<number> => {
      const match = debouncedValue.match(SIGNED_FLOAT);
      const parsed = match ? (match[1] === "-" ? -1 : 1) * +match[2] : undefined;
      return parsed === undefined || (validator && !validator(parsed))
        ? {
            isSuccess: false,
            error: `Must be a ${numberTypeText || "number"}.`,
          }
        : {
            isSuccess: true,
            value: parsed,
          };
    },
    [validator, numberTypeText],
  );
  return <ColorSetting display={display} parse={parse} {...rest} />;
};

export interface RgbVectorColorSettingProps extends Omit<ColorSettingProps<RgbVector>, "display" | "parse"> {}

const displayRgbVector = (value: RgbVector) => RgbColor.fromVector(value).toHexCode();
const parseRgbVector = (debouncedValue: string): ParseResult<RgbVector> => {
  const parsed = RgbColor.fromHexCode(debouncedValue);
  return parsed
    ? { isSuccess: true, value: parsed.toVector() }
    : { isSuccess: false, error: "Must be a color in #RGB or #RRGGBB format." };
};

export const RgbVectorColorSetting: React.FC<RgbVectorColorSettingProps> = (props) => (
  <ColorSetting display={displayRgbVector} parse={parseRgbVector} {...props} />
);
