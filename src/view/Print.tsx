import { ColorByNumberMakerPhase, useColorByNumberMakerState } from "app/slice";

const Print: React.FC = () => {
  const { state } = useColorByNumberMakerState();
  return state.phase === ColorByNumberMakerPhase.Print ? <div>Coming soon...</div> : null;
};
export default Print;
