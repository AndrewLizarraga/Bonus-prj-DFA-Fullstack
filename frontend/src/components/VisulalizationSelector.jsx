import { useState } from "react";

function VisualizationSelector({ selectedType, onTypeChange }) {
  const [selectedAutomaton, setSelectedAutomaton] = useState("");
  const [ stepSpeed, setStepSpeed] = useState(1);

  const hasSelectedType = selectedType === "dfa" || selectedType === "pda";
  const hasSelectedAutomaton = selectedAutomaton !== "";

  const selectedLabel =
    selectedType === "dfa" ? "DFA" : selectedType === "pda" ? "PDA" : "";

  return (
    <div className="container py-4">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <label htmlFor="visualizationType" className="form-label fw-semibold">
            Choose Visualization
          </label>

          <select
            id="visualizationType"
            className="form-select mb-3"
            value={selectedType}
            onChange={(event) => {
              onTypeChange(event.target.value);
              setSelectedAutomaton("");
            }}
          >
            <option value="">Select an option</option>
            <option value="dfa">DFA Visualizer</option>
            <option value="pda">PDA Visualizer</option>
            <option value="other">Other Thing</option>
          </select>

          {hasSelectedType && (
            <>
              <label htmlFor="automatonSelect" className="form-label fw-semibold">
                Select {selectedLabel}
              </label>

              <select
                id="automatonSelect"
                className="form-select mb-3"
                value={selectedAutomaton}
                onChange={(event) => setSelectedAutomaton(event.target.value)}
              >
                <option value="">Select a {selectedLabel}</option>
                <option value="example1">Example 1</option>
                <option value="example2">Example 2</option>
              </select>
            </>
          )}

          {hasSelectedAutomaton && (
            <>
              <label htmlFor="inputString" className="form-label fw-semibold">
                Enter input string
              </label>

              <input
                id="inputString"
                type="text"
                className="form-control"
                placeholder="Example: 0101"
              />

              <label htmlFor="speedRange" className="form-label fw-semibold">
                Step Speed: {stepSpeed}x
              </label>

              <input
                type="range"
                className="form-range"
                min="0"
                max="5"
                step="0.25"
                id="speedRange"
                value={stepSpeed}
                onChange={(event) => setStepSpeed(event.target.value)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualizationSelector;