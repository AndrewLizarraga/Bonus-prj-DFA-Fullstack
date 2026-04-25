import { useState } from 'react';
import VisulazationSelector from './components/VisulalizationSelector';
import AnimationCanvas from "./components/AnimationCanvas";

function App() {
  const [selctedType, setSelectedType] = useState("");

  return (
    <>
      <main>
        <VisulazationSelector
          selectedType={selctedType}
          onTypeChange={setSelectedType}
        />
        {selctedType === 'dfa' && <div>DFA Visualizer</div>  }
        {selctedType === 'pda' && <div>PDA Visualizer</div>  }
        {selctedType === 'other' && <div>Other Thing</div>  }
      </main>
      <AnimationCanvas />
    </>
  );
  }

  export default App;
