import { useAppDispatch, useLoadedImage } from "app/hooks";
import { rule } from "app/nano";
import { useColorByNumberMakerState } from "app/slice";
import { useState } from "react";
import CroppableImage from "./CroppableImage";
import ImagePasteTarget from "./ImagePasteTarget";
import LinkButton from "./LinkButton";
import WizardNavigationControls from "./WizardNavigationControls";

const CX_INSTRUCTIONS = rule({
  marginBottom: "12px",
});

const CX_MORE_ACTIONS = rule({
  marginTop: "6px",
});

interface HasSetIsReplacingImage {
  setIsReplacingImage: (value: boolean) => void;
}

const CX_LANDING_PAGE_TITLE = rule({
  fontSize: "24px",
  textAlign: "center",
});

interface AddOrReplaceImageProps extends HasSetIsReplacingImage {}

const AddOrReplaceImage: React.FC<AddOrReplaceImageProps> = ({ setIsReplacingImage }) => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl },
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
        <div className={CX_MORE_ACTIONS}>
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

const CX_ASPECT_RATIO_CONTAINER = rule({
  fontSize: "12px",
  marginTop: "6px",
  textAlign: "center",
});

const CX_ASPECT_RATIO = rule({
  fontWeight: "bold",
});

const CropImage: React.FC<CropImageProps> = ({ setIsReplacingImage }) => {
  const dispatch = useAppDispatch();
  const {
    state: { dataUrl, cropZone },
    setCropZone,
  } = useColorByNumberMakerState();

  const image = useLoadedImage(dataUrl);

  return (
    <>
      <div className={CX_INSTRUCTIONS}>Crop your image then click CONTINUE.</div>
      <div className={CX_IMAGE_CONTAINER}>
        <CroppableImage
          loadedImage={image}
          width={400}
          cropZone={cropZone}
          onCrop={(newCropZone) => dispatch(setCropZone(newCropZone))}
        />
      </div>
      <div className={CX_MORE_ACTIONS + CX_CROP_IMAGE_LINKS}>
        <LinkButton onClick={() => setIsReplacingImage(true)}>Change image</LinkButton>
        {image && (
          <LinkButton onClick={() => dispatch(setCropZone({ x: 0, y: 0, width: image.width, height: image.height }))}>
            Select whole image
          </LinkButton>
        )}
      </div>
      {cropZone && (
        <div className={CX_ASPECT_RATIO_CONTAINER}>
          <div className={CX_ASPECT_RATIO}>Aspect ratio = {(cropZone.width / cropZone.height).toFixed(2)}</div>
          <div>Suggested ratios: Portrait = 1.0, Landscape = 1.7</div>
        </div>
      )}
      <WizardNavigationControls forwardIsDisabled={!dataUrl || !cropZone} />
    </>
  );
};

const CX_SELECT_IMAGE = rule({
  margin: "10px auto",
  width: "600px",
});

const SelectImage: React.FC = () => {
  const {
    state: { dataUrl },
  } = useColorByNumberMakerState();
  const [isReplacingImage, setIsReplacingImage] = useState(false);

  return (
    <div className={CX_SELECT_IMAGE}>
      {!dataUrl || isReplacingImage ? (
        <AddOrReplaceImage setIsReplacingImage={setIsReplacingImage} />
      ) : (
        <CropImage setIsReplacingImage={setIsReplacingImage} />
      )}
    </div>
  );
};
export default SelectImage;
