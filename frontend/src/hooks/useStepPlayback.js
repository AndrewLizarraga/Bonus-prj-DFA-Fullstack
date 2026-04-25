// src/hooks/useStepPlayback.js

import { useEffect, useState } from "react";

function useStepPlayback(result, stepSpeed) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!result?.steps?.length) {
      setActiveStepIndex(0);
      return;
    }

    setActiveStepIndex(0);

    const delay = 1000 / stepSpeed;

    const intervalId = setInterval(() => {
      setActiveStepIndex((prevIndex) => {
        if (prevIndex >= result.steps.length - 1) {
          clearInterval(intervalId);
          return prevIndex;
        }

        return prevIndex + 1;
      });
    }, delay);

    return () => clearInterval(intervalId);
  }, [result, stepSpeed]);

  return {
    activeStepIndex,
    setActiveStepIndex,
  };
}

export default useStepPlayback;