/**
 * Copyright 2022 - 2023 Tim Hambourger
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

import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { arrayEq } from "lib/arrayEq";
import { RgbVector } from "../lib/color";
import { useAppSelector } from "./hooks";
import { RootState } from "./store";

export enum ColorByNumberMakerPhase {
  SelectImage = 0,
  GenerateColors = 1,
  PrepareForPrint = 2,
  Print = 3,
}

/**
 * All possible color-by-number-maker phases, in order from first to last.
 */
export const ALL_PHASES = Object.values(ColorByNumberMakerPhase)
  .filter((val): val is ColorByNumberMakerPhase => typeof val === "number")
  .sort((phase1, phase2) => phase1 - phase2);

/**
 * Crop zone coordinates. All numbers are in pixels.
 */
export interface CropZone {
  /**
   * x coordinate of the top left corner of the crop zone, in pixels relative to the overall image's coordinate system
   */
  x: number;
  /**
   * y coordinate of the top left corner of the crop zone, in pixels relative to the overall image's coordinate system
   */
  y: number;
  /**
   * width of the crop zone in pixels
   */
  width: number;
  /**
   * height of the crop zone in pixels
   */
  height: number;
}

const areCropZonesEqual = (zone1: CropZone | undefined, zone2: CropZone | undefined) =>
  zone1 && zone2
    ? zone1.x === zone2.x && zone1.y === zone2.y && zone1.width === zone2.width && zone1.height === zone2.height
    : zone1 === zone2;

export interface PointOfEmphasis {
  /**
   * x coordinate of the point of emphasis, in pixels relative to the selected crop zone. I.e. 0 is the left edge of the
   * crop zone.
   */
  x: number;
  /**
   * y coordinate of the point of emphasis, in pixels relative to the selected crop zone. I.e. 0 is the top edge of the
   * crop zone.
   */
  y: number;
  /**
   * Positive coefficient specifying how much emphasis this point should get when resolving colors. Larger numbers mean
   * more emphasis. Numbers closer to zero mean less emphasis.
   */
  coefficient: number;
  /**
   * A number specifying how strongly concentrated around the selected point the emphasis should be. A larger number
   * makes the emphasis more tightly concentrated around the selected point. A number closer to zero makes the emphasis
   * more spread out. Zero is allowed but serves no practical purpose b/c it means all parts of the image receive the
   * same emphasis. Negative numbers are allowed and mean the emphasis INCREASES as distance from the selected point
   * increases.
   */
  exponent: number;
}

const arePointsOfEmphasisEqual = (point1: PointOfEmphasis, point2: PointOfEmphasis) =>
  point1.x === point2.x &&
  point1.y === point2.y &&
  point1.coefficient === point2.coefficient &&
  point1.exponent === point2.exponent;

export interface ColorMetadata {
  /**
   * Whether to treat this number as blank/white. Setting this to true suppresses this color from the legend and causes
   * boxes assigned to this color to remain blank.
   */
  treatAsBlank: boolean;
  /**
   * The label used for this color in the legend.
   */
  label: string;
}

const areColorMetadatasEqual = (metadata1: ColorMetadata, metadata2: ColorMetadata) =>
  metadata1.treatAsBlank === metadata2.treatAsBlank && metadata1.label === metadata2.label;

const areRgbVectorArraysEqual = (
  colors1: readonly RgbVector[] | undefined,
  colors2: readonly RgbVector[] | undefined,
) => (colors1 && colors2 ? arrayEq(colors1, colors2, (v1, v2) => arrayEq(v1, v2)) : colors1 === colors2);

export enum PageOrientation {
  Landscape = "landscape",
  Portrait = "portrait",
}

export const ALL_ORIENTATIONS = Object.values(PageOrientation);

export interface ColorByNumberMakerState {
  phase: ColorByNumberMakerPhase;

  // SelectImage...
  dataUrl?: string;
  cropZone?: CropZone;

  // GenerateColors...
  boxesWide: number;
  boxesHigh: number;
  maxColors: number;
  backgroundColor: RgbVector;
  samplesPerBox: number;
  /**
   * A positive integer specifying how many times the k-means++ algorithm should run each time the application resolves
   * colors for a given image. The application will choose the best output from the N k-means++ outputs.
   */
  bestKMeansOfN: number;
  /**
   * Points that should be given special emphasis (or de-emphasis) when resolving colors for this color by number.
   * `undefined` indicates that the application can choose a reasonable default based on the size of the selected crop
   * zone.
   */
  pointsOfEmphasis?: readonly PointOfEmphasis[];
  /**
   * An exponent that tunes the color assignment portion of the algorithm. Higher values generate smoother images.
   * Values close to zero generate grainier images, and values below zero exaggerate that graininess even further.
   */
  colorAssignmentExponent: number;
  /**
   * The distinct colors for this color by number after colors have been resolved to conform to `maxColors`. This value
   * is **not** a pure function of other pieces of state b/c the algorithm used is non-deterministic. This value
   * memorializes the user's preferred color resolutions.
   */
  resolvedColors?: readonly RgbVector[];
  /**
   * The index within `resolvedColors` of the assigned color for each box of the color by number. Iterates through boxes
   * row by row. This value is not a pure function of other pieces of state b/c the algorithm used is non-deterministic.
   * This value memorializes the user's preferred color assignments.
   */
  colorAssignments?: readonly number[];

  // PrepareForPrint...
  title: string;
  /**
   * Metadata about each resolved color. Parallels the colors in `resolvedColors`, i.e. the metadata at array index 0 in
   * `colorMetadatas` describes the color at array index 0 in `resolvedColors`, the metadata at array index 1 in
   * `colorMetadatas` describes the color at array index 1 in `resolvedColors`, etc.
   */
  colorMetadatas?: readonly ColorMetadata[];

  // Print...
  orientation?: PageOrientation;
}

const initialState: ColorByNumberMakerState = {
  phase: ColorByNumberMakerPhase.SelectImage,
  boxesWide: 40,
  boxesHigh: 40,
  maxColors: 8,
  backgroundColor: [255, 255, 255],
  samplesPerBox: 20,
  bestKMeansOfN: 3,
  colorAssignmentExponent: 50,
  title: "",
};

type InvalidatedKey = Exclude<keyof ColorByNumberMakerState, "phase">;

// Object mapping from state keys to the other state keys that are invalidated by the given state key.
const INVALIDATED_BY: { [Key in InvalidatedKey]: InvalidatedKey[] } = {
  dataUrl: ["cropZone", "title"],
  cropZone: ["resolvedColors", "orientation", "pointsOfEmphasis"],
  boxesWide: ["resolvedColors"],
  boxesHigh: ["resolvedColors"],
  maxColors: ["resolvedColors"],
  backgroundColor: ["resolvedColors"],
  samplesPerBox: ["resolvedColors"],
  bestKMeansOfN: ["resolvedColors"],
  pointsOfEmphasis: ["resolvedColors"],
  colorAssignmentExponent: ["colorAssignments"],
  resolvedColors: ["colorAssignments"],
  colorAssignments: ["colorMetadatas"],
  title: [],
  colorMetadatas: [],
  orientation: [],
};

const invalidate = (state: ColorByNumberMakerState, key: InvalidatedKey) => {
  for (const invalidated of INVALIDATED_BY[key]) resetAndInvalidate(state, invalidated);
};

const resetAndInvalidate = (state: ColorByNumberMakerState, key: InvalidatedKey) => {
  (state as any)[key] = initialState[key];
  invalidate(state, key);
};

const slice = createSlice({
  name: "color-by-number-maker-slice",
  initialState,
  reducers: {
    setPhase(state, action: PayloadAction<ColorByNumberMakerPhase>) {
      state.phase = action.payload;
    },
    setDataUrl(state, action: PayloadAction<string>) {
      if (state.dataUrl !== action.payload) invalidate(state, "dataUrl");
      state.dataUrl = action.payload;
    },
    setCropZone(state, action: PayloadAction<CropZone>) {
      if (!areCropZonesEqual(state.cropZone, action.payload)) invalidate(state, "cropZone");
      state.cropZone = action.payload;
    },
    setBoxesWide(state, action: PayloadAction<number>) {
      if (state.boxesWide !== action.payload) invalidate(state, "boxesWide");
      state.boxesWide = action.payload;
    },
    setBoxesHigh(state, action: PayloadAction<number>) {
      if (state.boxesHigh !== action.payload) invalidate(state, "boxesHigh");
      state.boxesHigh = action.payload;
    },
    setMaxColors(state, action: PayloadAction<number>) {
      if (state.maxColors !== action.payload) invalidate(state, "maxColors");
      state.maxColors = action.payload;
    },
    setBackgroundColor(state, action: PayloadAction<RgbVector>) {
      if (!arrayEq(state.backgroundColor, action.payload)) invalidate(state, "backgroundColor");
      state.backgroundColor = action.payload as Draft<RgbVector>;
    },
    setSamplesPerBox(state, action: PayloadAction<number>) {
      if (state.samplesPerBox !== action.payload) invalidate(state, "samplesPerBox");
      state.samplesPerBox = action.payload;
    },
    setBestKMeansOfN(state, action: PayloadAction<number>) {
      if (state.bestKMeansOfN !== action.payload) invalidate(state, "bestKMeansOfN");
      state.samplesPerBox = action.payload;
    },
    setPointsOfEmphasis(state, action: PayloadAction<readonly PointOfEmphasis[]>) {
      if (state.pointsOfEmphasis && !arrayEq(state.pointsOfEmphasis, action.payload, arePointsOfEmphasisEqual)) {
        invalidate(state, "pointsOfEmphasis");
      }
      state.pointsOfEmphasis = action.payload as Draft<readonly PointOfEmphasis[]>;
    },
    setColorAssignmentExponent(state, action: PayloadAction<number>) {
      if (state.colorAssignmentExponent !== action.payload) invalidate(state, "colorAssignmentExponent");
      state.colorAssignmentExponent = action.payload;
    },
    setResolvedColors(state, action: PayloadAction<readonly RgbVector[] | undefined>) {
      if (!areRgbVectorArraysEqual(state.resolvedColors, action.payload)) invalidate(state, "resolvedColors");
      state.resolvedColors = action.payload as Draft<readonly RgbVector[]> | undefined;
    },
    setColorAssignments(state, action: PayloadAction<readonly number[]>) {
      if (state.colorAssignments && !arrayEq(state.colorAssignments, action.payload)) {
        invalidate(state, "colorAssignments");
      }
      state.colorAssignments = action.payload as Draft<readonly number[]>;
    },
    setTitle(state, action: PayloadAction<string>) {
      if (state.title !== action.payload) invalidate(state, "title");
      state.title = action.payload;
    },
    setColorMetadatas(state, action: PayloadAction<readonly ColorMetadata[]>) {
      if (state.colorMetadatas && !arrayEq(state.colorMetadatas, action.payload, areColorMetadatasEqual)) {
        invalidate(state, "colorMetadatas");
      }
      state.colorMetadatas = action.payload as Draft<readonly ColorMetadata[]>;
    },
    setOrientation(state, action: PayloadAction<PageOrientation>) {
      if (state.orientation !== action.payload) invalidate(state, "orientation");
      state.orientation = action.payload;
    },
  },
});

export const reducer = slice.reducer;

const selector = (state: RootState) => state;

export const useColorByNumberMakerState = () => {
  const state = useAppSelector(selector);
  return { state, ...slice.actions };
};
