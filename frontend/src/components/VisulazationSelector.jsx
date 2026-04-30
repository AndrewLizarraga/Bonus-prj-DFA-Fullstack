function VisulazationSelector({
  selectedType,
  onTypeChange,
  automataOptions,
  selectedAutomaton,
  onAutomatonChange,
  stepSpeed,
  onStepSpeedChange,
}) {
  const hasSelectedType = selectedType === "dfa" || selectedType === "pda";
  const hasSelectedAutomaton = selectedAutomaton !== "";

  const selectedLabel =
    selectedType === "dfa" ? "DFA" : selectedType === "pda" ? "PDA" : "";

  console.log("selectedType:", selectedType);
  console.log("automataOptions:", automataOptions);

  return (
    <div className="container py-4 selector-container">
      <div className="card shadow-sm mx-auto selector-card">
        <div className="card-body selector-card-body">
          <label htmlFor="visualizationType" className="form-label selector-label">
            Choose Visualization
          </label>

          <select
            id="visualizationType"
            className="form-select selector-input mb-3"
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
              <label htmlFor="automatonSelect" className="form-label selector-label">
                Select {selectedLabel}
              </label>

              <select
                id="automatonSelect"
                className="form-select selector-input mb-3"
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
              <label htmlFor="speedRange" className="form-label selector-label">
                Step Speed: <span className="selector-speed-value">{stepSpeed}x</span>
              </label>

              <input
                type="range"
                className="form-range selector-range"
                min="0.1"
                max="2"
                step="0.1"
                id="speedRange"
                value={stepSpeed}
                onChange={(event) =>
                  onStepSpeedChange(Number(event.target.value))
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisulazationSelector;