import { GRAY_MEDIUM } from "app/colorPalette";
import { rule } from "app/nano";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
import cx from "classnames";

const PHASE_DISPLAY_NAME: { [Phase in ColorByNumberMakerPhase]: string } = {
  [ColorByNumberMakerPhase.SelectImage]: "Select Image",
  [ColorByNumberMakerPhase.GenerateColors]: "Generate Colors",
  [ColorByNumberMakerPhase.PrepareForPrint]: "Prepare for Print",
  [ColorByNumberMakerPhase.Print]: "Print",
};

const PHASES = Object.values(ColorByNumberMakerPhase)
  .filter((val): val is number => typeof val === "number")
  .sort((phase1, phase2) => phase1 - phase2);

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
    {PHASES.map((phase, idx) => (
      <PhaseItem key={phase} phase={phase} isInitialPhase={idx === 0} />
    ))}
  </div>
);
export default PhaseIndicator;
