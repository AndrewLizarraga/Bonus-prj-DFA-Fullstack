# Automaton Visualizer

An interactive web app for exploring and testing automata such as **Deterministic Finite Automata (DFAs)** and **Pushdown Automata (PDAs)**.

Users can select a predefined automaton, enter an input string, run the simulation, and watch the machine process the input step by step. The visualizer shows state transitions, input traces, accept/reject results, and PDA stack behavior.

## Live Page

Use the GitHub Pages link in the deployment section.

## Backend

Back-end deployed on Render.

## Purpose

This project was built to make automata behavior easier to understand visually.

Automata such as DFAs and PDAs can be difficult to follow when they are only shown as diagrams or transition tables. This tool helps users see what is happening during each step of computation by animating transitions, showing the remaining input, and displaying the machine trace.

The goal is to provide a lightweight learning tool for students studying formal languages, computation theory, and automata concepts.

## Features

- Select and run predefined DFAs
- Select and run predefined PDAs
- Enter custom input strings
- View accept/reject results
- Step through automaton execution visually
- See animated state transitions
- Display readable trace output
- Visualize PDA stack behavior
- Render automaton diagrams on a canvas
- Validate backend requests using Pydantic models
- Use a FastAPI backend for simulation logic
- Use a frontend interface for interacting with the automata

## How It Works

When the page loads, the frontend requests the available automata from the backend.

The user selects an automaton type, chooses a specific automaton, and enters an input string.

When the simulation runs, the frontend sends the selected automaton information and input string to the backend.

The backend simulates the automaton step by step and returns:

- whether the string was accepted or rejected
- the execution trace
- state transition information
- remaining input at each step
- stack updates for PDAs

The frontend then displays the result, updates the trace output, and animates the automaton diagram.

## Architecture

### Frontend

The frontend is responsible for:

- loading available automata
- displaying automaton options
- collecting user input
- sending simulation requests to the backend
- rendering DFA/PDA diagrams
- animating state transitions
- displaying trace output
- showing PDA stack behavior

Main frontend responsibilities include:

- automaton selection
- input controls
- visual rendering
- animation timing
- trace formatting
- result display

### Backend

The backend is built with **FastAPI**.

The backend is responsible for:

- storing predefined DFA and PDA definitions
- validating request bodies with Pydantic
- simulating automata step by step
- returning structured trace data
- handling invalid inputs
- exposing API endpoints used by the frontend

## API Endpoints

### `GET /`

Confirms the backend is running.

### `GET /dfas`

Returns all available DFA definitions.

Each DFA includes:

- id
- description
- states
- alphabet
- start state
- accept states
- transitions

### `GET /pdas`

Returns all available PDA definitions.

Each PDA includes:

- id
- description
- states
- input alphabet
- stack alphabet
- start state
- accept states
- transitions

### `POST /run-automaton`

Runs a simulation for the selected automaton.

Example request body:

```json
{
  "automaton_type": "dfa",
  "automaton_id": "dfa1",
  "input_string": "10011"
}
Example Response 
```json
{
  "automaton_type": "dfa",
  "automaton_id": "dfa1",
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
