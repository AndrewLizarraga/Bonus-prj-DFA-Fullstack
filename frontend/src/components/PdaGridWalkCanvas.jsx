import { useMemo, useState } from "react";

function PdaGridWalkCanvas({ result, activeStepIndex }) {
  const [showMosaic, setShowMosaic] = useState(false);

  const randomSeed = useMemo(() => {
    return Math.random();
  }, [result]);

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

  const stateColors = {
    q0: "grid-state-q0",
    q1: "grid-state-q1",
    q2: "grid-state-q2",
    q3: "grid-state-q3",
  };

  function formatStackAction(action) {
    if (!action) return "";

    const popMatch = action.match(/pop '([^']+)'/);
    const stackTop = popMatch ? popMatch[1] : null;

    const pushMatch = action.match(/push \[(.*)\]/);
    const pushText = pushMatch ? pushMatch[1] : "";

    const pushedSymbols = [...pushText.matchAll(/'([^']+)'/g)].map(
      (match) => match[1]
    );

    if (pushedSymbols.length === 0 && stackTop) {
      return `pop ${stackTop}`;
    }

    if (stackTop && pushedSymbols[0] === stackTop) {
      const addedSymbols = pushedSymbols.slice(1);

      if (addedSymbols.length === 0) {
        return "no stack change";
      }

      return `push ${addedSymbols.join(" ")}`;
    }

    return action;
  }

  function getMovementInfo(step, movementConfig = {}) {
    let horizontal = "stay";
    let vertical = "stay";
    const reasons = [];
    const symbols = [];

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

  function buildAnimationFrames(steps, movementConfig) {
    const frames = [];

    steps.forEach((step) => {
      const movementInfo = getMovementInfo(step, movementConfig);

      if (movementInfo.vertical !== "stay") {
        frames.push({
          step,
          movementInfo,
          phase: "vertical",
        });
      }

      if (movementInfo.horizontal !== "stay") {
        frames.push({
          step,
          movementInfo,
          phase: "horizontal",
        });
      }

      if (
        movementInfo.vertical === "stay" &&
        movementInfo.horizontal === "stay"
      ) {
        frames.push({
          step,
          movementInfo,
          phase: "stay",
        });
      }
    });

    return frames;
  }

  function getGridBounds(frames) {
    let row = 0;
    let col = 0;

    let minRow = row;
    let maxRow = row;
    let minCol = col;
    let maxCol = col;

    frames.forEach((frame) => {
      const { movementInfo, phase } = frame;

      if (phase === "vertical") {
        if (movementInfo.vertical === "up") row -= 1;
        if (movementInfo.vertical === "down") row += 1;
      }

      if (phase === "horizontal") {
        if (movementInfo.horizontal === "right") col += 1;
        if (movementInfo.horizontal === "left") col -= 1;
      }

      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    });

    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      rows: maxRow - minRow + 1,
      cols: maxCol - minCol + 1,
    };
  }

  function getStartPosition(bounds, padding, seed) {
    const rowSeed = seed;
    const colSeed = (seed * 9973) % 1;

    const randomRowOffset = Math.floor(rowSeed * padding);
    const randomColOffset = Math.floor(colSeed * padding);

    return {
      row: padding + randomRowOffset - bounds.minRow,
      col: padding + randomColOffset - bounds.minCol,
    };
  }

  function buildGrid(frameLimitStep = activeStepIndex) {
    const movementConfig = result?.grid_movement || {};
    const allFrames = result?.steps
      ? buildAnimationFrames(result.steps, movementConfig)
      : [];

    const bounds = getGridBounds(allFrames);
    const padding = 1;

    const inputLength = result.input_string?.length || 1;
    const desiredSideLength = Math.ceil(inputLength / 2);

    const minimumRowsNeeded = bounds.rows + padding * 2;
    const minimumColsNeeded = bounds.cols + padding * 2;

    const gridRows = Math.max(desiredSideLength, minimumRowsNeeded);
    const gridCols = Math.max(desiredSideLength, minimumColsNeeded);

    const grid = Array.from({ length: gridRows }, (_, row) =>
      Array.from({ length: gridCols }, (_, col) => ({
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
        movementPhase: null,
      }))
    );

    const startPosition = getStartPosition(bounds, padding, randomSeed);

    let row = startPosition.row;
    let col = startPosition.col;

    const visibleFrames = allFrames.filter(
      (frame) => frame.step.step <= frameLimitStep
    );

    visibleFrames.forEach((frame) => {
      const { step, movementInfo, phase } = frame;

      if (phase === "vertical") {
        if (movementInfo.vertical === "up") row -= 1;
        if (movementInfo.vertical === "down") row += 1;
      }

      if (phase === "horizontal") {
        if (movementInfo.horizontal === "right") col += 1;
        if (movementInfo.horizontal === "left") col -= 1;
      }

      if (!grid[row] || !grid[row][col]) return;

      grid[row][col] = {
        row,
        col,
        filled: true,
        state: step.state,
        stepNumber: step.step,
        readSymbol: step.read_symbol,
        movementHorizontal: movementInfo.horizontal,
        movementVertical: movementInfo.vertical,
        movementSymbol:
          phase === "vertical"
            ? movementInfo.vertical === "up"
              ? "↑"
              : "↓"
            : phase === "horizontal"
              ? movementInfo.horizontal === "right"
                ? "→"
                : "←"
              : movementInfo.symbol,
        movementReason: `${movementInfo.reason} (${phase})`,
        movementLabel: `${movementInfo.label} - ${phase}`,
        movementPhase: phase,
      };
    });

    return {
      grid,
      gridRows,
      gridCols,
    };
  }

  function buildGridMosaic(tileGrid, tilesDown = 3, tilesAcross = 4) {
    const tileRows = tileGrid.length;
    const tileCols = tileGrid[0].length;

    const mosaicRows = tileRows * tilesDown;
    const mosaicCols = tileCols * tilesAcross;

    const mosaicGrid = Array.from({ length: mosaicRows }, (_, row) =>
      Array.from({ length: mosaicCols }, (_, col) => {
        const sourceRow = row % tileRows;
        const sourceCol = col % tileCols;
        const sourceCell = tileGrid[sourceRow][sourceCol];

        return {
          ...sourceCell,
          row,
          col,
        };
      })
    );

    return {
      grid: mosaicGrid,
      gridRows: mosaicRows,
      gridCols: mosaicCols,
    };
  }

  const movementConfig = result?.grid_movement || {};
  const allFrames = result?.steps
    ? buildAnimationFrames(result.steps, movementConfig)
    : [];

  const finalStepIndex = result.steps.length - 1;

  const currentGridData = buildGrid(activeStepIndex);
  const finalGridData = buildGrid(finalStepIndex);
  const mosaicGridData = buildGridMosaic(finalGridData.grid, 3, 4);

  const { grid, gridRows, gridCols } = showMosaic
    ? mosaicGridData
    : currentGridData;

  const currentStep = result.steps[activeStepIndex];

  return (
    <div className="card p-3 pda-grid-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">PDA Grid Walk</h5>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowMosaic((current) => !current)}
          >
            {showMosaic ? "Show Walk" : "Make Mosaic"}
          </button>

          <span className="badge text-bg-success">Accepted</span>
        </div>
      </div>

      <div
        className={showMosaic ? "pda-grid pda-grid-mosaic" : "pda-grid"}
        style={{
          gridTemplateColumns: showMosaic
            ? `repeat(${gridCols}, 1fr)`
            : `repeat(${gridCols}, clamp(34px, 4vw, 58px))`,
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
              {cell.filled && !showMosaic && (
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
          <div>
            <strong>Step:</strong> {currentStep.step}
          </div>
          <div>
            <strong>State:</strong> {currentStep.state}
          </div>
          <div>
            <strong>Read:</strong> {currentStep.read_symbol || "ε"}
          </div>
          <div>
            <strong>Remaining:</strong> {currentStep.remaining || "ε"}
          </div>
          <div>
            <strong>Stack Action:</strong>{" "}
            {formatStackAction(currentStep.stack_action)}
          </div>
        </div>
      )}

      <div className="grid-legend mt-3">
        <div>
          <span className="legend-box grid-state-q0"></span> q0
        </div>
        <div>
          <span className="legend-box grid-state-q1"></span> q1
        </div>
        <div>
          <span className="legend-box grid-state-q2"></span> q2
        </div>
        <div>
          <strong>↑</strong> push
        </div>
        <div>
          <strong>↓</strong> pop
        </div>
        <div>
          <strong>→</strong> move right
        </div>
        <div>
          <strong>ε</strong> epsilon
        </div>
      </div>
    </div>
  );
}

export default PdaGridWalkCanvas;