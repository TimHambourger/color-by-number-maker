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

import { GRAY_MEDIUM } from "app/colorPalette";
import { rule } from "app/nano";
import { ALL_PHASES, ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import cx from "classnames";

const PHASE_DISPLAY_NAME: { [Phase in ColorByNumberMakerPhase]: string } = {
  [ColorByNumberMakerPhase.SelectImage]: "Select Image",
  [ColorByNumberMakerPhase.GenerateColors]: "Generate Colors",
  [ColorByNumberMakerPhase.PrepareForPrint]: "Prepare for Print",
  [ColorByNumberMakerPhase.Print]: "Print",
};

const CX_PHASE_INDICATOR = rule({
  padding: "16px 0",
  textAlign: "center",
});

const CX_FUTURE_PHASE = "future-phase";

const CX_PHASE_ITEM = rule({
  fontWeight: "bold",
  [`&.${CX_FUTURE_PHASE}`]: {
    color: GRAY_MEDIUM,
  },
});

const CX_PHASE_SEPARATOR = rule({
  padding: "0 12px",
});

interface PhaseItemProps {
  phase: ColorByNumberMakerPhase;
  isInitialPhase?: boolean;
}

const PhaseItem: React.FC<PhaseItemProps> = ({ phase, isInitialPhase }) => {
  const {
    state: { phase: currentPhase },
  } = useColorByNumberMakerState();
  const isFuturePhase = currentPhase < phase;
  return (
    <span className={cx(CX_PHASE_ITEM, { [CX_FUTURE_PHASE]: isFuturePhase })}>
      {!isInitialPhase && <span className={CX_PHASE_SEPARATOR}>&gt;</span>} {PHASE_DISPLAY_NAME[phase]}
    </span>
  );
};

const PhaseIndicator: React.FC = () => (
  <div className={CX_PHASE_INDICATOR}>
    {ALL_PHASES.map((phase, idx) => (
      <PhaseItem key={phase} phase={phase} isInitialPhase={idx === 0} />
    ))}
  </div>
);
export default PhaseIndicator;
