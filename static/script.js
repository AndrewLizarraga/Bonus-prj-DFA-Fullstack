import { createDfaRenderer } from '/static/dfaRenderer.js';

const dfaSelect = document.getElementById('dfaSelect');
const dfaDescription = document.getElementById('dfaDescription');
const runBtn = document.getElementById('runBtn');
const stringInput = document.getElementById('stringInput');
const resultText = document.getElementById('resultText');
const traceOutput = document.getElementById('traceOutput');
const canvas = document.getElementById('dfaCanvas');

const renderer = createDfaRenderer(canvas);

let dfaList = [];

document.addEventListener('DOMContentLoaded', () => {
    // Load all DFA objects from /dfas once at startup.
    loadDFAs();
});

runBtn.addEventListener('click', runDFA);
dfaSelect.addEventListener('change', showSelectedDfaInfo);

async function parseJsonSafely(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function loadDFAs() {
    try {
        const response = await fetch('/dfas');
        const data = await parseJsonSafely(response);

        // Ensure we only continue when the backend returns the expected JSON shape.
        if (!response.ok || !data || !Array.isArray(data.dfas)) {
            throw new Error(`Invalid /dfas response (status ${response.status})`);
        }

        // /dfas now includes full DFA objects used for rendering and simulation selection.
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

function showSelectedDfaInfo() {
    const selectedDfaId = dfaSelect.value;
    const selectedDfa = dfaList.find((dfa) => dfa.id === selectedDfaId);

    if (!selectedDfa) {
        // No selection: keep UI clean and avoid rendering.
        dfaDescription.textContent = '';
        return;
    }

    dfaDescription.textContent = selectedDfa.description || '';

    // Log selected DFA payload to quickly verify shape when canvas output is missing.
    console.log('selectedDfa', selectedDfa);
    console.log('states', selectedDfa.states);
    console.log('transitions', selectedDfa.transitions);

    // Keep rendering errors visible in the console instead of failing silently.
    try {
        renderer.render(selectedDfa);
    } catch (error) {
        console.error('DFA render failed', error, selectedDfa);
    }
}

function formatTraceOutput(data) {
    // Guard clause for unexpected or missing trace payloads.
    if (!data || !Array.isArray(data.steps) || data.steps.length === 0) {
        return 'No trace available.';
    }

    const inputString = typeof data.input_string === 'string' ? data.input_string : '';

    // Build the traversal chain as: qX {remaining}
    const traversalParts = data.steps.map((step) => {
        const state = step && step.state ? step.state : '?';
        const remaining = step && typeof step.remaining === 'string' ? step.remaining : '';
        return `${state} {${remaining}}`;
    });

    const resultLabel = data.is_accepted ? 'Accepted' : 'Rejected';
    return `Start input: ${inputString} => ${traversalParts.join(' => ')} (${resultLabel})`;
}

async function runDFA() {
    const selectedDfaId = dfaSelect.value;
    const userInput = stringInput.value.trim();

    if (!selectedDfaId) {
        resultText.textContent = 'Please select a DFA.';
        traceOutput.textContent = '';
        return;
    }

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
            return;
        }

        if (!data || typeof data !== 'object') {
            resultText.textContent = 'Error: Invalid JSON response from server.';
            traceOutput.textContent = 'No trace available.';
            return;
        }

        if (data.error) {
            resultText.textContent = `Error: ${data.error}`;
            traceOutput.textContent = '';
            return;
        }

        resultText.textContent = data.is_accepted ? 'Accepted' : 'Rejected';
        traceOutput.textContent = formatTraceOutput(data);
    } catch (error) {
        console.error('Error running DFA:', error);
        resultText.textContent = 'Request failed.';
        traceOutput.textContent = '';
    }
}