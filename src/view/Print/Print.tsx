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
const CUSTOM_PROPERTY_NON_PRINT_HEIGHT = "--non-print-height";
const CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM = "--non-print-margin-bottom";
const CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR = "--non-print-scale-factor";
const CUSTOM_PROPERTY_PADDING_DEFAULTS = "--padding-defaults";

const CX_PRINT_AREA = rule({
  background: WHITE,
  // Use padding to simulate print margins. We avoid true print margins b/c they bring along other print behavior we
  // don't want. See notes about our @page rule below.
  padding: `var(${CUSTOM_PROPERTY_PADDING_DEFAULTS})`,
  "@media not print": {
    "&": {
      ...RAISED_BOX,
      height: `var(${CUSTOM_PROPERTY_NON_PRINT_HEIGHT})`,
      marginBottom: `var(${CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM})`,
      overflow: "auto",
      transform: `scale(var(${CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR}))`,
      transformOrigin: "top left",
    },
  },
  "@media print": {
    "&": {
      // Suppress bottom padding when actually printing. It doesn't add anything, just makes it more likely that we'll
      // wind up with an extra blank page in the print dialog.
      paddingBottom: 0,
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

  // Maintain the @page at-rule which informs print behavior.
  // See https://developer.mozilla.org/en-US/docs/Web/CSS/@page and https://stackoverflow.com/a/2573612.
  // The technique here is borrowed from nano-css, but we don't actually use nano-css b/c we need to be able to remove
  // as well as add @page at-rules.
  useEffect(() => {
    if (printAreaLayout) {
      const styleEl = document.createElement("style");
      // Gotta append the new <style> element to the <head> element BEFORE trying to call insertRule as styleEl.sheet is
      // null otherwise.
      document.head.appendChild(styleEl);
      styleEl.sheet!.insertRule(
        // "margin: 0" is to avoid the browser adding things like document title, URL, and timestamp. See
        // https://stackoverflow.com/a/2573612. To get back something resembling a page margin we use padding (see
        // above), though this doesn't fully work if the content goes beyond a single page. Oh well. We're really only
        // trying to support short titles and a reasonable number of colors. It's fine if going beyond that causes less
        // than ideal page breaks.
        // Next, as far as size, there's also "size: auto" to let the browser choose the page size/orientation itself,
        // but both Chrome and FF often choose the wrong page orientation, meaning the user has to explicitly override
        // the page orientation in the print dialog. This seems to be especially common if you start with one
        // orientation, print, switch to the other orientation, then print again. Setting an explicit page size (and
        // updating the @page rule when the page orientation changes) gives us full control over the initial selection
        // in the print dialog.
        `@page { margin: 0; size: ${printAreaLayout.pageWidthInches}in ${printAreaLayout.pageHeightInches}in; }`,
      );
      return () => {
        document.head.removeChild(styleEl);
      };
    }
  }, [printAreaLayout]);

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
            width: `${printAreaLayout.pageWidthInches}in`,
            // Only set an explicit height when NOT printing. When printing, let the height be based purely on the
            // contents. This seems to do a better job of avoiding extra blank pages in the print dialog.
            [CUSTOM_PROPERTY_NON_PRINT_HEIGHT as any]: `${printAreaLayout.pageHeightInches}in`,
            [CUSTOM_PROPERTY_NON_PRINT_MARGIN_BOTTOM as any]: `${
              (printAreaNonPrintScaleFactor! - 1) * printAreaLayout.pageHeightInches
            }in`,
            [CUSTOM_PROPERTY_NON_PRINT_SCALE_FACTOR as any]: printAreaNonPrintScaleFactor,
            [CUSTOM_PROPERTY_PADDING_DEFAULTS as any]: `${printAreaLayout.verticalPaddingInches}in ${printAreaLayout.horizontalPaddingInches}in`,
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
