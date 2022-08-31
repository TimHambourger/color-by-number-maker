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
