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

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * A hook that returns an `HTMLImageElement` whose `src` is the given url. The image is returned only once the image has
 * successfully loaded; in the meantime `undefined` is returned.
 */
export const useLoadedImage = (url: string | null | undefined) => {
  const image = useMemo(() => {
    if (url) {
      const _image = document.createElement("img");
      _image.src = url;
      return _image;
    } else {
      return undefined;
    }
  }, [url]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const onImageLoad = useCallback(() => setImageLoaded(true), [setImageLoaded]);

  useEffect(() => {
    if (image) {
      image.addEventListener("load", onImageLoad);
      return () => {
        setImageLoaded(false);
        image.removeEventListener("load", onImageLoad);
      };
    }
  }, [image, onImageLoad]);

  return imageLoaded && image && image.width > 0 && image.height > 0 ? image : undefined;
};
