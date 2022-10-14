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

import { GRAY_DARK } from "app/colorPalette";
import { rule } from "app/nano";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import BuildDetails from "view/BuildDetails";
import GenerateColors from "view/GenerateColors";
import PhaseIndicator from "view/PhaseIndicator";
import PrepareForPrint from "view/PrepareForPrint";
import Print from "view/Print";
import SelectImage from "view/SelectImage";

const CX_APP_BODY = rule({
  color: GRAY_DARK,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  "-webkit-font-smoothing": "antialiased",
  "-moz-osx-font-smoothing": "grayscale",
});

const CX_PHASE_INDICATOR_AND_BUILD_DETAILS = rule({
  position: "relative",

  "@media print": {
    "&": {
      display: "none",
    },
  },
});

const CX_BUILD_DETAILS = rule({
  position: "absolute",
  right: "12px",
  top: "8px",
});

const App: React.FC = () => {
  const {
    state: { phase },
  } = useColorByNumberMakerState();
  return (
    <div className={CX_APP_BODY}>
      <div className={CX_PHASE_INDICATOR_AND_BUILD_DETAILS}>
        <PhaseIndicator />
        <BuildDetails className={CX_BUILD_DETAILS} />
      </div>
      {phase === ColorByNumberMakerPhase.SelectImage ? (
        <SelectImage />
      ) : phase === ColorByNumberMakerPhase.GenerateColors ? (
        <GenerateColors />
      ) : phase === ColorByNumberMakerPhase.PrepareForPrint ? (
        <PrepareForPrint />
      ) : phase === ColorByNumberMakerPhase.Print ? (
        <Print />
      ) : null}
    </div>
  );
};
export default App;
