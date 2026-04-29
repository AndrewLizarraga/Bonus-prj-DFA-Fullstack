function PdaGridWalkCanvas({ result, activeStepIndex }) {
  if (!result) {
    return (
      <div className="card p-3">
        <h5>PDA Grid Walk</h5>
        <p className="text-muted mb-0">
          Run a PDA to see the grid walk.
        </p>
      </div>
    );
  }

  if (!result.is_accepted) {
    return (
      <div className="card p-3">
        <h5>PDA Grid Walk</h5>
        <div className="alert alert-warning mb-0">
          Grid Walk only renders accepted PDA traces. Try a valid input like{" "}
          <strong>0011</strong> or <strong>000111</strong>.
        </div>
      </div>
    );
  }

  const inputLength = result.input_string?.length || 0;
  const gridSize = Math.max(6, inputLength + 2);

  const visibleSteps = result.steps.slice(0, activeStepIndex + 1);

  const stateColors = {
    q0: "grid-state-q0",
    q1: "grid-state-q1",
    q2: "grid-state-q2",
    q3: "grid-state-q3",
  };

  function getMovementInfo(step, movementConfig = {}) {
    let horizontal = "stay";
    let vertical = "stay";
    let reasons = [];
    let symbols = [];

    // Horizontal movement: input/state logic
    if (step.stack_action === "initialize") {
      reasons.push("initialize");
      symbols.push("•");
    } else if (step.read_symbol === "") {
      horizontal = movementConfig.epsilonHorizontal || "stay";
      reasons.push("epsilon");
      symbols.push("ε");
    } else if (step.from_state !== step.to_state) {
      horizontal = movementConfig.stateChangeHorizontal || "left";
      reasons.push("state change");
      symbols.push(horizontal === "left" ? "←" : "→");
    } else if (step.read_symbol) {
      horizontal = movementConfig.readHorizontal || "right";
      reasons.push("read input");
      symbols.push("→");
    }

    // Vertical movement: stack logic
    if (step.stack_action?.includes("push []")) {
      vertical = movementConfig.popVertical || "down";
      reasons.push("pop stack");
      symbols.push("↓");
    } else if (step.stack_action?.includes("push")) {
      vertical = movementConfig.pushVertical || "up";
      reasons.push("push stack");
      symbols.push("↑");
    }

    return {
      horizontal,
      vertical,
      reason: reasons.join(" + "),
      symbol: symbols.join(" "),
      label: reasons.join(" + "),
    };
  }


  function wrapPosition(value) {
    if (value < 0) return gridSize - 1;
    if (value >= gridSize) return 0;
    return value;
  }

  function buildGrid() {
    const grid = Array.from({ length: gridSize }, (_, row) =>
      Array.from({ length: gridSize }, (_, col) => ({
        row,
        col,
        filled: false,
        state: null,
        stepNumber: null,
        readSymbol: null,
        movementHorizontal: null,
        movementVertical: null,
        movementSymbol: null,
        movementReason: null,
        movementLabel: null,
      }))
    );

    let row = Math.floor(gridSize / 2);
    let col = 0;
    const movementConfig = result.grid_movement || {};

    visibleSteps.forEach((step) => {
      const movementInfo = getMovementInfo(step, movementConfig);

      // 1. Move vertically first and mark the intermediate cell
      if (movementInfo.vertical === "up") {
        row = wrapPosition(row - 1);

        grid[row][col] = {
          row,
          col,
          filled: true,
          state: step.state,
          stepNumber: step.step,
          readSymbol: step.read_symbol,
          movementHorizontal: "stay",
          movementVertical: movementInfo.vertical,
          movementSymbol: "↑",
          movementReason: "vertical movement",
          movementLabel: "Vertical stack movement",
          isIntermediate: true,
        };
      } else if (movementInfo.vertical === "down") {
        row = wrapPosition(row + 1);

        grid[row][col] = {
          row,
          col,
          filled: true,
          state: step.state,
          stepNumber: step.step,
          readSymbol: step.read_symbol,
          movementHorizontal: "stay",
          movementVertical: movementInfo.vertical,
          movementSymbol: "↓",
          movementReason: "vertical movement",
          movementLabel: "Vertical stack movement",
          isIntermediate: true,
        };
      }

      // 2. Then move horizontally and mark the final cell
      if (movementInfo.horizontal === "right") {
        col = wrapPosition(col + 1);
      } else if (movementInfo.horizontal === "left") {
        col = wrapPosition(col - 1);
      }

      grid[row][col] = {
        row,
        col,
        filled: true,
        state: step.state,
        stepNumber: step.step,
        readSymbol: step.read_symbol,
        movementHorizontal: movementInfo.horizontal,
        movementVertical: movementInfo.vertical,
        movementSymbol: movementInfo.symbol,
        movementReason: movementInfo.reason,
        movementLabel: movementInfo.label,
        isIntermediate: false,
      };
    });

    return grid;
  }

  const grid = buildGrid();
  const currentStep = visibleSteps[visibleSteps.length - 1];

    return (
      <div className="card p-3 pda-grid-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">PDA Grid Walk</h5>
            <p className="text-muted mb-0">
              Grid size: {gridSize} × {gridSize}
            </p>
          </div>

          <span className="badge text-bg-success">
            Accepted
          </span>
        </div>

        <div
          className="pda-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.flat().map((cell) => {
            const isCurrentCell =
              cell.filled && cell.stepNumber === currentStep?.step;

            const stateClass = cell.state
              ? stateColors[cell.state] || "grid-state-default"
              : "";

            return (
              <div
                key={`${cell.row}-${cell.col}`}
                className={[
                  "pda-grid-cell",
                  cell.filled ? "filled" : "unfilled",
                  stateClass,
                  isCurrentCell ? "current-cell" : "",
                ].join(" ")}
              >
                {cell.filled && (
                  <>
                    <div className="cell-step">#{cell.stepNumber}</div>
                    <div className="cell-state">{cell.state}</div>
                    <div className="cell-symbol">{cell.movementSymbol}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {currentStep && (
          <div className="current-step-card mt-3">
            <h6 className="mb-2">Current Step</h6>
            <div><strong>Step:</strong> {currentStep.step}</div>
            <div><strong>State:</strong> {currentStep.state}</div>
            <div><strong>Read:</strong> {currentStep.read_symbol || "ε"}</div>
            <div><strong>Remaining:</strong> {currentStep.remaining || "ε"}</div>
            <div><strong>Stack Action:</strong> {currentStep.stack_action}</div>
          </div>
        )}

        <div className="grid-legend mt-3">
          <div><span className="legend-box grid-state-q0"></span> q0</div>
          <div><span className="legend-box grid-state-q1"></span> q1</div>
          <div><span className="legend-box grid-state-q2"></span> q2</div>
          <div><strong>↑</strong> push</div>
          <div><strong>↓</strong> pop</div>
          <div><strong>→</strong> move right</div>
          <div><strong>ε</strong> epsilon</div>
        </div>
      </div>
    );
  }

  export default PdaGridWalkCanvas;