function formatStackAction(action) {
  if (!action) return "";

  const popMatch = action.match(/pop '([^']+)'/);
  const stackTop = popMatch ? popMatch[1] : null;

  const pushMatch = action.match(/push \[(.*)\]/);
  const pushText = pushMatch ? pushMatch[1] : "";

  const pushedSymbols = [...pushText.matchAll(/'([^']+)'/g)].map(
    (match) => match[1]
  );

  // Example: pop '0', push []
  // Means the visible action is pop 0
  if (pushedSymbols.length === 0 && stackTop) {
    return `pop ${stackTop}`;
  }

  // Example: pop '0', push ['0', '0']
  // Means the original 0 was put back, then another 0 was added
  // Visible action: push 0
  if (stackTop && pushedSymbols[0] === stackTop) {
    const addedSymbols = pushedSymbols.slice(1);

    if (addedSymbols.length === 0) {
      return "no stack change";
    }

    return `push ${addedSymbols.join(" ")}`;
  }

  // Fallback for weird transitions
  return action;
}


function StackPanel({ result, activeStepIndex }) {
  const steps = result?.steps || [];
  const currentStep = steps[activeStepIndex];
  const stack = currentStep?.stack || [];

  return (
    <div className="card p-3 mt-5 stack-panel">
      <h5 className="text-center">Stack</h5>

      {!currentStep ? (
        <p className="text-muted text-center mb-0">
          Run a PDA to see the stack.
        </p>
      ) : (
        <>
          <p className="stack-text-step text-center mb-2">
            Step {currentStep.step}
          </p>

          <p className="stack-text-read-symbol text-center mb-3">
            Read: {currentStep.read_symbol || "<no input>"}
          </p>


          <div className="stack-box">
            {[...stack].reverse().map((symbol, index) => (
              <div key={`${symbol}-${index}`} className="stack-item">
                {symbol}
              </div>
            ))}
          </div>

          {currentStep.stack_action && (
            <p className="stack-text-action text-center mt-3 mb-0">
              {formatStackAction(currentStep.stack_action)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default StackPanel;