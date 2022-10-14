/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

import { assertNearlyInRange } from "lib/constrain";
import { RgbColor } from "./rgbColor";

export class RgbaColor {
  /**
   * In the range 0 - 255 inclusive.
   */
  readonly red: number;
  /**
   * In the range 0 - 255 inclusive.
   */
  readonly green: number;
  /**
   * In the range 0 - 255 inclusive.
   */
  readonly blue: number;
  /**
   * In the range 0 - 255 inclusive.
   */
  readonly alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = assertNearlyInRange(red, 0, 255);
    this.green = assertNearlyInRange(green, 0, 255);
    this.blue = assertNearlyInRange(blue, 0, 255);
    this.alpha = assertNearlyInRange(alpha, 0, 255);
  }

  toRgb(backgroundColor: RgbColor) {
    return new RgbColor(
      (this.alpha / 255) * this.red + (1 - this.alpha / 255) * backgroundColor.red,
      (this.alpha / 255) * this.green + (1 - this.alpha / 255) * backgroundColor.green,
      (this.alpha / 255) * this.blue + (1 - this.alpha / 255) * backgroundColor.blue,
    );
  }
}
