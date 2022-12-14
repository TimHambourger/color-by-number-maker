/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is MIT Licensed. See /src/lib/LICENSE.
 */

import { assertNearlyInRange } from "lib/constrain";

export type RgbVector = [red: number, green: number, blue: number];

export class RgbColor {
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

  constructor(red: number, green: number, blue: number) {
    this.red = assertNearlyInRange(red, 0, 255);
    this.green = assertNearlyInRange(green, 0, 255);
    this.blue = assertNearlyInRange(blue, 0, 255);
  }

  toVector(): RgbVector {
    return [this.red, this.green, this.blue];
  }

  static fromVector(vector: RgbVector) {
    return new RgbColor(vector[0], vector[1], vector[2]);
  }

  toHexCode() {
    return `#${this.hexify(this.red)}${this.hexify(this.green)}${this.hexify(this.blue)}`;
  }

  private hexify(colorAmount: number) {
    return ("0" + Math.round(colorAmount).toString(16)).slice(-2);
  }

  private static HEX_CODE = /^#?([a-f0-9]{3}|[a-f0-9]{6})$/i;

  static fromHexCode(hexCode: string) {
    const match = hexCode.match(RgbColor.HEX_CODE);
    if (match) {
      const val = match[1];
      return val.length === 3
        ? new RgbColor(parseInt(val[0] + val[0], 16), parseInt(val[1] + val[1], 16), parseInt(val[2] + val[2], 16))
        : new RgbColor(parseInt(val.slice(0, 2), 16), parseInt(val.slice(2, 4), 16), parseInt(val.slice(4, 6), 16));
    }
  }
}
