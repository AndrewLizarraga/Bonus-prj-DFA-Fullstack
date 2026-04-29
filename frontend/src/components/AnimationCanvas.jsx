import { useEffect, useRef } from "react";
import { createAutomatonRenderer } from "../utils/automatonRenderer";

function AnimationCanvas({ automaton, result, activeStepIndex }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !automaton) return;

    const renderer = createAutomatonRenderer(canvasRef.current);
    const step = result?.steps?.[activeStepIndex];

    const highlight = step
      ? {
          activeState: step.state,
          activeTransition:
            step.from_state && step.to_state
              ? {
                  from: step.from_state,
                  to: step.to_state,
                }
              : null,
        }
      : {};

    renderer.render(automaton, highlight);
  }, [automaton, result, activeStepIndex]);

  return (
    <section className="container">
      <div className="border rounded shadow-sm p-3">
        <canvas
          ref={canvasRef}
          width="700"
          height="400"
          className="w-100"
        />
      </div>
    </section>
  );
}

export default AnimationCanvas;