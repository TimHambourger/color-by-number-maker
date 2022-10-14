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

import { averageColors } from "lib/averageColors";
import { RgbColor } from "lib/color";
import { constrain } from "lib/constrain";
import { AverageColorsRequest, AverageColorsResponse } from "./api";

onmessage = ({ data: { imageData, boxesWide, boxesHigh, backgroundColor } }: MessageEvent<AverageColorsRequest>) => {
  const response: AverageColorsResponse = {
    averagedColors: averageColors(
      imageData,
      constrain(boxesWide, 1, imageData.width),
      constrain(boxesHigh, 1, imageData.height),
      RgbColor.fromVector(backgroundColor),
    ),
  };
  postMessage(response);
};
