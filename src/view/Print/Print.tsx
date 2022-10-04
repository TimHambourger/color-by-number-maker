import { WHITE } from "app/colorPalette";
import { useAppDispatch, useDisplayedColorNumbers, useSortedColorMetadatas } from "app/hooks";
import { rule } from "app/nano";
import { ALL_ORIENTATIONS, CropZone, PageOrientation, useColorByNumberMakerState } from "app/slice";
import { useCallback, useEffect, useMemo } from "react";
import ColorByNumberImage, { ImageBoxBackground, ImageBoxText } from "view/ColorByNumberImage";
import { RAISED_BOX } from "view/raisedBox";
import WizardNavigationControls from "view/WizardNavigationControls";
import WizardPage, { WIZARD_PAGE_WIDTH_PX } from "view/WizardPage";
import ColorByNumberLegend from "./ColorByNumberLegend";

// See https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#absolute_length_units
const PIXELS_PER_INCH = 96;

interface PrintAreaLayoutParams {
  pageWidthInches: number;
  pageHeightInches: number;
  horizontalPaddingInches: number;
  verticalPaddingInches: number;
  maxImageHeightInches: number;
  maxLegendColumns: number;
}

class PrintAreaLayoutEngine {
  constructor(private readonly p: PrintAreaLayoutParams) {}

  imageDimensions(cropZone: CropZone) {
    const maxWidth = this.p.pageWidthInches - 2 * this.p.horizontalPaddingInches;
    const widthFromMaxHeight = (this.p.maxImageHeightInches / cropZone.height) * cropZone.width;
    const widthInches = Math.min(maxWidth, widthFromMaxHeight);
    const heightInches = (widthInches / cropZone.width) * cropZone.height;
    return { widthInches, heightInches };
  }

  imagePerimeterInches(cropZone: CropZone) {
    const { widthInches, heightInches } = this.imageDimensions(cropZone);
    return 2 * (widthInches + heightInches);
  }

  computeLayout(cropZone: CropZone) {
    const { widthInches: imageWidthInches, heightInches: imageHeightInches } = this.imageDimensions(cropZone);
    const { maxImageHeightInches, ...rest } = this.p;
    return {
      ...rest,
      imageWidthInches,
      imageHeightInches,
    };
  }
}

const ENGINES: { [O in PageOrientation]: PrintAreaLayoutEngine } = {
  [PageOrientation.Portrait]: new PrintAreaLayoutEngine({
    pageWidthInches: 8.5,
    pageHeightInches: 11,
    horizontalPaddingInches: 0.5,
    verticalPaddingInches: 0.5,
    maxImageHeightInches: 8,
    maxLegendColumns: 4,
  }),
  [PageOrientation.Landscape]: new PrintAreaLayoutEngine({
    pageWidthInches: 11,
    pageHeightInches: 8.5,
    horizontalPaddingInches: 0.5,
    verticalPaddingInches: 0.5,
    maxImageHeightInches: 6,
    maxLegendColumns: 6,
  }),
};

const ORIENTATION_NAMES: { [O in PageOrientation]: string } = {
  [PageOrientation.Portrait]: "Portrait",
  [PageOrientation.Landscape]: "Landscape",
};

const CX_ORIENTATION_SELECTOR = rule({
  marginBottom: "16px",
  textAlign: "right",

  "@media print": {
    "&": {
      display: "none",
    },
  },
});

const CX_ORIENTATION_LABEL_TEXT = rule({
  marginRight: "12px",
});

// Using custom properties (i.e. CSS variables) to be able to set style properties at component render time that
// nonetheless only apply when NOT printing.
const CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR = "--non-print-scale-factor";
const CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM = "--non-print-margin-bottom";

const CX_PRINT_AREA = rule({
  background: WHITE,
  "@media not print": {
    "&": {
      ...RAISED_BOX,
      marginBottom: `var(${CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM})`,
      transform: `scale(var(${CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR}))`,
      transformOrigin: "top left",
    },
  },
});

const CX_TITLE = rule({
  fontSize: "24px",
});

const CX_IMAGE = rule({
  margin: "16px auto",
});

const Print: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    state: { cropZone, boxesWide, boxesHigh, title, averagedColors, resolvedColors, colorMetadatas, orientation },
    setOrientation,
  } = useColorByNumberMakerState();

  useEffect(() => {
    if (orientation === undefined && cropZone !== undefined) {
      dispatch(
        setOrientation(
          // Choose the page orientation that maximizes rendered image perimeter.
          ALL_ORIENTATIONS.map((o) => [o, ENGINES[o].imagePerimeterInches(cropZone)] as const).reduce((acc, nextTup) =>
            nextTup[1] > acc[1] ? nextTup : acc,
          )[0],
        ),
      );
    }
  }, [orientation, cropZone, dispatch, setOrientation]);

  const printAreaLayout = useMemo(
    () => (orientation === undefined ? undefined : cropZone && ENGINES[orientation].computeLayout(cropZone)),
    [orientation, cropZone],
  );

  const printAreaNonPrintScaleFactor =
    printAreaLayout && WIZARD_PAGE_WIDTH_PX / (printAreaLayout.pageWidthInches * PIXELS_PER_INCH);

  const sortedMetadatas = useSortedColorMetadatas(resolvedColors, colorMetadatas);
  const displayedNumbers = useDisplayedColorNumbers(sortedMetadatas);

  const renderImageBoxContent = useCallback(
    (resolvedColorIndex: number) => (
      <>
        <ImageBoxBackground fill={WHITE} />
        <ImageBoxText>{displayedNumbers?.[resolvedColorIndex]}</ImageBoxText>
      </>
    ),
    [displayedNumbers],
  );

  return (
    <WizardPage>
      {orientation !== undefined && (
        <div className={CX_ORIENTATION_SELECTOR}>
          <label>
            <span className={CX_ORIENTATION_LABEL_TEXT}>Page Orientation</span>
            <select value={orientation} onChange={(e) => dispatch(setOrientation(e.target.value as PageOrientation))}>
              {ALL_ORIENTATIONS.map((o) => (
                <option key={o} value={o}>
                  {ORIENTATION_NAMES[o]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {printAreaLayout && (
        <div
          className={CX_PRINT_AREA}
          style={{
            padding: `${printAreaLayout.verticalPaddingInches}in ${printAreaLayout.horizontalPaddingInches}in`,
            height: `${printAreaLayout.pageHeightInches}in`,
            width: `${printAreaLayout.pageWidthInches}in`,
            [CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR as any]: printAreaNonPrintScaleFactor,
            [CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM as any]: `${
              (printAreaNonPrintScaleFactor! - 1) * printAreaLayout.pageHeightInches * PIXELS_PER_INCH
            }px`,
          }}
        >
          <div className={CX_TITLE}>{title}</div>
          {averagedColors && resolvedColors && (
            <ColorByNumberImage
              className={CX_IMAGE}
              pixelsWide={printAreaLayout.imageWidthInches * PIXELS_PER_INCH}
              pixelsHigh={printAreaLayout.imageHeightInches * PIXELS_PER_INCH}
              boxesWide={boxesWide}
              boxesHigh={boxesHigh}
              averagedColors={averagedColors}
              resolvedColors={resolvedColors}
              renderBoxContent={renderImageBoxContent}
            />
          )}
          {sortedMetadatas && displayedNumbers && (
            <ColorByNumberLegend
              sortedMetadatas={sortedMetadatas}
              displayedNumbers={displayedNumbers}
              maxColumns={printAreaLayout.maxLegendColumns}
            />
          )}
        </div>
      )}
      <WizardNavigationControls forwardText="Print" onForwardClick={() => window.print()} forwardIsDisabled={false} />
    </WizardPage>
  );
};
export default Print;
