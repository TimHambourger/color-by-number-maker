import { RgbColor } from "./rgbColor";

export class RgbaColor {
  constructor(
    /**
     * In the range 0 - 255 inclusive.
     */
    readonly red: number,
    /**
     * In the range 0 - 255 inclusive.
     */
    readonly green: number,
    /**
     * In the range 0 - 255 inclusive.
     */
    readonly blue: number,
    /**
     * In the range 0 - 255 inclusive.
     */
    readonly alpha: number
  ) {}

  toRgb(backgroundColor: RgbColor) {
    return new RgbColor(
      this.alpha / 255 * this.red + (1 - this.alpha / 255) * backgroundColor.red,
      this.alpha / 255 * this.green + (1 - this.alpha / 255) * backgroundColor.green,
      this.alpha / 255 * this.blue + (1 - this.alpha / 255) * backgroundColor.blue,
    );
  }
}
