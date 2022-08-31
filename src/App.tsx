import { GRAY_DARK } from "app/colorPalette";
import { rule } from "app/nano";
import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";
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

const App: React.FC = () => {
  const {
    state: { phase },
  } = useColorByNumberMakerState();
  return (
    <div className={CX_APP_BODY}>
      <PhaseIndicator />
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
