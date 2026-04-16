import { createDfaRenderer } from '/static/dfaRenderer.js';

const dfaSelect = document.getElementById('dfaSelect');
const dfaDescription = document.getElementById('dfaDescription');
const runBtn = document.getElementById('runBtn');
const stringInput = document.getElementById('stringInput');
const resultText = document.getElementById('resultText');
const traceOutput = document.getElementById('traceOutput');
const stepCounter = document.getElementById('stepCounter');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const canvas = document.getElementById('dfaCanvas');

const renderer = createDfaRenderer(canvas);

const fallbackAnimationController = {
    setStepDelay() {},
    stop() {},
    setDfa() {},
    loadTrace() {},
    play() {},
};

let animationController = fallbackAnimationController;

let dfaList = [];
let latestTraceData = null;

document.addEventListener('DOMContentLoaded', () => {
    updateSpeedDisplay();
    loadDFAs();
    initAnimationController();
});

runBtn.addEventListener('click', runDFA);
dfaSelect.addEventListener('change', showSelectedDfaInfo);

if (speedSlider) {
    speedSlider.addEventListener('input', () => {
        updateSpeedDisplay();
        animationController.setStepDelay(getStepDelayMs());
    });
}

function getStepDelayMs() {
    if (!speedSlider) {
        return 900;
    }

    const seconds = parseFloat(speedSlider.value);
    if (!Number.isFinite(seconds)) {
        return 900;
    }

    return Math.round(seconds * 1000);
}

function updateSpeedDisplay() {
    if (!speedSlider || !speedValue) {
        return;
    }

    const seconds = parseFloat(speedSlider.value);
    speedValue.textContent = `${seconds.toFixed(1)}s`;
}

function updateStepCounter(currentIndex, totalSteps) {
    if (!stepCounter) {
        return;
    }

    if (!Number.isFinite(currentIndex) || !Number.isFinite(totalSteps) || totalSteps <= 0) {
        stepCounter.textContent = 'Step: 0 / 0';
        return;
    }

    stepCounter.textContent = `Step: ${currentIndex + 1} / ${totalSteps}`;
}

async function parseJsonSafely(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function initAnimationController() {
    try {
        const { createAnimationController } = await import('/static/animationController.js?v=4');

        animationController = createAnimationController(renderer, {
            stepDelay: getStepDelayMs(),
            transitionHold: 300,
            onStepChange(step, index, steps) {
                updateStepCounter(index, steps.length);

                if (latestTraceData) {
                    traceOutput.textContent = formatTraceOutput(latestTraceData, index);
                }
            },
            onComplete(finalStep, index, steps) {
                updateStepCounter(index, steps.length);

                if (latestTraceData) {
                    traceOutput.textContent = formatTraceOutput(latestTraceData, index);
                }

                console.log('Animation complete:', finalStep);
            }
        });

        const selectedDfaId = dfaSelect.value;
        const selectedDfa = dfaList.find((dfa) => dfa.id === selectedDfaId);

        if (selectedDfa) {
            animationController.setDfa(selectedDfa);
        }
    } catch (error) {
        console.error('Animation controller failed to load:', error);
        animationController = fallbackAnimationController;
    }
}

function isValidRunResponse(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
    }

    if (typeof data.input_string !== 'string') {
        return false;
    }

    if (typeof data.is_accepted !== 'boolean') {
        return false;
    }

    if (!Array.isArray(data.steps)) {
        return false;
    }

    return data.steps.every((step) => {
        if (!step || typeof step !== 'object' || Array.isArray(step)) {
            return false;
        }

        if (typeof step.state !== 'string') {
            return false;
        }

        if (typeof step.remaining !== 'string') {
            return false;
        }

        return true;
    });
}

async function loadDFAs() {
    try {
        const response = await fetch('/dfas');
        const data = await parseJsonSafely(response);

        if (!response.ok || !data || !Array.isArray(data.dfas)) {
            throw new Error(`Invalid /dfas response (status ${response.status})`);
        }

        dfaList = data.dfas;
        dfaSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a DFA';
        dfaSelect.appendChild(defaultOption);

        dfaList.forEach((dfaObj) => {
            const option = document.createElement('option');
            option.value = dfaObj.id;
            option.textContent = dfaObj.id;
            dfaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading DFAs:', error);
        dfaSelect.innerHTML = '';

        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = 'Error loading DFAs';
        dfaSelect.appendChild(errorOption);
    }
}

function formatTraceOutput(data, activeIndex = null) {
    if (!data || !Array.isArray(data.steps) || data.steps.length === 0) {
        return 'No trace available.';
    }

    const inputString = typeof data.input_string === 'string' ? data.input_string : '';

    const traversalParts = data.steps.map((step, index) => {
        const state = step && step.state ? step.state : '?';
        const remaining = step && typeof step.remaining === 'string' ? step.remaining : '';
        const text = `${state} {${remaining}}`;

        return index === activeIndex ? `[${text}]` : text;
    });

    const resultLabel = data.is_accepted ? 'Accepted' : 'Rejected';
    return `Start input: ${inputString} => ${traversalParts.join(' => ')} (${resultLabel})`;
}

function showSelectedDfaInfo() {
    const selectedDfaId = dfaSelect.value;
    const selectedDfa = dfaList.find((dfa) => dfa.id === selectedDfaId);

    animationController.stop();
    latestTraceData = null;

    if (traceOutput) {
        traceOutput.textContent = '';
    }

    updateStepCounter(-1, 0);

    if (!selectedDfa) {
        dfaDescription.textContent = '';
        resultText.textContent = '';
        return;
    }

    dfaDescription.textContent = selectedDfa.description || '';
    animationController.setDfa(selectedDfa);
}

async function runDFA() {
    const selectedDfaId = dfaSelect.value;
    const userInput = stringInput.value.trim();

    if (!selectedDfaId) {
        resultText.textContent = 'Please select a DFA.';
        traceOutput.textContent = '';
        updateStepCounter(-1, 0);
        return;
    }

    const selectedDfa = dfaList.find((dfa) => dfa.id === selectedDfaId);

    try {
        const response = await fetch('/run-dfa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dfa: selectedDfaId,
                input_string: userInput
            })
        });

        const data = await parseJsonSafely(response);

        if (!response.ok) {
            const message = data && data.error
                ? data.error
                : `Request failed with status ${response.status}.`;
            resultText.textContent = `Error: ${message}`;
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        if (!data || typeof data !== 'object') {
            resultText.textContent = 'Error: Invalid JSON response from server.';
            traceOutput.textContent = 'No trace available.';
            updateStepCounter(-1, 0);
            return;
        }

        if (data.error) {
            resultText.textContent = `Error: ${data.error}`;
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        if (!isValidRunResponse(data)) {
            resultText.textContent = 'Error: Server returned malformed DFA result data.';
            traceOutput.textContent = 'No trace available.';
            updateStepCounter(-1, 0);
            return;
        }

        latestTraceData = data;
        if (data.is_accepted) {
            resultText.textContent = 'Accepted';
        } else if (typeof data.rejection_reason === 'string' && data.rejection_reason.length > 0) {
            resultText.textContent = `Rejected: ${data.rejection_reason}`;
        } else {
            resultText.textContent = 'Rejected';
        }

        if (selectedDfa) {
            animationController.setStepDelay(getStepDelayMs());
            animationController.loadTrace(selectedDfa, data);
            animationController.play();
        } else {
            traceOutput.textContent = formatTraceOutput(data);
            updateStepCounter(0, data.steps.length);
        }
    } catch (error) {
        console.error('Error running DFA:', error);
        resultText.textContent = 'Request failed.';
        traceOutput.textContent = '';
        updateStepCounter(-1, 0);
    }
}