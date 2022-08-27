import { ClipboardEventHandler, useState } from "react";
import styles from "./ImagePasteTarget.module.css";

export interface ImagePasteTargetProps {
  onPaste: (dataUrl: string) => void;
}

const IMAGE_MEDIA_TYPE = /^image\//;

const ImagePasteTarget: React.FC<ImagePasteTargetProps> = ({ onPaste }) => {
  const [validationError, setValidationError] = useState("");
  const pasteEventHandler: ClipboardEventHandler<HTMLInputElement> = (e) => {
    setValidationError("");
    const imageFile = Array.from(e.clipboardData.files).find((file) => IMAGE_MEDIA_TYPE.test(file.type));
    if (!imageFile) {
      setValidationError("Must paste an image. Try using your browser's Copy Image feature.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      if (reader.error || typeof reader.result !== "string") {
        setValidationError("Error reading image. Please try again.");
      } else {
        onPaste(reader.result);
      }
    });
    reader.readAsDataURL(imageFile);
  };

  return (
    <div>
      <div>
        <input
          className={styles.pasteTarget}
          value=""
          // Disables the React warning about whether we REALLy wanted a readOnly field here. We do.
          readOnly
          onPaste={pasteEventHandler}
        />
      </div>
      {validationError && <div className={styles.validationError}>{validationError}</div>}
    </div>
  );
};
export default ImagePasteTarget;
