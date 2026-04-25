import { useEffect, useState } from "react";
import VisulazationSelector from "./components/VisulazationSelector";
import AnimationCanvas from "./components/AnimationCanvas";
import TracePanel from "./components/TracePanel";
import StackPanel from "./components/StackPanel";
import { runAutomaton, getAutomataOptions } from "./services/automatonApi";
import useStepPlayback from "./hooks/useStepPlayback";

function App() {
  const [selctedType, setSelectedType] = useState("");
  const [selectedAutomaton, setSelectedAutomaton] = useState("");
  const [automataOptions, setAutomataOptions] = useState([]);
  const [inputString, setInputString] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stepSpeed, setStepSpeed] = useState(1);

  const { activeStepIndex } = useStepPlayback(result, stepSpeed);

  const hasSelectedType = selctedType === "dfa" || selctedType === "pda";
  useEffect(() => {
  async function fetchAutomataOptions() {
    try {
      const options = await getAutomataOptions(selctedType);

      console.log("Setting automata options:", options);

      setAutomataOptions(options);
      setSelectedAutomaton("");
    } catch (err) {
      console.error("Failed to fetch automata options:", err.message);
      setAutomataOptions([]);
    }
  }

  fetchAutomataOptions();
}, [selctedType]);

  async function handleRunAutomaton() {
    console.log("Run button clicked");

    if (!hasSelectedType) {
      console.warn("Not running API because selected type is:", selctedType);
      return;
    }

    if (!selectedAutomaton) {
      setError("Please select an automaton first.");
      return;
    }

    try {
      setError("");
      setResult(null);

      const data = await runAutomaton(
        selctedType,
        selectedAutomaton,
        inputString
      );

      console.log("API result:", data);
      setResult(data);
    } catch (err) {
      console.error("API error:", err.message);
      setError(err.message);
    }
  }

  return (
    <>
      <main>
        <VisulazationSelector
          selectedType={selctedType}
          onTypeChange={setSelectedType}
          automataOptions={automataOptions}
          selectedAutomaton={selectedAutomaton}
          onAutomatonChange={setSelectedAutomaton}
          stepSpeed={stepSpeed}
          onStepSpeedChange={setStepSpeed}
        />
        {selctedType === "dfa" && <div>DFA Visualizer</div>}
        {selctedType === "pda" && <div>PDA Visualizer</div>}
        {selctedType === "other" && <div>Other Thing</div>}

        {hasSelectedType && (
          <>
            <div className="d-flex gap-2 align-items-center mt-3 px-5">
              <input
                className="form-control form-control-sm"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter input string, example: 0011"
              />

              <button className="btn btn-primary btn-sm" onClick={handleRunAutomaton}>
                Run Automaton
              </button>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>

            <div className="container-fluid mt-4 px-5">
              <div className="row g-3">
                <div className={selctedType === "pda" ? "col-md-9" : "col-12"}>
                  <AnimationCanvas result={result} activeStepIndex={activeStepIndex} />

                  <div className="mt-3">
                    <TracePanel result={result} activeStepIndex={activeStepIndex} />
                  </div>
                </div>

                {selctedType === "pda" && (
                  <div className="col-md-3">
                    <StackPanel result={result} activeStepIndex={activeStepIndex} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;