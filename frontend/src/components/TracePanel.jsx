// src/components/TracePanel.jsx

function TracePanel({ result, activeStepIndex }) {
  if (!result) {
    return (
      <div className="card p-3">
        <h5>Trace Panel</h5>
        <p className="text-muted mb-0">Run an automaton to see the trace.</p>
      </div>
    );
  }

  const visibleSteps = result.steps.slice(0, activeStepIndex + 1);

  return (
    <div className="card p-3">
      <h5>Trace Panel</h5>

      <div className="mb-2">
        <strong>Status:</strong>{" "}
        <span className={result.is_accepted ? "text-success" : "text-danger"}>
          {result.is_accepted ? "Accepted" : "Rejected"}
        </span>
      </div>

      <div className="trace-list">
        {visibleSteps.map((step) => (
          <div key={step.step} className="border rounded p-2 mb-2">
            <strong>Step {step.step}</strong>

            <div>State: {step.state}</div>
            <div>Remaining Input: {step.remaining || "ε"}</div>

            {step.from_state && step.to_state && (
              <div>
                Move: {step.from_state} → {step.to_state}
              </div>
            )}

            {step.read_symbol !== undefined && step.read_symbol !== null && (
              <div>Read: {step.read_symbol || "ε"}</div>
            )}

            {step.stack && <div>Stack: [{step.stack.join(", ")}]</div>}

            {step.stack_action && <div>Stack Action: {step.stack_action}</div>}
          </div>
        ))}
      </div>

      {activeStepIndex === result.steps.length - 1 && result.rejection_reason && (
        <div className="alert alert-danger py-2 mt-3">
          {result.rejection_reason}
        </div>
      )}
    </div>
  );
}

export default TracePanel;