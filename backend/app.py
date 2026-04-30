from typing import Dict, Set, Tuple, Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class AutomatonRequest(BaseModel):
    automaton_type: Literal["dfa", "pda"]
    automaton_id: str
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

PDAS: Dict[str, Dict[str, object]] = {
    "pda1": {
        "description": "Strings of the form 0^n1^n",
        "alphabet": {"0", "1"},
        "stack_alphabet": {"$", "0"},
        "states": {"q0", "q1", "q2"},
        "start_state": "q0",
        "start_stack_symbol": "$",
        "accept_states": {"q2"},
        "transitions": {
            # Read 0, push 0 above $
            ("q0", "0", "$"): ("q0", ["$", "0"]),

            # Read 0, push another 0
            ("q0", "0", "0"): ("q0", ["0", "0"]),

            # Read first 1, pop 0, switch to matching state
            ("q0", "1", "0"): ("q1", []),

            # Read another 1, pop 0
            ("q1", "1", "0"): ("q1", []),

            # Read epsilon, stack is only $, accept
            ("q0", "", "$"): ("q2", ["$"]),

            # Read epsilon, stack is only $, accept
            ("q1", "", "$"): ("q2", ["$"]),
        },
    },

    "pda2": {
        "description": "Palindromes with middle marker c, like 01c10",
        "alphabet": {"0", "1", "c"},
        "stack_alphabet": {"$", "0", "1"},
        "states": {"q0", "q1", "q2"},
        "start_state": "q0",
        "start_stack_symbol": "$",
        "accept_states": {"q2"},
        "transitions": {
            # Before c: push each 0 or 1 onto the stack
            ("q0", "0", "$"): ("q0", ["$", "0"]),
            ("q0", "1", "$"): ("q0", ["$", "1"]),

            ("q0", "0", "0"): ("q0", ["0", "0"]),
            ("q0", "1", "0"): ("q0", ["0", "1"]),

            ("q0", "0", "1"): ("q0", ["1", "0"]),
            ("q0", "1", "1"): ("q0", ["1", "1"]),

            # Read the middle marker c and switch to matching mode.
            # Keep the current stack top unchanged.
            ("q0", "c", "$"): ("q1", ["$"]),
            ("q0", "c", "0"): ("q1", ["0"]),
            ("q0", "c", "1"): ("q1", ["1"]),

            # After c: input must match the stack top
            ("q1", "0", "0"): ("q1", []),
            ("q1", "1", "1"): ("q1", []),

            # Accept when input is finished and only $ remains
            ("q1", "", "$"): ("q2", ["$"]),
        },
    },
    "pda3": {
        "description": "Strings of the form 0^n1^m2^m3^n, like 00112233",
        "alphabet": {"0", "1", "2", "3"},
        "stack_alphabet": {"$", "0", "1"},
        "states": {"q0", "q1", "q2", "q3"},
        "start_state": "q0",
        "start_stack_symbol": "$",
        "accept_states": {"q3"},
        "transitions": {
        # q0: Read 0s and push one 0 for each 0
            ("q0", "0", "$"): ("q0", ["$", "0"]),
            ("q0", "0", "0"): ("q0", ["0", "0"]),

        # Read first 1 and switch to q1.
        # Keep 0s underneath and push 1s above them.
            ("q0", "1", "0"): ("q1", ["0", "1"]),

        # q1: Read more 1s and push one 1 for each 1
            ("q1", "1", "1"): ("q1", ["1", "1"]),

        # Read first 2 and switch to q2.
        # Pop one 1 for each 2.
            ("q1", "2", "1"): ("q2", []),

        # q2: Read more 2s and pop one 1 for each 2
            ("q2", "2", "1"): ("q2", []),

        # Read first 3 and switch to q3.
        # Pop one 0 for each 3.
            ("q2", "3", "0"): ("q3", []),

        # q3: Read more 3s and pop one 0 for each 3
            ("q3", "3", "0"): ("q3", []),

        # Accept when input is finished and only $ remains
            ("q3", "", "$"): ("q3", ["$"]),
        },
    },
    "pda4": {
    "description": "Strings of the form 0^n1^m2^(3k), where n > m",
    "alphabet": {"0", "1", "2"},
    "stack_alphabet": {"$", "0"},
    "states": {"q0", "q1", "q2_1", "q2_2", "q2_0", "q_accept"},
    "start_state": "q0",
    "start_stack_symbol": "$",
    "accept_states": {"q_accept"},
    "transitions": {
        # Read 0s: push one 0 marker per input 0
        ("q0", "0", "$"): ("q0", ["$", "0"]),
        ("q0", "0", "0"): ("q0", ["0", "0"]),

        # Read 1s: pop one 0 marker per input 1
        ("q0", "1", "0"): ("q1", []),
        ("q1", "1", "0"): ("q1", []),

        # Start reading 2s.
        # We only allow this if there is still at least one 0 marker left,
        # which enforces n > m.
        ("q0", "2", "0"): ("q2_1", ["0"]),
        ("q1", "2", "0"): ("q2_1", ["0"]),

        # Count 2s modulo 3 using states
        ("q2_1", "2", "0"): ("q2_2", ["0"]),
        ("q2_2", "2", "0"): ("q2_0", ["0"]),
        ("q2_0", "2", "0"): ("q2_1", ["0"]),

        # Accept with no 2s, as long as n > m
        ("q0", "", "0"): ("q_accept", ["0"]),
        ("q1", "", "0"): ("q_accept", ["0"]),

        # Accept after a multiple of 3 twos
        ("q2_0", "", "0"): ("q_accept", ["0"]),
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
                "automaton_type": "dfa",
                "automaton_id": dfa_name,
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
                "automaton_type": "dfa",
                "automaton_id": dfa_name,
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
        "automaton_type": "dfa",
        "automaton_id": dfa_name,
        "input_string": input_string,
        "is_accepted": is_accepted,
        "steps": steps,
        "accepted_state": current_state if is_accepted else None,
        "rejected_state": None if is_accepted else current_state,
        "rejected_at_step": None if is_accepted else len(steps) - 1,
        "rejection_reason": None,
    }

def simulate_pda(pda_name: str, input_string: str) -> dict:
    if pda_name not in PDAS:
        return {"error": "PDA not found"}

    pda = PDAS[pda_name]
    alphabet: Set[str] = pda["alphabet"]
    transitions: Dict[Tuple[str, str, str], Tuple[str, list[str]]] = pda["transitions"]
    start_state: str = pda["start_state"]
    start_stack_symbol: str = pda["start_stack_symbol"]
    accept_states: Set[str] = pda["accept_states"]

    current_state = start_state

    # Stack convention:
    # - Python list
    # - last item is the top of the stack
    stack = [start_stack_symbol]

    steps = [
        {
            "step": 0,
            "state": current_state,
            "remaining": input_string,
            "stack": stack.copy(),
            "from_state": None,
            "to_state": None,
            "read_symbol": None,
            "stack_top_before": stack[-1] if stack else None,
            "stack_action": "Stack start symbol $",
        }
    ]

    for i, ch in enumerate(input_string):
        if ch not in alphabet:
            return {
                "automaton_type": "pda",
                "automaton_id": pda_name,
                "input_string": input_string,
                "is_accepted": False,
                "steps": steps,
                "rejected_at_step": len(steps) - 1,
                "rejected_state": current_state,
                "accepted_state": None,
                "rejection_reason": f"Invalid input symbol '{ch}' at position {i}",
            }

        if not stack:
            return {
                "automaton_type": "pda",
                "automaton_id": pda_name,
                "input_string": input_string,
                "is_accepted": False,
                "steps": steps,
                "rejected_at_step": len(steps) - 1,
                "rejected_state": current_state,
                "accepted_state": None,
                "rejection_reason": "Stack became empty unexpectedly",
            }

        stack_top = stack[-1]
        transition = transitions.get((current_state, ch, stack_top))

        if transition is None:
            return {
                "automaton_type": "pda",
                "automaton_id": pda_name,
                "input_string": input_string,
                "is_accepted": False,
                "steps": steps,
                "rejected_at_step": len(steps) - 1,
                "rejected_state": current_state,
                "accepted_state": None,
                "rejection_reason": (
                    f"No transition defined for state '{current_state}', "
                    f"input '{ch}', and stack top '{stack_top}'"
                ),
            }

        next_state, push_symbols = transition

        # Pop the current stack top because the transition matched it
        stack.pop()

        # Push replacement symbols back in order.
        # Example: ["$", "0"] becomes stack bottom "$", top "0"
        for symbol in push_symbols:
            stack.append(symbol)

        steps.append(
            {
                "step": i + 1,
                "state": next_state,
                "remaining": input_string[i + 1:],
                "stack": stack.copy(),
                "from_state": current_state,
                "to_state": next_state,
                "read_symbol": ch,
                "stack_top_before": stack_top,
                "stack_action": f"pop '{stack_top}', push {push_symbols}",
            }
        )

        current_state = next_state

    # After all input is read, try one epsilon transition
    if stack:
        stack_top = stack[-1]
        epsilon_transition = transitions.get((current_state, "", stack_top))

        if epsilon_transition is not None:
            next_state, push_symbols = epsilon_transition

            stack.pop()
            for symbol in push_symbols:
                stack.append(symbol)

            steps.append(
                {
                    "step": len(steps),
                    "state": next_state,
                    "remaining": "",
                    "stack": stack.copy(),
                    "from_state": current_state,
                    "to_state": next_state,
                    "read_symbol": "",
                    "stack_top_before": stack_top,
                    "stack_action": f"epsilon: pop '{stack_top}', push {push_symbols}",
                }
            )

            current_state = next_state

    is_accepted = current_state in accept_states

    return {
        "automaton_type": "pda",
        "automaton_id": pda_name,
        "input_string": input_string,
        "is_accepted": is_accepted,
        "steps": steps,
        "accepted_state": current_state if is_accepted else None,
        "rejected_state": None if is_accepted else current_state,
        "rejected_at_step": None if is_accepted else len(steps) - 1,
        "rejection_reason": None if is_accepted else "Input finished but PDA was not in an accept state",
    }

@app.post("/run-automaton")
def run_automaton(payload: AutomatonRequest):
    if payload.automaton_type == "dfa":
        return simulate_dfa(payload.automaton_id, payload.input_string)
    elif payload.automaton_type == "pda":
        return simulate_pda(payload.automaton_id, payload.input_string)
    return {"error": "Unsupported automaton type"}


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

@app.get("/pdas")
def get_pdas():
    pda_list = []

    for pda_name, pda_data in PDAS.items():
        transitions = [
            {
                "from_state": from_state,
                "input_symbol": input_symbol,
                "stack_top": stack_top,
                "to_state": to_state,
                "push": push_symbols,
            }
            for (from_state, input_symbol, stack_top), (to_state, push_symbols)
            in pda_data["transitions"].items()
        ]

        pda_list.append({
            "id": pda_name,
            "description": pda_data["description"],
            "states": sorted(pda_data["states"]),
            "alphabet": sorted(pda_data["alphabet"]),
            "stack_alphabet": sorted(pda_data["stack_alphabet"]),
            "start_state": pda_data["start_state"],
            "start_stack_symbol": pda_data["start_stack_symbol"],
            "accept_states": sorted(pda_data["accept_states"]),
            "transitions": transitions,
        })

    return {"pdas": pda_list}