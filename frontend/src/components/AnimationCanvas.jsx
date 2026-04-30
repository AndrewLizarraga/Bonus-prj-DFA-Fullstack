import { useEffect, useRef, useState } from "react";
import { createAutomatonRenderer } from "../utils/automatonRenderer";

function AnimationCanvas({ automaton, result, activeStepIndex }) {
  const canvasRef = useRef(null);
  const [highlightPhase, setHighlightPhase] = useState("transition");

  useEffect(() => {
    setHighlightPhase("transition");

    const timer = setTimeout(() => {
      setHighlightPhase("state");
    }, 350);

    return () => clearTimeout(timer);
  }, [activeStepIndex]);

  useEffect(() => {
    if (!canvasRef.current || !automaton) return;

    const renderer = createAutomatonRenderer(canvasRef.current);
    const step = result?.steps?.[activeStepIndex];

    const isFinalStep =
      result && activeStepIndex === result.steps.length - 1;

    const highlight = step
  ? {
      activeState:
        highlightPhase === "state" ? step.state : null,

      activeTransition:
        highlightPhase === "transition" && step.from_state && step.to_state
          ? {
              from: step.from_state,
              to: step.to_state,
            }
          : null,

      acceptedState:
        isFinalStep && result.is_accepted
          ? result.accepted_state || step.state
          : null,

      rejectedState:
        isFinalStep && !result.is_accepted
          ? result.rejected_state || step.state
          : null,
    }
  : {};

    renderer.render(automaton, highlight);
  }, [automaton, result, activeStepIndex, highlightPhase]);

  return (
    <section className="animation-canvas-section">
      <div className="animation-canvas-card">
        <canvas
          ref={canvasRef}
          width="700"
          height="400"
          className="animation-canvas"
        />
      </div>
    </section>
  );
}

export default AnimationCanvas;