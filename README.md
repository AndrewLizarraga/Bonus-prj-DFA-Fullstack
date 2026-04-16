# DFA Visualizer

A small web app for exploring and testing deterministic finite automata (DFAs). Users pick a predefined DFA, enter a binary input string, view whether the string is accepted or rejected, and see the automaton rendered on a canvas with a readable execution trace.

## Delopied URL on Render

[Live Demo](https://bonus-prj-dfa-fullstack-1.onrender.com/)

## Purpose

This project is meant to make DFA behavior easier to understand visually.

It combines:
- a **FastAPI backend** that stores DFA definitions and simulates them step by step
- a **plain HTML/CSS/JavaScript frontend** that fetches DFA data, renders state diagrams, and shows simulation results

The goal is to give a lightweight learning tool for formal languages / automata concepts without needing a heavy framework.

## How it works

1. When the page loads, the frontend requests `GET /dfas`.
2. The backend returns all available DFA definitions in a frontend-friendly format.
3. The user selects a DFA and enters an input string.
4. When **Run DFA** is clicked, the frontend sends `POST /run-dfa` with:
   - the selected DFA id
   - the input string
5. The backend simulates the machine one symbol at a time and returns:
   - whether the string is accepted
   - the step-by-step traversal trace
6. The frontend displays the result and trace, while the canvas renderer draws the DFA structure.

## Architecture

### Frontend

Files:
- `static/index.html` — page structure and UI elements
- `static/script.js` — fetches DFA data, handles user actions, and formats results
- `static/dfaRenderer.js` — draws states and transitions on the canvas
- `static/animationController.js`— controls the step-by-step DFA animation timing, syncing state/transition highlights with the trace display as the input string is processed.
- `static/style.css` — provides the visual styling and layout for the interface, including the page structure, controls, results section, trace display, and canvas area.

Responsibilities:
- load all DFAs once at startup
- populate the DFA dropdown
- render the selected DFA on the canvas
- send simulation requests to the backend
- display accept/reject status and the trace output

### Backend

File:
- `app.py`

Responsibilities:
- serve the frontend entry page
- serve static assets from `/static`
- store predefined DFA definitions in memory
- validate and simulate input strings
- expose API endpoints used by the frontend

## API endpoints

### `GET /`
Serves the main HTML page.

### `GET /dfas`
Returns all DFA definitions needed by the frontend, including:
- id
- description
- states
- start state
- accept states
- transitions

### `POST /run-dfa`
Runs a simulation for the selected DFA.

Example request body:

```json
{
  "dfa": "dfa1",
  "input_string": "10011"
}
```

Example response shape:

```json
{
  "dfa": "dfa1",
  "input_string": "10011",
  "is_accepted": true,
  "steps": [
    {
      "step": 0,
      "state": "q0",
      "from_state": null,
      "to_state": null,
      "remaining": "10011"
    }
  ]
}
```

If the input contains a symbol outside the DFA alphabet, the backend returns an error message.

## Current DFA data model

Each DFA is stored in the backend with:
- `description`
- `alphabet`
- `start_state`
- `accept_states`
- `transitions`

Transitions are stored as `(state, symbol) -> next_state` mappings and are converted into a frontend-friendly array for rendering.

## Example DFAs currently included

Based on the current backend source, the app includes at least:
- `dfa1` — contains at least one `1` and an even number of `0`s after the last `1`
- `dfa2` — accepts strings with an even number of `1`s

## Running the project locally

### 1. Create the project structure
Make sure your files are arranged like this:

```text
project-root/
├── app.py
├── requirements.txt
└── static/
    ├── index.html
    ├── script.js
    ├── dfaRenderer.js
    └── style.css
    └──animationController.js.css
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```
requirments includes
```txt
fastapi
uvicorn
pydantic
```

### 3. Start the server

```bash
uvicorn app:app --reload
```

### 4. Open it in the browser

Visit:

```text
http://127.0.0.1:8000
```

## Deployment notes

This project is **not just a static site** in its current form.

Because the frontend depends on FastAPI endpoints like `/dfas` and `/run-dfa`, it needs a backend runtime when deployed. That means:
- **GitHub Pages alone is not enough** for the current version
- a platform like **Render** works better because it can host the FastAPI backend

If someone wants a GitHub Pages-only version, the DFA data and simulation logic would need to move fully into frontend JavaScript.

## Key design choices

- **Single fetch for DFA definitions**: the frontend loads all DFAs once from `/dfas`, which keeps the UI simpler and avoids repeated requests.
- **Backend-owned DFA definitions**: the source of truth stays in Python, so simulation and visualization use the same data.
- **Canvas-based renderer**: states, straight edges, curved reverse edges, self-loops, and start arrows are drawn dynamically.
- **Readable trace output**: the frontend formats each run into a concise state/remaining-input sequence.

## What is currently missing from the README inputs

I could write this README from the sources you shared, but these details were **not present in the files I reviewed** and would make it more complete:


