import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
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

export interface ResolvedColors {
  /**
   * The distinct colors for this color by number.
   */
  colors: readonly RgbVector[];
  /**
   * Array with one element for each box in the resulting color by number; that element is an index in the
   * `resolvedColors` array. Order is row by row; i.e. (row 0, column 0), then (row 0, column 1), etc.
   */
  assignments: readonly number[];
}

const areResolvedColorsEqual = (colors1: ResolvedColors | undefined, colors2: ResolvedColors | undefined) =>
  colors1 && colors2
    ? arrayEq(colors1.colors, colors2.colors, (v1, v2) => arrayEq(v1, v2)) &&
      arrayEq(colors1.assignments, colors2.assignments)
    : colors1 === colors2;

const arrayEq = <T>(
  array1: readonly T[],
  array2: readonly T[],
  areItemsEqual: (item1: T, item2: T) => boolean = (item1, item2) => item1 === item2,
) => array1.length === array2.length && array1.every((item, idx) => areItemsEqual(item, array2[idx]));

export interface SelectImageState {
  dataUrl?: string;
  cropZone?: CropZone;
}

export interface GenerateColorsState {
  boxesWide: number;
  boxesHigh: number;
  maxColors: number;
  resolvedColors?: ResolvedColors;
}

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
  resolvedColors?: ResolvedColors;

  // TODO: PrepareForPrint...
}

const initialState: ColorByNumberMakerState = {
  phase: ColorByNumberMakerPhase.SelectImage,
  boxesWide: 40,
  boxesHigh: 40,
  maxColors: 8,
  backgroundColor: [255, 255, 255],
};

type InvalidatedKey = Exclude<keyof ColorByNumberMakerState, "phase">;

// Object mapping from state keys to the other state keys that are invalidated by the given state key.
const INVALIDATED_BY: { [Key in InvalidatedKey]: InvalidatedKey[] } = {
  dataUrl: ["cropZone"],
  cropZone: ["resolvedColors"],
  boxesWide: ["resolvedColors"],
  boxesHigh: ["resolvedColors"],
  maxColors: ["resolvedColors"],
  backgroundColor: ["resolvedColors"],
  resolvedColors: [],
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
    setResolvedColors(state, action: PayloadAction<ResolvedColors | undefined>) {
      if (!areResolvedColorsEqual(state.resolvedColors, action.payload)) invalidate(state, "resolvedColors");
      state.resolvedColors = action.payload as Draft<ResolvedColors> | undefined;
    },
  },
});

export const reducer = slice.reducer;

const selector = (state: RootState) => state;

export const useColorByNumberMakerState = () => {
  const state = useAppSelector(selector);
  return { state, ...slice.actions };
};
