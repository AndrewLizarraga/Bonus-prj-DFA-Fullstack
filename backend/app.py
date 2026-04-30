from typing import Dict, Set, Tuple, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Spotify helper integration
import os
import base64
import requests
from dotenv import load_dotenv

"""
backend.app
FastAPI backend exposing:
- DFA and PDA simulators used by the frontend visualization
- Spotify helper endpoints used for searching and remote playback

This file only contains routes and pure-Python simulators; nothing
here modifies behavior of the routes — only documentation and
clarifying comments are being added.
"""

load_dotenv("backend/.env")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://fictional-system-qvvpprjp47qh6v7-5173.app.github.dev",
        "https://fictional-system-qvvpprjp47qh6v7-5174.app.github.dev",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://andrewlizarraga.github.io"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / validation models
class SpotifyPlaybackRequest(BaseModel):
    access_token: str
    device_id: str | None = None
    uri: str | None = None

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
    """Simulate the DFA named ``dfa_name`` on ``input_string``.

    Returns a dictionary describing the simulation steps and final
    acceptance. The structure mirrors what the frontend expects and
    includes detailed rejection reasons when the input is invalid or
    a transition is missing.
    """

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
    """Simulate the PDA named ``pda_name`` on ``input_string``.

    The PDA uses a Python list as a stack (list end = stack top).
    The returned dict includes the step-by-step stack snapshot and
    a clear acceptance/rejection summary for the frontend.
    """

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

#Spodify helper function
def get_spotify_access_token():
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET on backend.",
        )

    auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "client_credentials",
        },
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Spotify token request failed: {response.text}",
        )

    return response.json()["access_token"]

def spotify_user_headers(access_token: str) -> dict:
    """Return headers required for Spotify Web API calls that act on behalf of a user.

    ``access_token`` must be a user-scoped OAuth token with the
    appropriate playback scopes (e.g. ``user-modify-playback-state``).
    """

    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

@app.post("/run-automaton")
def run_automaton(payload: AutomatonRequest):
    """Route to run a specified automaton.

    The payload indicates whether to run a DFA or PDA. This route
    simply dispatches to the corresponding simulator and returns its
    result unchanged.
    """

    if payload.automaton_type == "dfa":
        return simulate_dfa(payload.automaton_id, payload.input_string)
    elif payload.automaton_type == "pda":
        return simulate_pda(payload.automaton_id, payload.input_string)
    return {"error": "Unsupported automaton type"}


@app.get("/dfas")
def get_dfas():
    """Return a summarized list of DFAs suitable for the frontend UI.

    The response contains per-DFA metadata and a flattened transition
    list. States are derived from start/accept/transitions to keep the
    data compact.
    """

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
    """Return a summarized list of PDAs suitable for the frontend UI.

    Each PDA entry includes a flattened list of transitions along with
    stack-related metadata required to render and simulate the machine
    on the client side.
    """

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


    #Spotify Test route

@app.get("/spotify/test")
def spotify_test():
    """Quick Spotify API connectivity test using client credentials.

    This endpoint is intended for development to confirm the server
    can reach Spotify's search endpoint with the application token.
    """

    token = get_spotify_access_token()

    response = requests.get(
        "https://api.spotify.com/v1/search",
        headers={
            "Authorization": f"Bearer {token}",
        },
        params={
            "q": "Daft Punk",
            "type": "artist",
            "limit": 1,
        },
    )

    response.raise_for_status()
    return response.json()

@app.get("/spotify/search-artist")
def search_artist(q: str = "Daft Punk"):
    """Search for an artist by name and return a compact summary.

    Uses application credentials and returns a minimal object with the
    artist id, display name, image URL (if available) and Spotify URL.
    """

    token = get_spotify_access_token()

    response = requests.get(
        "https://api.spotify.com/v1/search",
        headers={
            "Authorization": f"Bearer {token}",
        },
        params={
            "q": q,
            "type": "artist",
            "limit": 1,
        },
    )

    response.raise_for_status()
    data = response.json()

    artist = data["artists"]["items"][0]

    return {
        "id": artist["id"],
        "name": artist["name"],
        "image": artist["images"][0]["url"] if artist["images"] else None,
        "spotify_url": artist["external_urls"]["spotify"],
    }

@app.get("/spotify/search-tracks")
def spotify_search_tracks(q: str = "Daft Punk", limit: int = 5):
    token = get_spotify_access_token()

    response = requests.get(
        "https://api.spotify.com/v1/search",
        headers={
            "Authorization": f"Bearer {token}",
        },
        params={
            "q": q,
            "type": "track",
            "limit": limit,
        },
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Spotify search failed: {response.text}",
        )

    data = response.json()

    tracks = []

    for item in data["tracks"]["items"]:
        album_images = item["album"]["images"]

        tracks.append({
            "id": item["id"],
            "name": item["name"],
            "artist": ", ".join(artist["name"] for artist in item["artists"]),
            "album": item["album"]["name"],
            "image": album_images[0]["url"] if album_images else None,
            "spotify_url": item["external_urls"]["spotify"],
            "uri": item["uri"],
        })

    return {
        "query": q,
        "tracks": tracks,
    }

@app.put("/spotify/play")
def spotify_play(payload: SpotifyPlaybackRequest):
    """Start playback on a user's device.

    ``payload.access_token`` must be a user-scoped Spotify OAuth token
    with the appropriate playback scopes (e.g. ``user-modify-playback-state``).
    ``device_id`` is optional; ``uri`` may be a track, album, or playlist
    URI and will be placed in the correct request body field for the
    Web API.
    """

    url = "https://api.spotify.com/v1/me/player/play"

    params = {}
    if payload.device_id:
        params["device_id"] = payload.device_id

    body = {}
    if payload.uri:
        if payload.uri.startswith("spotify:playlist:") or payload.uri.startswith("spotify:album:"):
            body["context_uri"] = payload.uri
        elif payload.uri.startswith("spotify:track:"):
            body["uris"] = [payload.uri]

    response = requests.put(
        url,
        headers=spotify_user_headers(payload.access_token),
        params=params,
        json=body,
    )

    if response.status_code not in (200, 202, 204):
        return {
            "ok": False,
            "status_code": response.status_code,
            "error": response.text,
        }

    return {
        "ok": True,
        "message": "Playback started",
    }


@app.put("/spotify/pause")
def spotify_pause(payload: SpotifyPlaybackRequest):
    """Pause playback on the user's active device.

    Returns a compact success or error object based on Spotify's HTTP
    response code.
    """

    url = "https://api.spotify.com/v1/me/player/pause"

    params = {}
    if payload.device_id:
        params["device_id"] = payload.device_id

    response = requests.put(
        url,
        headers=spotify_user_headers(payload.access_token),
        params=params,
    )

    if response.status_code not in (200, 202, 204):
        return {
            "ok": False,
            "status_code": response.status_code,
            "error": response.text,
        }

    return {
        "ok": True,
        "message": "Playback paused",
    }


@app.post("/spotify/next")
def spotify_next(payload: SpotifyPlaybackRequest):
    """Skip to the next track on the user's active device.

    This calls the Spotify Web API endpoint and returns a small result
    object indicating success or providing the raw error details.
    """

    url = "https://api.spotify.com/v1/me/player/next"

    params = {}
    if payload.device_id:
        params["device_id"] = payload.device_id

    response = requests.post(
        url,
        headers=spotify_user_headers(payload.access_token),
        params=params,
    )

    if response.status_code not in (200, 202, 204):
        return {
            "ok": False,
            "status_code": response.status_code,
            "error": response.text,
        }

    return {
        "ok": True,
        "message": "Skipped to next track",
    }