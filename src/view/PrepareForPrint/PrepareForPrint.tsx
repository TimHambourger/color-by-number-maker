import { ACCENT_DARK, ACCENT_PALE_TRANSPARENT, GRAY_MEDIUM, WHITE } from "app/colorPalette";
import { useAppDispatch, useDisplayedColorNumbers, useSortedColorMetadatas } from "app/hooks";
import { rule } from "app/nano";
import { ColorMetadata, useColorByNumberMakerState } from "app/slice";
import cx from "classnames";
import { arrayEq } from "lib/arrayEq";
import { RgbColor } from "lib/color";
import { useCallback } from "react";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import ColorByNumberImage, { ImageBoxBackground, ImageBoxText } from "view/ColorByNumberImage";
import WizardNavigationControls from "view/WizardNavigationControls";
import WizardPage, { WIZARD_PAGE_WIDTH_PX } from "view/WizardPage";

const PREVIEW_WIDTH_PX = WIZARD_PAGE_WIDTH_PX;

const CX_INSTRUCTIONS = rule({
  marginBottom: "12px",
});

const CX_TITLE_INPUT_CONTAINER = rule({
  marginBottom: "12px",
});

const CX_TITLE_INPUT = rule({
  border: "none",
  borderRadius: "3px",
  fontSize: "18px",
  lineHeight: "18px",
  padding: "8px",
  width: "100%",
});

const CX_PREVIEW = rule({
  display: "block",
  margin: "0 auto",
});

const CX_COLOR_METADATA_ROW_IS_SELECTED = "is-selected";

const CX_COLOR_METADATA_ROW = rule({
  border: "1px solid transparent",
  borderRadius: "3px",
  fontSize: "13px",
  margin: "2px 0",
  padding: "3px 10px",
  "& > *": {
    verticalAlign: "middle",
  },
  [`&.${CX_COLOR_METADATA_ROW_IS_SELECTED}`]: {
    background: ACCENT_PALE_TRANSPARENT,
    borderColor: ACCENT_DARK,
  },
});

const CX_COLOR_SWATCH = rule({
  border: `1px solid ${GRAY_MEDIUM}`,
  display: "inline-block",
  height: "12px",
  marginRight: "8px",
  width: "12px",
});

const CX_COLOR_LABEL_INPUT = rule({
  border: "none",
  borderRadius: "3px",
  marginRight: "8px",
  padding: "4px",
  width: "180px",
});

const CX_TREAT_AS_BLANK_LABEL = rule({
  cursor: "pointer",
  "& > *": {
    cursor: "pointer",
    verticalAlign: "middle",
  },
});

const PrepareForPrint: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { cropZone, boxesWide, boxesHigh, averagedColors, resolvedColors, title, colorMetadatas },
    setTitle,
    setColorMetadatas,
  } = useColorByNumberMakerState();

  const [selectedColorIndex, setSelectedColorIndex] = useState<number>();
  const colorIndicesByElement = useMemo(() => new WeakMap<HTMLElement, number>(), []);

  useEffect(() => {
    const handleColorSelectionEvent = (e: Event) => {
      let element = e.target instanceof HTMLElement ? e.target : null;
      while (element) {
        const colorIndex = colorIndicesByElement.get(element);
        if (colorIndex !== undefined) {
          // Our event originated from inside an element that has a known color index associated with it.
          setSelectedColorIndex(colorIndex);
          return;
        }
        element = element.parentElement;
      }
      // Our event originated from outside any element that has a known color index associated with it.
      setSelectedColorIndex(undefined);
    };
    document.addEventListener("click", handleColorSelectionEvent);
    document.addEventListener("focusin", handleColorSelectionEvent);
    return () => {
      document.removeEventListener("click", handleColorSelectionEvent);
      document.removeEventListener("focusin", handleColorSelectionEvent);
    };
  }, [colorIndicesByElement]);

  useEffect(() => {
    if (resolvedColors && !colorMetadatas) {
      dispatch(
        setColorMetadatas(
          resolvedColors.map(
            (color): ColorMetadata => ({
              treatAsBlank: arrayEq(
                // Route through toHexCode -> fromHexCode as a way of normalizing
                RgbColor.fromHexCode(RgbColor.fromVector(color).toHexCode())!.toVector(),
                [255, 255, 255],
              ),
              label: "",
            }),
          ),
        ),
      );
    }
  }, [resolvedColors, colorMetadatas, dispatch, setColorMetadatas]);

  const sortedMetadatas = useSortedColorMetadatas(resolvedColors, colorMetadatas);

  const enrichedColors = useMemo(
    () =>
      resolvedColors &&
      sortedMetadatas &&
      sortedMetadatas.map((m) => ({
        ...m,
        hexCode: RgbColor.fromVector(resolvedColors[m.originalIndex]).toHexCode(),
      })),
    [resolvedColors, sortedMetadatas],
  );

  const displayedNumbers = useDisplayedColorNumbers(sortedMetadatas);

  const updateMetadata = (metadataIndex: number, metadataUpdater: (metadata: ColorMetadata) => ColorMetadata) => {
    const newColorMetadatas = colorMetadatas?.map((metadata, index) =>
      index === metadataIndex ? metadataUpdater(metadata) : metadata,
    );
    if (newColorMetadatas) dispatch(setColorMetadatas(newColorMetadatas));
  };

  const imageStyle = useMemo(
    (): CSSProperties => ({
      width: PREVIEW_WIDTH_PX,
      height: (PREVIEW_WIDTH_PX * cropZone!.height) / cropZone!.width,
    }),
    [cropZone],
  );

  const renderImageBoxContent = useCallback(
    (resolvedColorIndex: number) => (
      <>
        <ImageBoxBackground
          fill={
            resolvedColorIndex === selectedColorIndex
              ? RgbColor.fromVector(resolvedColors![resolvedColorIndex]).toHexCode()
              : WHITE
          }
        />
        <ImageBoxText>{displayedNumbers?.[resolvedColorIndex]}</ImageBoxText>
      </>
    ),
    [selectedColorIndex, resolvedColors, displayedNumbers],
  );

  return (
    <WizardPage>
      <div className={CX_INSTRUCTIONS}>Enter a title for your color-by-number sheet and label your colors.</div>
      <div className={CX_TITLE_INPUT_CONTAINER}>
        <input
          className={CX_TITLE_INPUT}
          placeholder="Title"
          value={title}
          onChange={(e) => dispatch(setTitle(e.target.value))}
        />
      </div>
      <div>
        {cropZone && averagedColors && resolvedColors && (
          <ColorByNumberImage
            className={CX_PREVIEW}
            style={imageStyle}
            boxesWide={boxesWide}
            boxesHigh={boxesHigh}
            averagedColors={averagedColors}
            resolvedColors={resolvedColors}
            renderBoxContent={renderImageBoxContent}
          />
        )}
      </div>
      <div>
        {enrichedColors?.map((enriched) => (
          <div
            key={enriched.originalIndex}
            className={cx(CX_COLOR_METADATA_ROW, {
              [CX_COLOR_METADATA_ROW_IS_SELECTED]: enriched.originalIndex === selectedColorIndex,
            })}
            ref={(el) => el && colorIndicesByElement.set(el, enriched.originalIndex)}
          >
            <span className={CX_COLOR_SWATCH} style={{ background: enriched.hexCode }} />
            <input
              className={CX_COLOR_LABEL_INPUT}
              placeholder="Label"
              value={enriched.label}
              disabled={enriched.treatAsBlank}
              onChange={(e) => updateMetadata(enriched.originalIndex, (it) => ({ ...it, label: e.target.value }))}
              onFocus={(e) => e.target.select()}
            />
            <label className={CX_TREAT_AS_BLANK_LABEL}>
              <input
                type="checkbox"
                checked={enriched.treatAsBlank}
                onChange={(e) =>
                  updateMetadata(enriched.originalIndex, (it) => ({ ...it, treatAsBlank: e.target.checked }))
                }
              />
              <span>Treat as Blank</span>
            </label>
          </div>
        ))}
      </div>
      <WizardNavigationControls
        forwardIsDisabled={!title || !colorMetadatas || colorMetadatas.some((m) => !m.label && !m.treatAsBlank)}
      />
    </WizardPage>
  );
};
export default PrepareForPrint;
