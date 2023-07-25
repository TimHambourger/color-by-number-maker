/**
 * Copyright 2023 Tim Hambourger
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

import { RgbColor } from "lib/color";
import { AssignColorsRequest, AssignColorsResponse } from "./api";
import { assignColorToBox } from "lib/assignColorToBox";

onmessage = ({ data: { sampledColors, resolvedColors, prevalenceBias } }: MessageEvent<AssignColorsRequest>) => {
  const resolvedColorObjects = resolvedColors.map(RgbColor.fromVector);
  const response: AssignColorsResponse = {
    colorAssignments: sampledColors.map((samplesForBox) =>
      assignColorToBox(samplesForBox.map(RgbColor.fromVector), resolvedColorObjects, prevalenceBias),
    ),
  };
  postMessage(response);
};
