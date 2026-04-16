export function createAnimationController(renderer, options = {}) {
    let stepDelay = Number.isFinite(options.stepDelay) ? options.stepDelay : 900;
    const transitionHold = Number.isFinite(options.transitionHold) ? options.transitionHold : 325;
    const onStepChange = typeof options.onStepChange === 'function' ? options.onStepChange : () => {};
    const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};

    let currentDfa = null;
    let currentSteps = [];
    let currentStepIndex = 0;
    let isPlaying = false;
    let playToken = 0;
    let runWasAccepted = null;
    let rejectedAtStep = null;
    let acceptedAtStep = null;

    function sleep(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function setStepDelay(ms) {
        const numericValue = Number(ms);

        if (!Number.isFinite(numericValue)) {
            return;
        }

        stepDelay = Math.max(100, Math.min(5000, numericValue));
    }

    function setDfa(dfa) {
        currentDfa = dfa || null;
        stop();
        currentSteps = [];
        currentStepIndex = 0;
        runWasAccepted = null;
        rejectedAtStep = null;
        acceptedAtStep = null;

        if (currentDfa) {
            renderer.render(currentDfa);
        }
    }

    function loadTrace(dfa, traceData) {
        currentDfa = dfa || null;
        currentSteps = Array.isArray(traceData?.steps) ? traceData.steps : [];
        currentStepIndex = 0;
        runWasAccepted = traceData?.is_accepted === true;
        acceptedAtStep = runWasAccepted && currentSteps.length > 0 ? currentSteps.length - 1 : null;

        if (traceData?.is_accepted === false) {
            if (Number.isInteger(traceData?.rejected_at_step)) {
                rejectedAtStep = Math.max(0, Math.min(traceData.rejected_at_step, currentSteps.length - 1));
            } else if (currentSteps.length > 0) {
                rejectedAtStep = currentSteps.length - 1;
            } else {
                rejectedAtStep = null;
            }
        } else {
            rejectedAtStep = null;
        }

        stop();

        if (!currentDfa) {
            return;
        }

        if (currentSteps.length === 0) {
            renderer.render(currentDfa);
            return;
        }

        renderCurrentStep();
    }

    function getCurrentStep() {
        return currentSteps[currentStepIndex] || null;
    }

    function buildHighlightForStep(step) {
        if (!step) {
            return {};
        }

        const highlight = {
            activeState: step.state || null,
        };

        if (step.from_state && step.to_state) {
            highlight.activeTransition = {
                from: step.from_state,
                to: step.to_state,
            };
        }

        return highlight;
    }

    function isTerminalStep(index) {
        return index === rejectedAtStep || index === acceptedAtStep;
    }

    function buildTerminalHighlight(index) {
        const step = currentSteps[index] || null;
        const state = step?.state || null;

        if (!state) {
            return {};
        }

        if (index === rejectedAtStep) {
            return { rejectedState: state };
        }

        if (index === acceptedAtStep) {
            return { acceptedState: state };
        }

        return {};
    }

    function renderCurrentTransition() {
        if (!currentDfa) {
            return;
        }

        const step = getCurrentStep();
        if (!step) {
            return;
        }

        if (!step.from_state || !step.to_state) {
            renderCurrentStep();
            return;
        }

        const highlight = {
            activeTransition: {
                from: step.from_state,
                to: step.to_state,
            },
        };

        renderer.render(currentDfa, highlight);
        onStepChange(step, currentStepIndex, currentSteps);
    }

    function renderCurrentStep() {
        if (!currentDfa) {
            return;
        }

        const step = getCurrentStep();
        const terminalHighlight = buildTerminalHighlight(currentStepIndex);
        const highlight = Object.keys(terminalHighlight).length > 0
            ? terminalHighlight
            : buildHighlightForStep(step);
        renderer.render(currentDfa, highlight);
        onStepChange(step, currentStepIndex, currentSteps);
    }

    function goToStep(index) {
        if (!currentDfa) {
            return;
        }

        if (currentSteps.length === 0) {
            renderer.render(currentDfa);
            return;
        }

        currentStepIndex = Math.max(0, Math.min(index, currentSteps.length - 1));
        renderCurrentStep();
    }

    function nextStep() {
        if (currentSteps.length === 0) {
            return false;
        }

        if (currentStepIndex >= currentSteps.length - 1) {
            return false;
        }

        currentStepIndex += 1;
        renderCurrentStep();
        return true;
    }

    function previousStep() {
        if (currentSteps.length === 0) {
            return false;
        }

        if (currentStepIndex <= 0) {
            return false;
        }

        currentStepIndex -= 1;
        renderCurrentStep();
        return true;
    }

    function reset() {
        stop();

        if (!currentDfa) {
            return;
        }

        if (currentSteps.length === 0) {
            renderer.render(currentDfa);
            return;
        }

        currentStepIndex = 0;
        renderCurrentStep();
    }

    function stop() {
        isPlaying = false;
        playToken += 1;
    }

    async function play() {
        if (!currentDfa || currentSteps.length === 0) {
            return;
        }

        stop();
        isPlaying = true;
        const token = playToken;

        renderCurrentStep();

        if (isTerminalStep(currentStepIndex)) {
            isPlaying = false;
            onComplete(getCurrentStep(), currentStepIndex, currentSteps);
            return;
        }

        while (isPlaying && token === playToken && currentStepIndex < currentSteps.length - 1) {
            await sleep(stepDelay);

            if (!isPlaying || token !== playToken) {
                return;
            }

            currentStepIndex += 1;
            renderCurrentTransition();

            await sleep(transitionHold);

            if (!isPlaying || token !== playToken) {
                return;
            }

            renderCurrentStep();

            if (isTerminalStep(currentStepIndex)) {
                isPlaying = false;
                onComplete(getCurrentStep(), currentStepIndex, currentSteps);
                return;
            }

            if (currentStepIndex < currentSteps.length - 1) {
                continue;
            }
        }

        if (isPlaying && token === playToken) {
            isPlaying = false;
            onComplete(getCurrentStep(), currentStepIndex, currentSteps);
        }
    }

    function getState() {
        return {
            currentDfa,
            currentSteps,
            currentStepIndex,
            isPlaying,
            stepDelay,
        };
    }

    return {
        setDfa,
        loadTrace,
        play,
        stop,
        reset,
        nextStep,
        previousStep,
        goToStep,
        getCurrentStep,
        getState,
        renderCurrentStep,
        setStepDelay,
    };
}