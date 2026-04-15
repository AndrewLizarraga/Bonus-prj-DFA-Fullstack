// IMPORTANT: Replace this with your real forwarded Codespaces FastAPI URL.
// Example: 'https://your-backend-name-8000.app.github.dev'


// Grab references to the HTML elements we need to read from or update.
const dfaSelect = document.getElementById('dfaSelect');
const dfaDescription = document.getElementById('dfaDescription');
const runBtn = document.getElementById('runBtn');
const stringInput = document.getElementById('stringInput');
const resultText = document.getElementById('resultText');
const traceOutput = document.getElementById('traceOutput');

// This will store the DFA list returned by the backend.
let dfaList = [];

// Wait until HTML is fully loaded, then do initial setup.
// This prevents null errors from querying elements too early.
document.addEventListener('DOMContentLoaded', () => {
    loadDFAs();
});

// Run simulation when user clicks the button.
runBtn.addEventListener('click', runDFA);

// Update the description text when the selected DFA changes.
dfaSelect.addEventListener('change', showSelectedDfaInfo);

async function loadDFAs() {
    try {
        // Use the backend base URL so the request goes to FastAPI,
        // not to whatever origin is hosting/previewing the frontend files.
        const response = await fetch(`/dfas`);
        const data = await response.json();

        dfaList = data.dfas;
        dfaSelect.innerHTML = '';

        // Add a default first option so the user must pick one.
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a DFA';
        dfaSelect.appendChild(defaultOption);

        // Build dropdown options dynamically from backend data.
        // This keeps backend as the source of truth.
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

    // If nothing is selected, clear the description area.
    if (!selectedDfa) {
        dfaDescription.textContent = '';
        return;
    }

    // Show the backend-provided DFA description under the dropdown.
    dfaDescription.textContent = selectedDfa.description;
}

async function runDFA() {
    const selectedDfaId = dfaSelect.value;
    const userInput = stringInput.value.trim();

    if (!selectedDfaId) {
        resultText.textContent = 'Please select a DFA.';
        return;
    }

    try {
        // Send the simulation request to FastAPI using the full backend base URL.
        const response = await fetch(`/run-dfa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dfa: selectedDfaId,
                input_string: userInput
            })
        });

        const data = await response.json();

        if (data.error) {
            resultText.textContent = `Error: ${data.error}`;
            traceOutput.textContent = '';
            return;
        }

        resultText.textContent = data.is_accepted ? 'Accepted' : 'Rejected';
        traceOutput.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error running DFA:', error);
        resultText.textContent = 'Request failed.';
        traceOutput.textContent = '';
    }
}