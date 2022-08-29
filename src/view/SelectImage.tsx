import { useAppDispatch, useLoadedImage } from "app/hooks";
import { rule } from "app/nano";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import { useEffect, useState } from "react";
import ImagePasteTarget from "./ImagePasteTarget";
import LinkButton from "./LinkButton";

const CX_LANDING_PAGE_TITLE = rule({
  fontSize: "24px",
  textAlign: "center",
});

const CX_INSTRUCTIONS = rule({
  marginBottom: "12px",
});

const CX_LANDING_PAGE_LINKS = rule({
  marginTop: "6px",
});

interface HasSetIsReplacingImage {
  setIsReplacingImage: (value: boolean) => void;
}

interface AddOrReplaceImageProps extends HasSetIsReplacingImage {}

const AddOrReplaceImage: React.FC<AddOrReplaceImageProps> = ({ setIsReplacingImage }) => {
  const dispatch = useAppDispatch();
  const {
    state: {
      selectImage: { dataUrl },
    },
    setDataUrl,
  } = useColorByNumberMakerState();
  const onReceiveImage = (dataUrl: string) => {
    dispatch(setDataUrl(dataUrl));
    setIsReplacingImage(false);
  };

  return (
    <>
      <h1 className={CX_LANDING_PAGE_TITLE}>Color by Number Maker</h1>
      <div className={CX_INSTRUCTIONS}>Paste your image below to get started.</div>
      <ImagePasteTarget onPaste={onReceiveImage} />
      {dataUrl && (
        <div className={CX_LANDING_PAGE_LINKS}>
          <LinkButton onClick={() => setIsReplacingImage(false)}>Keep previous image</LinkButton>
        </div>
      )}
    </>
  );
};

interface CropImageProps extends HasSetIsReplacingImage {}

const CANVAS_CSS_WIDTH = 400;
const DEFAULT_CANVAS_HEIGHT = 240;

const CX_CANVAS_CONTAINER = rule({
  textAlign: "center",
});

const CropImage: React.FC<CropImageProps> = ({ setIsReplacingImage }) => {
  const {
    state: {
      selectImage: { dataUrl },
    },
  } = useColorByNumberMakerState();

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const image = useLoadedImage(dataUrl);

  // Draw the image on the <canvas> and setImageDimensions
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

  // TODO: Actually support cropping!

  return (
    <>
      <div className={CX_INSTRUCTIONS}>
        Crop your image before continuing.
      </div>
      <div className={CX_CANVAS_CONTAINER}>
        <canvas
          ref={setCanvasElement}
          style={{
            width: CANVAS_CSS_WIDTH,
            height: image ? (CANVAS_CSS_WIDTH / image.width) * image.height : DEFAULT_CANVAS_HEIGHT,
          }}
        />
      </div>
      <div>
        <LinkButton onClick={() => setIsReplacingImage(true)}>Change image</LinkButton>
      </div>
    </>
  );
};

const CX_SELECT_IMAGE = rule({
  margin: "10px auto",
  width: "600px",
});

const SelectImage: React.FC = () => {
  const {
    state: {
      phase,
      selectImage: { dataUrl },
    },
  } = useColorByNumberMakerState();
  const [isReplacingImage, setIsReplacingImage] = useState(false);

  return phase === ColorByNumberMakerPhase.SelectImage ? (
    <div className={CX_SELECT_IMAGE}>
      {!dataUrl || isReplacingImage ? (
        <AddOrReplaceImage setIsReplacingImage={setIsReplacingImage} />
      ) : (
        <CropImage setIsReplacingImage={setIsReplacingImage} />
      )}
    </div>
  ) : null;
};
export default SelectImage;
