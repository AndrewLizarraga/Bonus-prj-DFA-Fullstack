

function VisulazationSelector({
  
  selectedType,
  onTypeChange,
  automataOptions,
  selectedAutomaton,
  onAutomatonChange,
  stepSpeed,
  onStepSpeedChange
}) {

  const hasSelectedType = selectedType === "dfa" || selectedType === "pda";
  const hasSelectedAutomaton = selectedAutomaton !== "";

  const selectedLabel =
    selectedType === "dfa" ? "DFA" : selectedType === "pda" ? "PDA" : "";

    console.log("selectedType:", selectedType);
    console.log("automataOptions:", automataOptions);
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
              onAutomatonChange("");
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
                onChange={(event) => onAutomatonChange(event.target.value)}
              >
                <option value="">Select a {selectedLabel}</option>

                {automataOptions.map((automaton) => (
                  <option key={automaton.id} value={automaton.id}>
                    {automaton.id} - {automaton.description}
                  </option>
                ))}
              </select>
            </>
          )}

          {hasSelectedAutomaton && (
            <>
              <label htmlFor="speedRange" className="form-label fw-semibold">
                Step Speed: {stepSpeed}x
              </label>

              <input
                type="range"
                className="form-range"
                min="0.25"
                max="5"
                step="0.25"
                id="speedRange"
                value={stepSpeed}
                onChange={(event) => onStepSpeedChange(Number(event.target.value))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisulazationSelector;