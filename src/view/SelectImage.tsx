import { useAppDispatch, useLoadedImage } from "app/hooks";
import { rule } from "app/nano";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import { useState } from "react";
import CroppableImage from "./CroppableImage";
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

const CX_IMAGE_CONTAINER = rule({
  textAlign: "center",
});

const CX_CROP_IMAGE_LINKS = rule({
  display: "flex",
  justifyContent: "space-between",
});

const CropImage: React.FC<CropImageProps> = ({ setIsReplacingImage }) => {
  const dispatch = useAppDispatch();
  const {
    state: {
      selectImage: { dataUrl, cropZone },
    },
    setCropZone,
  } = useColorByNumberMakerState();

  const image = useLoadedImage(dataUrl);

  return (
    <>
      <div className={CX_INSTRUCTIONS}>Crop your image before continuing.</div>
      <div className={CX_IMAGE_CONTAINER}>
        <CroppableImage
          loadedImage={image}
          width={400}
          cropZone={cropZone}
          onCrop={(newCropZone) => dispatch(setCropZone(newCropZone))}
        />
      </div>
      {cropZone && (
        <div>
          Width : height ratio = {cropZone.width / cropZone.height}
          {/* TODO: Provide guidance about good ratios for portrait vs landscape. */}
        </div>
      )}
      <div className={CX_CROP_IMAGE_LINKS}>
        <LinkButton onClick={() => setIsReplacingImage(true)}>Change image</LinkButton>
        {image && (
          <LinkButton onClick={() => dispatch(setCropZone({ x: 0, y: 0, width: image.width, height: image.height }))}>
            Select whole image
          </LinkButton>
        )}
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
