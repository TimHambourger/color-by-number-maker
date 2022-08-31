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
