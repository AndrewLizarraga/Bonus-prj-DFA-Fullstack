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
const headerDropdown = document.querySelector('.dropdown-header');
const headerSelect = headerDropdown ? headerDropdown.querySelector('.select') : null;
const headerSelectedText = headerDropdown ? headerDropdown.querySelector('.selected') : null;
const headerMenu = headerDropdown ? headerDropdown.querySelector('.menu') : null;
const featurePanels = Array.from(document.querySelectorAll('.feature-panel[data-feature]'));

const renderer = canvas
    ? createDfaRenderer(canvas)
    : {
        renderDfa() {},
        resetHighlights() {},
        highlightState() {},
        animateTransition() {},
    };

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

function bootstrap() {
    updateSpeedDisplay();
    loadDFAs();
    initAnimationController();
    initHeaderDropdown();

    if (runBtn) {
        runBtn.addEventListener('click', runDFA);
    }

    if (dfaSelect) {
        dfaSelect.addEventListener('change', showSelectedDfaInfo);
    }
}

function initHeaderDropdown() {
    if (!headerDropdown || !headerSelect || !headerSelectedText || !headerMenu) {
        return;
    }

    const options = Array.from(headerMenu.querySelectorAll('li'));
    if (options.length === 0) {
        return;
    }

    let activeIndex = options.findIndex((option) => option.classList.contains('active'));
    if (activeIndex < 0) {
        activeIndex = 0;
        options[0].classList.add('active');
        options[0].setAttribute('aria-selected', 'true');
    }

    function openMenu() {
        headerSelect.classList.add('is-open');
        headerMenu.classList.add('open');
        headerSelect.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        headerSelect.classList.remove('is-open');
        headerMenu.classList.remove('open');
        headerSelect.setAttribute('aria-expanded', 'false');
    }

    function setSelected(index) {
        if (index < 0 || index >= options.length) {
            return;
        }

        options.forEach((option) => {
            option.classList.remove('active');
            option.setAttribute('aria-selected', 'false');
            option.tabIndex = -1;
        });

        const option = options[index];
        option.classList.add('active');
        option.setAttribute('aria-selected', 'true');
        option.tabIndex = 0;
        activeIndex = index;
        headerSelectedText.textContent = option.textContent ? option.textContent.trim() : '';

        const selectedValue = option.dataset.value;
        updateFeaturePanels(selectedValue);
    }

    function toggleMenu() {
        if (headerMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    setSelected(activeIndex);

    headerSelect.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    headerSelect.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMenu();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            openMenu();
            setSelected((activeIndex + 1) % options.length);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu();
            setSelected((activeIndex - 1 + options.length) % options.length);
        }

        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    options.forEach((option) => {
        option.tabIndex = -1;
    });

    headerMenu.addEventListener('click', (event) => {
        const option = event.target.closest('li[role="option"]');
        if (!option) {
            return;
        }

        const selectedIndex = options.indexOf(option);
        if (selectedIndex < 0) {
            return;
        }

        setSelected(selectedIndex);
        closeMenu();
        headerSelect.focus();
    });

    headerMenu.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const option = event.target.closest('li[role="option"]');
        if (!option) {
            return;
        }

        const selectedIndex = options.indexOf(option);
        if (selectedIndex < 0) {
            return;
        }

        event.preventDefault();
        setSelected(selectedIndex);
        closeMenu();
        headerSelect.focus();
    });

    document.addEventListener('click', (event) => {
        if (!headerDropdown.contains(event.target)) {
            closeMenu();
        }
    });

    headerDropdown.addEventListener('focusout', (event) => {
        // Wait for the next focused element so option selection is not interrupted.
        requestAnimationFrame(() => {
            const nextFocusedElement = document.activeElement;
            if (nextFocusedElement && headerDropdown.contains(nextFocusedElement)) {
                return;
            }
            closeMenu();
        });
    });

    window.addEventListener('resize', closeMenu);
}

function updateFeaturePanels(selectedFeature) {
    if (!selectedFeature || featurePanels.length === 0) {
        return;
    }

    featurePanels.forEach((panel) => {
        const isMatch = panel.dataset.feature === selectedFeature;
        panel.classList.toggle('is-hidden', !isMatch);
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

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

function resetResultStateClasses() {
    if (!resultText) {
        return;
    }

    resultText.classList.remove('accepted', 'rejected');
}

function setResultText(message, status = null) {
    if (!resultText) {
        return;
    }

    resultText.textContent = message;
    resetResultStateClasses();

    if (status === 'accepted' || status === 'rejected') {
        resultText.classList.add(status);
    }
}

async function parseJsonSafely(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function initAnimationController() {
    if (!canvas) {
        console.error('Animation controller setup skipped: #dfaCanvas was not found.');
        animationController = fallbackAnimationController;
        return;
    }

    try {
        const { createAnimationController } = await import('/static/animationController.js?v=4');

        animationController = createAnimationController(renderer, {
            stepDelay: getStepDelayMs(),
            transitionHold: 300,
            onStepChange(step, index, steps) {
                updateStepCounter(index, steps.length);

                if (latestTraceData) {
                    renderTraceProgress(latestTraceData, index, false);
                }
            },
            onComplete(finalStep, index, steps) {
                updateStepCounter(index, steps.length);

                if (latestTraceData) {
                    renderTraceProgress(latestTraceData, index, true);
                }

                console.log('Animation complete:', finalStep);
            }
        });

        const selectedDfaId = dfaSelect ? dfaSelect.value : '';
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
    if (!dfaSelect) {
        console.error('Cannot load DFAs: #dfaSelect was not found.');
        return;
    }

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
            option.textContent = dfaObj.description
                ? `${dfaObj.id}    L(M) = A { ${dfaObj.description} }`
                : dfaObj.id;
            option.title = dfaObj.description
                ? `L(M) = A { ${dfaObj.description} }`
                : '';
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

function buildFriendlyTraceItems(data) {
    if (!data || !Array.isArray(data.steps) || data.steps.length === 0) {
        return [];
    }

    const items = [];
    const initialState = data.steps[0] && data.steps[0].state ? data.steps[0].state : '?';
    items.push({
        kind: 'start',
        text: `Start at ${initialState}`
    });

    for (let i = 1; i < data.steps.length; i += 1) {
        const previous = data.steps[i - 1] || {};
        const current = data.steps[i] || {};

        const prevRemaining = typeof previous.remaining === 'string' ? previous.remaining : '';
        const currRemaining = typeof current.remaining === 'string' ? current.remaining : '';

        let symbol = '?';
        if (prevRemaining.length > currRemaining.length) {
            const consumed = prevRemaining.slice(0, prevRemaining.length - currRemaining.length);
            symbol = consumed.length > 0 ? consumed : 'ε';
        } else if (prevRemaining.length === currRemaining.length) {
            symbol = 'ε';
        }

        const nextState = current.state || '?';
        items.push({
            kind: 'transition',
            text: `Read ${symbol} -> move to ${nextState}`
        });
    }

    return items;
}

function renderTraceProgress(data, activeIndex = 0, isComplete = false) {
    if (!traceOutput) {
        return;
    }

    if (!data || !Array.isArray(data.steps) || data.steps.length === 0) {
        traceOutput.textContent = '';
        return;
    }

    const safeActiveIndex = Number.isFinite(activeIndex) ? Math.max(0, activeIndex) : 0;
    const friendlyItems = buildFriendlyTraceItems(data);
    const revealedCount = Math.min(safeActiveIndex + 1, friendlyItems.length);

    let html = '<div class="trace-list">';

    for (let idx = 0; idx < revealedCount; idx += 1) {
        const item = friendlyItems[idx];
        const isCurrentStep = idx === revealedCount - 1 && !isComplete;
        const classes = isCurrentStep ? 'trace-step active' : 'trace-step completed';

        html += `<div class="${classes}"><span class="trace-text">${escapeHtml(item.text)}</span></div>`;
    }

    const finalStateStep = data.steps[data.steps.length - 1];
    const finalState = finalStateStep && finalStateStep.state ? finalStateStep.state : '?';

    if (isComplete) {
        html += `<div class="trace-step completed trace-end"><span class="trace-text">Ended at ${escapeHtml(finalState)}</span></div>`;

        const statusClass = data.is_accepted ? 'accepted' : 'rejected';
        const statusText = data.is_accepted ? 'Accepted' : 'Rejected';
        html += `<div class="trace-status ${statusClass}">${escapeHtml(statusText)}</div>`;
    }

    html += '</div>';
    traceOutput.innerHTML = html;
}

function showSelectedDfaInfo() {
    if (!dfaSelect || !dfaDescription) {
        return;
    }

    const selectedDfaId = dfaSelect.value;
    const selectedDfa = dfaList.find((dfa) => dfa.id === selectedDfaId);

    animationController.stop();
    latestTraceData = null;

    if (traceOutput) {
        traceOutput.textContent = '';
    }

    updateStepCounter(-1, 0);
    resetResultStateClasses();

    if (!selectedDfa) {
        dfaDescription.textContent = '';
        setResultText('');
        return;
    }

    dfaDescription.textContent = selectedDfa.description
        ? `L(M) = A { ${selectedDfa.description} }`
        : '';
    animationController.setDfa(selectedDfa);
}

async function runDFA() {
    if (!dfaSelect || !stringInput || !traceOutput) {
        setResultText('Interface is not ready. Please refresh the page.');
        return;
    }

    const selectedDfaId = dfaSelect.value;
    const userInput = stringInput.value.trim();

    if (!selectedDfaId) {
        setResultText('Please select a DFA.');
        traceOutput.textContent = '';
        updateStepCounter(-1, 0);
        return;
    }

    animationController.stop();
    latestTraceData = null;
    traceOutput.textContent = '';
    updateStepCounter(-1, 0);

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
            setResultText(`Error: ${message}`);
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        if (!data || typeof data !== 'object') {
            setResultText('Error: Invalid JSON response from server.');
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        if (data.error) {
            setResultText(`Error: ${data.error}`);
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        if (!isValidRunResponse(data)) {
            setResultText('Error: Server returned malformed DFA result data.');
            traceOutput.textContent = '';
            updateStepCounter(-1, 0);
            return;
        }

        latestTraceData = data;
        // Keep top status line empty for successful runs; final status is shown in trace output.
        setResultText('');

        renderTraceProgress(data, 0, false);
        updateStepCounter(0, data.steps.length);

        if (selectedDfa) {
            animationController.setStepDelay(getStepDelayMs());
            animationController.loadTrace(selectedDfa, data);
            animationController.play();
        } else {
            renderTraceProgress(data, data.steps.length - 1, true);
            updateStepCounter(data.steps.length - 1, data.steps.length);
        }
    } catch (error) {
        console.error('Error running DFA:', error);
        setResultText('Request failed.');
        traceOutput.textContent = '';
        updateStepCounter(-1, 0);
    }
}