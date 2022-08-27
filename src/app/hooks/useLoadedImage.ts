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

  return imageLoaded ? image : undefined;
};
