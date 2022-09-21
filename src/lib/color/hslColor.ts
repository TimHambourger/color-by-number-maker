import { assertNearlyInRange } from "lib/constrain";
import { shiftAngle } from "lib/shiftAngle";
import { RgbColor } from "./rgbColor";

export class HslColor {
  /**
   * In the range 0 (inclusive) to 360 (exclusive). I.e. in degrees.
   */
  readonly hue: number;
  /**
   * In the range 0 - 1 inclusive.
   */
  readonly saturation: number;
  /**
   * In the range 0 - 1 inclusive.
   */
  readonly lightness: number;

  constructor(hue: number, saturation: number, lightness: number) {
    this.hue = shiftAngle(hue, 0);
    this.saturation = assertNearlyInRange(saturation, 0, 1);
    this.lightness = assertNearlyInRange(lightness, 0, 1);
  }

  /**
   * This color's chroma as defined in https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma.
   */
  get chroma() {
    const value = this.lightness + this.saturation * Math.min(this.lightness, 1 - this.lightness);
    return 2 * (value - this.lightness);
  }

  static fromRgb(rgb: RgbColor) {
    // See https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const maxComponent = Math.max(rgb.red, rgb.green, rgb.blue) / 255;
    const minComponent = Math.min(rgb.red, rgb.green, rgb.blue) / 255;
    const chroma = maxComponent - minComponent;
    const lightness = (maxComponent + minComponent) / 2;
    const saturation =
      lightness > 0 && lightness < 1 ? (maxComponent - lightness) / Math.min(lightness, 1 - lightness) : 0;
    const hue =
      chroma > 0
        ? maxComponent === rgb.red
          ? ((rgb.green - rgb.blue) / 255 / chroma) * 60
          : maxComponent === rgb.green
          ? ((rgb.blue - rgb.red) / 255 / chroma + 2) * 60
          : ((rgb.red - rgb.green) / 255 / chroma + 4) * 60
        : 0;
    return new HslColor(hue, saturation, lightness);
  }
}
