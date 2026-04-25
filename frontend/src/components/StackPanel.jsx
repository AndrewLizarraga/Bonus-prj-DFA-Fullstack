function StackPanel({ result, activeStepIndex }) {
  const steps = result?.steps || [];
  const currentStep = steps[activeStepIndex];
  const stack = currentStep?.stack || [];

  return (
    <div className="card p-3 mt-3 h-100 stack-panel">
      <h5 className="text-center">Stack</h5>

      {!currentStep ? (
        <p className="text-muted text-center mb-0">
          Run a PDA to see the stack.
        </p>
      ) : (
        <>
          <p className="text-center mb-2">
            Step {currentStep.step}
          </p>

          <div className="stack-box">
            {[...stack].reverse().map((symbol, index) => (
              <div key={`${symbol}-${index}`} className="stack-item">
                {symbol}
              </div>
            ))}
          </div>

          {currentStep.stack_action && (
            <p className="text-muted text-center mt-3 mb-0">
              {currentStep.stack_action}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default StackPanel;