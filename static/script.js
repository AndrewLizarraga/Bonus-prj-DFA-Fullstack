const dfaSelect = document.getElementById('dfaSelect');
const dfaDescription = document.getElementById('dfaDescription');
const runBtn = document.getElementById('runBtn');
const stringInput = document.getElementById('stringInput');
const resultText = document.getElementById('resultText');
const traceOutput = document.getElementById('traceOutput');

let dfaList = [];

document.addEventListener('DFA_LIST_LOADED', (event) => {
    loadDFAs()
});

runBtn.addEventListener('click', runDFA);

dfaSelect.addEventListener('change', showSelectedDfaInfo);

async function loadDFAs() {
    try {
        const response = await fetch('/dfas.json');
        const data = await response.json();
        dfaList = data.dfas;
        dfaSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a DFA';
        dfaSelect.appendChild(defaultOption);

        dfaList.forEach(dfaObj => {
            const option = document.createElement('option');
            option.value = dfaObj.id;
            option.textContent = dfaObj.id;
            dfaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading DFAs:', error);
        dfaSelect.innerHTML = "";

        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = 'Error loading DFAs';
        dfaSelect.appendChild(errorOption);
    }
}

function showSelectedDfaInfo() {
    const selectedDfaId = dfaSelect.value;
    const selectedDfa = dfaList.find(dfa => dfa.id === selectedDfaId);

    if (!selectedDfa) {
        dfaDescription.textContent = '';
        return;
    }

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