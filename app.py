from pathlib import Path
from typing import Dict, Set, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class DFARequest(BaseModel):
    dfa: str
    input_string: str


DFAS: Dict[str, Dict[str, object]] = {
    "dfa1": {
        "description": "Contains at least one 1 and an even number of 0s after the last 1",
        "alphabet": {"0", "1"},
        "start_state": "q0",
        "accept_states": {"q1"},
        "transitions": {
            ("q0", "0"): "q0",
            ("q0", "1"): "q1",
            ("q1", "0"): "q2",
            ("q1", "1"): "q1",
            ("q2", "0"): "q1",
            ("q2", "1"): "q1",
        },
    },
    "dfa2": {
        "description": "Even number of 1s",
        "alphabet": {"0", "1"},
        "start_state": "q0",
        "accept_states": {"q0"},
        "transitions": {
            ("q0", "0"): "q0",
            ("q0", "1"): "q1",
            ("q1", "0"): "q1",
            ("q1", "1"): "q0",
        },
    },
    "dfa3": {
    "description": "Strings that end with 0",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q1"},
    "transitions": {
        ("q0", "0"): "q1",
        ("q0", "1"): "q0",
        ("q1", "0"): "q1",
        ("q1", "1"): "q0",
    },
},
"dfa4": {
    "description": "Strings with an odd number of 0s",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q1"},
    "transitions": {
        ("q0", "0"): "q1",
        ("q0", "1"): "q0",
        ("q1", "0"): "q0",
        ("q1", "1"): "q1",
    },
},
"dfa5": {
    "description": "Strings containing substring 01",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q2"},
    "transitions": {
        ("q0", "0"): "q1",
        ("q0", "1"): "q0",
        ("q1", "0"): "q1",
        ("q1", "1"): "q2",
        ("q2", "0"): "q2",
        ("q2", "1"): "q2",
    },
},
"dfa6": {
    "description": "Strings containing an even number of 0s and an even number of 1s",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q0"},
    "transitions": {
        ("q0", "0"): "q1",
        ("q0", "1"): "q2",
        ("q1", "0"): "q0",
        ("q1", "1"): "q3",
        ("q2", "0"): "q3",
        ("q2", "1"): "q0",
        ("q3", "0"): "q2",
        ("q3", "1"): "q1",
    },
},
"dfa7": {
    "description": "Strings that start with 1",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q1"},
    "transitions": {
        ("q0", "0"): "q2",
        ("q0", "1"): "q1",
        ("q1", "0"): "q1",
        ("q1", "1"): "q1",
        ("q2", "0"): "q2",
        ("q2", "1"): "q2",
    },
},
"dfa8": {
    "description": "Binary strings divisible by 3",
    "alphabet": {"0", "1"},
    "start_state": "q0",
    "accept_states": {"q0"},
    "transitions": {
        ("q0", "0"): "q0",
        ("q0", "1"): "q1",
        ("q1", "0"): "q2",
        ("q1", "1"): "q0",
        ("q2", "0"): "q1",
        ("q2", "1"): "q2",
    },
},
}


def simulate_dfa(dfa_name: str, input_string: str) -> dict:
    if dfa_name not in DFAS:
        return {"error": "DFA not found"}

    dfa = DFAS[dfa_name]
    alphabet: Set[str] = dfa["alphabet"]
    transitions: Dict[Tuple[str, str], str] = dfa["transitions"]
    start_state: str = dfa["start_state"]
    accept_states: Set[str] = dfa["accept_states"]

    current_state = start_state

    steps = [
        {
            "step": 0,
            "state": current_state,
            "from_state": None,
            "to_state": None,
            "remaining": input_string,
        }
    ]

    for i, ch in enumerate(input_string):
        if ch not in alphabet:
            return {
                "dfa": dfa_name,
                "input_string": input_string,
                "is_accepted": False,
                "steps": steps,
                "rejected_at_step": len(steps) - 1,
                "rejected_state": current_state,
                "accepted_state": None,
                "rejection_reason": f"Invalid input symbol '{ch}' at position {i}",
            }

        next_state = transitions.get((current_state, ch))

        if next_state is None:
            return {
                "dfa": dfa_name,
                "input_string": input_string,
                "is_accepted": False,
                "steps": steps,
                "rejected_at_step": len(steps) - 1,
                "rejected_state": current_state,
                "accepted_state": None,
                "rejection_reason": f"No transition defined for state '{current_state}' on symbol '{ch}'",
            }

        steps.append(
            {
                "step": i + 1,
                "state": next_state,
                "from_state": current_state,
                "to_state": next_state,
                "remaining": input_string[i + 1:],
            }
        )

        current_state = next_state

    is_accepted = current_state in accept_states

    return {
        "dfa": dfa_name,
        "input_string": input_string,
        "is_accepted": is_accepted,
        "steps": steps,
        "accepted_state": current_state if is_accepted else None,
        "rejected_state": None if is_accepted else current_state,
        "rejected_at_step": None if is_accepted else len(steps) - 1,
        "rejection_reason": None,
    }


@app.get("/")
def serve_index():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/run-dfa")
def run_dfa(payload: DFARequest):
    return simulate_dfa(payload.dfa, payload.input_string)


@app.get("/dfas")
def get_dfas():
    dfa_list = []

    for dfa_name, dfa_data in DFAS.items():
        states = sorted({
            dfa_data["start_state"],
            *dfa_data["accept_states"],
            *[from_state for from_state, _ in dfa_data["transitions"].keys()],
            *dfa_data["transitions"].values(),
        })

        transitions = [
            {
                "from": from_state,
                "to": to_state,
                "label": symbol,
            }
            for (from_state, symbol), to_state in dfa_data["transitions"].items()
        ]

        dfa_list.append({
            "id": dfa_name,
            "description": dfa_data["description"],
            "states": states,
            "start_state": dfa_data["start_state"],
            "accept_states": list(dfa_data["accept_states"]),
            "transitions": transitions,
        })

    return {"dfas": dfa_list}