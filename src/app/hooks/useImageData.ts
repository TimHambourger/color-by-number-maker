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

import { CropZone } from "app/slice";
import { useMemo } from "react";
import { useLoadedImage } from "./useLoadedImage";

export const useImageData = (dataUrl: string | null | undefined, cropZone: CropZone | null | undefined) => {
  const image = useLoadedImage(dataUrl);
  return useMemo(() => {
    if (image && cropZone) {
      const canvas = document.createElement("canvas");
      canvas.width = cropZone.width;
      canvas.height = cropZone.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to obtain canvas 2D rendering context.");
      context.drawImage(
        image,
        cropZone.x,
        cropZone.y,
        cropZone.width,
        cropZone.height,
        0,
        0,
        cropZone.width,
        cropZone.height,
      );
      return context.getImageData(0, 0, cropZone.width, cropZone.height);
    }
  }, [image, cropZone]);
};
