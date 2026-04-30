// src/components/TracePanel.jsx

function TracePanel({ result, activeStepIndex }) {
  if (!result) {
    return (
      <div className="card p-3 trace-panel-card">
        <h5 className="trace-panel-title">Trace Panel</h5>
        <p className="trace-empty-text">Run an automaton to see the trace.</p>
      </div>
    );
  }

  const visibleSteps = result.steps.slice(0, activeStepIndex + 1);

  return (
    <div className="card p-3 trace-panel-card">
      <div className="trace-panel-header">
        <h5 className="trace-panel-title">Trace Panel</h5>

        <span
          className={
            result.is_accepted
              ? "trace-status trace-status-accepted"
              : "trace-status trace-status-rejected"
          }
        >
          {result.is_accepted ? "Accepted" : "Rejected"}
        </span>
      </div>

      <div className="trace-list">
        {visibleSteps.map((step) => (
          <div key={step.step} className="trace-step-card">
            <div className="trace-step-header">
              <span className="trace-step-badge">Step {step.step}</span>
              <span className="trace-state-pill">{step.state}</span>
            </div>

            <div className="trace-row">
              <span className="trace-label">Remaining</span>
              <span className="trace-value">{step.remaining || "ε"}</span>
            </div>

            {step.from_state && step.to_state && (
              <div className="trace-row">
                <span className="trace-label">Move</span>
                <span className="trace-value">
                  {step.from_state} → {step.to_state}
                </span>
              </div>
            )}

            {step.read_symbol !== undefined && step.read_symbol !== null && (
              <div className="trace-row">
                <span className="trace-label">Read</span>
                <span className="trace-value">{step.read_symbol || "ε"}</span>
              </div>
            )}

            {step.stack && (
              <div className="trace-row">
                <span className="trace-label">Stack</span>
                <span className="trace-value">[{step.stack.join(", ")}]</span>
              </div>
            )}

            {step.stack_action && (
              <div className="trace-stack-action">
                {step.stack_action}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeStepIndex === result.steps.length - 1 && result.rejection_reason && (
        <div className="trace-rejection-box">
          {result.rejection_reason}
        </div>
      )}
    </div>
  );
}

export default TracePanel;