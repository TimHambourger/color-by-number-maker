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
  x: number;
  y: number;
  width: number;
  height: number;
}

const areCropZonesEqual = (zone1: CropZone | undefined, zone2: CropZone | undefined) =>
  zone1 && zone2
    ? zone1.x === zone2.x && zone1.y === zone2.y && zone1.width === zone2.width && zone1.height === zone2.height
    : zone1 === zone2;

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

export interface SelectImageState {
  dataUrl?: string;
  cropZone?: CropZone;
}

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
  /**
   * The raw averaged color of each box in the color by number before colors have been resolved to conform to
   * `maxColors`. This is a pure function of `dataUrl`, `cropZone`, `boxesWide`, `boxesHigh`, and `backgroundColor`. We
   * store it as its own piece of state in Redux purely as a performance optimization: Depending on `cropZone.width` and
   * `cropZone.height`, this value can take several seconds to compute, so we cache it in Redux to speed up downstream
   * computations.
   */
  averagedColors?: readonly RgbVector[];
  /**
   * The distinct colors for this color by number after colors have been resolved to conform to `maxColors`. This value
   * is **not** a pure function of other pieces of state b/c the KMeans++ algorithm is non-deterministic. This value
   * memorializes the user's preferred color resolutions.
   */
  resolvedColors?: readonly RgbVector[];

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
  title: "",
};

type InvalidatedKey = Exclude<keyof ColorByNumberMakerState, "phase">;

// Object mapping from state keys to the other state keys that are invalidated by the given state key.
const INVALIDATED_BY: { [Key in InvalidatedKey]: InvalidatedKey[] } = {
  dataUrl: ["cropZone", "title"],
  cropZone: ["averagedColors", "orientation"],
  boxesWide: ["averagedColors"],
  boxesHigh: ["averagedColors"],
  // NOT averagedColors for maxColors. That only affects color resolution, not color averaging.
  maxColors: ["resolvedColors"],
  backgroundColor: ["averagedColors"],
  averagedColors: ["resolvedColors"],
  resolvedColors: ["colorMetadatas"],
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
      state.backgroundColor = action.payload;
    },
    setAveragedColors(state, action: PayloadAction<readonly RgbVector[]>) {
      if (!areRgbVectorArraysEqual(state.averagedColors, action.payload)) invalidate(state, "averagedColors");
      state.averagedColors = action.payload as Draft<readonly RgbVector[]>;
    },
    setResolvedColors(state, action: PayloadAction<readonly RgbVector[] | undefined>) {
      if (!areRgbVectorArraysEqual(state.resolvedColors, action.payload)) invalidate(state, "resolvedColors");
      state.resolvedColors = action.payload as Draft<readonly RgbVector[]> | undefined;
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
