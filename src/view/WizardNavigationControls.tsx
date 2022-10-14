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

import { useAppDispatch } from "app/hooks";
import { rule } from "app/nano";
import { ALL_PHASES, useColorByNumberMakerState } from "app/slice";
import { useMemo } from "react";
import LinkButton from "./LinkButton";
import PrimaryButton from "./PrimaryButton";

const CX_NAVIGATION_CONTROLS = rule({
  display: "flex",
  justifyContent: "space-between",
  marginTop: "6px",

  "@media print": {
    "&": {
      display: "none",
    },
  },
});

export interface WizardNavigationControlsProps {
  forwardIsDisabled: boolean;
  forwardText?: string;
  onForwardClick?: () => void;
}

const WizardNavigationControls: React.FC<WizardNavigationControlsProps> = ({
  forwardIsDisabled,
  forwardText,
  onForwardClick,
}) => {
  const dispatch = useAppDispatch();
  const {
    state: { phase },
    setPhase,
  } = useColorByNumberMakerState();
  const prevPhase = useMemo(
    () =>
      ALL_PHASES.slice()
        .reverse()
        .find((otherPhase) => otherPhase < phase),
    [phase],
  );
  const nextPhase = useMemo(() => ALL_PHASES.find((otherPhase) => otherPhase > phase), [phase]);
  return (
    <div className={CX_NAVIGATION_CONTROLS}>
      {prevPhase === undefined ? (
        <span />
      ) : (
        <LinkButton onClick={() => dispatch(setPhase(prevPhase))}>&lt; Back</LinkButton>
      )}
      {nextPhase === undefined && !onForwardClick ? (
        <span />
      ) : (
        <PrimaryButton
          disabled={forwardIsDisabled}
          onClick={onForwardClick || (nextPhase === undefined ? undefined : () => dispatch(setPhase(nextPhase)))}
        >
          {forwardText || "Continue"}
        </PrimaryButton>
      )}
    </div>
  );
};
export default WizardNavigationControls;
