/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

import { shiftAngle } from "./shiftAngle";

test("shiftAngle shifts angle correctly", () => {
  expect(shiftAngle(0, 0)).toBe(0);
  expect(shiftAngle(90, 0)).toBe(90);
  expect(shiftAngle(360, 0)).toBe(0);
  expect(shiftAngle(720, 0)).toBe(0);
  expect(shiftAngle(720, 360)).toBe(360);
  expect(shiftAngle(370, 0)).toBe(10);
  expect(shiftAngle(-10, 0)).toBe(350);
  expect(shiftAngle(-370, 0)).toBe(350);
  expect(shiftAngle(180, -180)).toBe(-180);
  expect(shiftAngle(190, -180)).toBe(-170);
  expect(shiftAngle(360, -180)).toBe(0);
});
