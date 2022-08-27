import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RgbColor } from "../lib/color";
import { useAppSelector } from "./hooks";
import { RootState } from "./store";

export enum ColorByNumberMakerPhase {
  SelectImage = 0,
  GenerateColors = 1,
  PrepareForPrint = 2,
  Print = 3,
}

/**
 * Crop zone coordinates. All numbers are in pixels.
 */
export interface CropZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const areCropZonesEqual = (zone1: CropZone, zone2: CropZone) =>
  zone1.x === zone2.x && zone1.y === zone2.y && zone1.width === zone2.width && zone1.height === zone2.height;

export interface ResolvedColors {
  /**
   * The distinct colors for this color by number.
   */
  colors: RgbColor[];
  /**
   * Array with one element for each box in the resulting color by number; that element is an index in the
   * `resolvedColors` array. Order is row by row; i.e. (row 0, column 0), then (row 0, column 1), etc.
   */
  assignments: number[];
}

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

export interface PrepareForPrintState {
  // TODO...
}

interface PartialColorByNumberMakerState {
  selectImage: SelectImageState;
  generateColors: GenerateColorsState;
  prepareForPrint: PrepareForPrintState;
}

type StateForPhase<Phase extends ColorByNumberMakerPhase, PriorPhases extends keyof PartialColorByNumberMakerState> = {
  phase: Phase;
} & {
  [Key in keyof PartialColorByNumberMakerState]: Key extends PriorPhases
    ? Required<PartialColorByNumberMakerState[Key]>
    : PartialColorByNumberMakerState[Key];
};

export type ColorByNumberMakerState =
  | StateForPhase<ColorByNumberMakerPhase.SelectImage, never>
  | StateForPhase<ColorByNumberMakerPhase.GenerateColors, "selectImage">
  | StateForPhase<ColorByNumberMakerPhase.PrepareForPrint, "selectImage" | "generateColors">
  | StateForPhase<ColorByNumberMakerPhase.Print, "selectImage" | "generateColors" | "prepareForPrint">;

const initialState: { state: ColorByNumberMakerState } = {
  state: {
    phase: ColorByNumberMakerPhase.SelectImage,
    selectImage: {},
    generateColors: {
      boxesWide: 40,
      boxesHigh: 40,
      maxColors: 8,
    },
    prepareForPrint: {},
  },
};

const slice = createSlice({
  name: "color-by-number-maker-slice",
  initialState,
  reducers: {
    setDataUrl({ state }, action: PayloadAction<string>) {
      state.selectImage.dataUrl = action.payload;
    },
    setCropZone({ state }, action: PayloadAction<CropZone>) {
      state.selectImage.cropZone = action.payload;
    },
    setBoxesWide({ state }, action: PayloadAction<number>) {
      state.generateColors.boxesWide = action.payload;
    },
    setBoxesHigh({ state }, action: PayloadAction<number>) {
      state.generateColors.boxesHigh = action.payload;
    },
    setMaxColors({ state }, action: PayloadAction<number>) {
      state.generateColors.maxColors = action.payload;
    },
    setResolvedColors({ state }, action: PayloadAction<ResolvedColors>) {
      state.generateColors.resolvedColors = action.payload;
    },
    // TODO: reducers for changing phase...
  },
});

export const reducer = slice.reducer;

const selector = ({ state }: RootState) => state;

export const useColorByNumberMakerState = () => {
  const state = useAppSelector(selector);
  return { state, ...slice.actions };
};
