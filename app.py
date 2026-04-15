from typing import Dict, Set, Tuple
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

#CORS SetUP
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#request model - What JSON we expect from the frontend
class DFARequest(BaseModel):
  dfa:str
  input_string:str

DFAS: Dict[str, Dict[str, object]] = {
    "dfa1": {
      "description": "Contains at Least one 1 and an even number of 0s follows the last 1",
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
}

def simulate_dfa(dfa_name: str, input_string: str) -> dict:
    if dfa_name not in DFAS:
        return {"error": "DFA not found"}

    #Pull the selected DFA's properties out into variables
    dfa = DFAS[dfa_name]
    alphabet: Set[str] = dfa["alphabet"]
    transitions: Dict[Tuple[str,str],str] = dfa["transitions"]
    start_state:str = dfa["start_state"]
    accept_states:Set[str] = dfa["accept_states"]

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
            return {"error": f"Invalid input symbol '{ch}' at position {i}"}
        # Update current_state so the next loop iteration continues from here
        next_state = transitions.get((current_state, ch))

        if next_state is None:
            return {"error": f"No transition defined for state '{current_state}' on symbol '{ch}'"}

        steps.append(
            {
                "step": i + 1,
                "state": next_state,
                "from_state": current_state,
                "to_state": next_state,
                "remaining": input_string[i + 1 :],
            }
        )
         # Update current_state so the next loop iteration continues from here
        current_state = next_state
    is_accepted = current_state in accept_states
    return {
        "dfa": dfa_name,
        "input_string": input_string,
        "is_accepted": is_accepted,
        "steps": steps,
    }

# Simple test route so you can open the backend URL and confirm it works
@app.get("/")
def root():
    return {
        "message": "DFA API is running",
        "available_dfas": list(DFAS.keys()),
    }

@app.post("/run-dfa")
def run_dfa(payload: DFARequest):
    return simulate_dfa(payload.dfa, payload.input_string)

@app.get("/dfas")
def get_dfas():
    return {
        "dfas":[
            {
                "id": dfa_id,
                "description": dfa["description"],
            }
            for dfa_name, dfa_data in DFAS.items()
        ]
    }
