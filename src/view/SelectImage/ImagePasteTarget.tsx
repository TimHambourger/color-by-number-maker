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

import { ALERT, GRAY_MEDIUM } from "app/colorPalette";
import { rule } from "app/nano";
import { ClipboardEventHandler, useState } from "react";
import { RAISED_BOX } from "view/raisedBox";

const CX_PASTE_TARGET = rule({
  ...RAISED_BOX,
  color: GRAY_MEDIUM,
  padding: "12px 10px",
  width: "100%",
});

const CX_VALIDATION_ERROR = rule({
  color: ALERT,
  fontSize: "13px",
  margin: "6px 4px",
});

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
          className={CX_PASTE_TARGET}
          value="Paste image here"
          // Disables the React warning about whether we REALLy wanted a readOnly field here. We do.
          readOnly
          onPaste={pasteEventHandler}
        />
      </div>
      {validationError && <div className={CX_VALIDATION_ERROR}>{validationError}</div>}
    </div>
  );
};
export default ImagePasteTarget;
