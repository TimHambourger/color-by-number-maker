import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";

const PrepareForPrint: React.FC = () => {
  const { state } = useColorByNumberMakerState();
  return state.phase === ColorByNumberMakerPhase.PrepareForPrint ? <div>Coming soon...</div> : null;
};
export default PrepareForPrint;
