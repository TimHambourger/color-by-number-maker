import { WHITE } from "app/colorPalette";
import { rule } from "app/nano";
import { CropZone } from "app/slice";
import { constrain } from "lib/constrain";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_WIDTH_TO_HEIGHT_RATIO = 5 / 3;

const CX_CONTAINER = rule({
  display: "inline-block",
  position: "relative",
});

const CX_CANVAS = rule({
  height: "100%",
  width: "100%",
});

const CX_CROP_ZONE = rule({
  border: `2px dashed ${WHITE}`,
  position: "absolute",
});

export interface CroppableImageProps {
  loadedImage: HTMLImageElement | undefined;
  width: number;
  cropZone: CropZone | undefined;
  onCrop: (newCropZone: CropZone) => void;
}

const CroppableImage: React.FC<CroppableImageProps> = ({ loadedImage: image, width, cropZone, onCrop }) => {
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  // Draw the image on the <canvas>
  useEffect(() => {
    if (canvasElement && image) {
      const context = canvasElement.getContext("2d");
      if (!context) {
        throw new Error("Unable to obtain canvas 2d rendering context.");
      }
      canvasElement.width = image.width;
      canvasElement.height = image.height;
      context.drawImage(image, 0, 0);
    }
  }, [canvasElement, image]);

  const cropZonePositioning = useMemo(() => {
    if (!cropZone || !image) return undefined;
    const { x, y, width, height } = cropZone;
    const relativeTop = constrain(y / image.height, 0, 1);
    const relativeHeight = constrain(height / image.height, 0, 1 - relativeTop);
    const relativeLeft = constrain(x / image.width, 0, 1);
    const relativeWidth = constrain(width / image.width, 0, 1 - relativeLeft);
    return {
      top: `${relativeTop * 100}%`,
      height: `${relativeHeight * 100}%`,
      left: `${relativeLeft * 100}%`,
      width: `${relativeWidth * 100}%`,
    };
  }, [cropZone, image]);

  // Start position of the current crop gesture, if any, in image pixels.
  const cropGestureStartRef = useRef<
    | {
        /**
         * x coordinate of the start of the current crop gesture, if any, in image pixels
         */
        x: number;
        /**
         * y coordinate of the start of the current crop gesture, if any, in image pixels
         */
        y: number;
        /**
         * The bounding client rect of the canvas element when the current crop gesture, if any, started.
         */
        canvasRect: DOMRect;
      }
    | undefined
  >();

  const coordinateTranslations = useCallback(
    (canvasRect: DOMRect) =>
      image && {
        clientXToImageX: (clientX: number) => ((clientX - canvasRect.x) / canvasRect.width) * image.width,
        clientYToImageY: (clientY: number) => ((clientY - canvasRect.y) / canvasRect.height) * image.height,
      },
    [image],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const cropGestureStart = cropGestureStartRef.current;
      const coordsTx = cropGestureStart && coordinateTranslations(cropGestureStart.canvasRect);
      if (image && coordsTx) {
        const imageX = coordsTx.clientXToImageX(e.clientX);
        const imageY = coordsTx.clientYToImageY(e.clientY);
        const cropZoneX = constrain(Math.min(imageX, cropGestureStart.x), 0, image.width);
        const cropZoneY = constrain(Math.min(imageY, cropGestureStart.y), 0, image.height);
        onCrop({
          x: cropZoneX,
          y: cropZoneY,
          width: constrain(Math.max(imageX, cropGestureStart.x), cropZoneX, image.width) - cropZoneX,
          height: constrain(Math.max(imageY, cropGestureStart.y), cropZoneY, image.height) - cropZoneY,
        });
      }
    },
    [coordinateTranslations, image, onCrop],
  );

  const onMouseUp = useCallback(() => {
    cropGestureStartRef.current = undefined;
  }, []);

  const onCropGestureStart = useCallback(
    (e: React.MouseEvent) => {
      const canvasRect = canvasElement?.getBoundingClientRect();
      const coordsTx = canvasRect && coordinateTranslations(canvasRect);
      if (coordsTx) {
        cropGestureStartRef.current = {
          x: coordsTx.clientXToImageX(e.clientX),
          y: coordsTx.clientYToImageY(e.clientY),
          canvasRect,
        };
        document.addEventListener("mousemove", onMouseMove);
        // Capture onMouseMove and onMouseUp as they were at the time we added those event listeners.
        const trueOnMouseUp = () => {
          onMouseUp();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", trueOnMouseUp);
        };
        document.addEventListener("mouseup", trueOnMouseUp);
      }
    },
    [coordinateTranslations, canvasElement, onMouseMove, onMouseUp],
  );

  return (
    <div
      className={CX_CONTAINER}
      style={{
        width,
        height: width * (image ? image.height / image.width : 1 / DEFAULT_WIDTH_TO_HEIGHT_RATIO),
      }}
      onMouseDown={onCropGestureStart}
    >
      <canvas ref={setCanvasElement} className={CX_CANVAS} />
      {cropZonePositioning && <div style={cropZonePositioning} className={CX_CROP_ZONE} />}
    </div>
  );
};
export default CroppableImage;
