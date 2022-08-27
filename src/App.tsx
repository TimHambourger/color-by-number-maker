import GenerateColors from "view/GenerateColors";
import PrepareForPrint from "view/PrepareForPrint";
import Print from "view/Print";
import SelectImage from "view/SelectImage";

const App: React.FC = () => (
  <div>
    {/* TODO: Phase indicator */}
    <SelectImage />
    <GenerateColors />
    <PrepareForPrint />
    <Print />
  </div>
);
export default App;
