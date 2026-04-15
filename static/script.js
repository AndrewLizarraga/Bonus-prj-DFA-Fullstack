const dfaSelect = document.getElementById('dfaSelect');
const dfaDescription = document.getElementById('dfaDescription');
const runBtn = document.getElementById('runBtn');
const inputString = document.getElementById('inputString');
const resultText = document.getElementById('resultText');
const traceOutput = document.getElementById('traceOutput');

let dfaList = [];

document.addEventListener('DFA_LIST_LOADED', (event) => {
    loadDFAs()
});

runBtn.addEventListener('click', runDFA);

dfaDescription.addEventListener('change', showDfaDescription);

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


