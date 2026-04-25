// src/services/automatonApi.js

const API_BASE_URL =
  "https://fictional-system-qvvpprjp47qh6v7-8000.app.github.dev";

export async function runAutomaton(selectedType, automatonId, inputString) {
  console.log("runAutomaton called with:", {
    selectedType,
    automatonId,
    inputString,
  });

  if (selectedType !== "dfa" && selectedType !== "pda") {
    console.warn("API call blocked. Invalid selectedType:", selectedType);
    throw new Error("Invalid automaton type");
  }

  const payload = {
    automaton_type: selectedType,
    automaton_id: automatonId,
    input_string: inputString,
  };

  console.log("Sending payload to backend:", payload);

  const response = await fetch(`${API_BASE_URL}/run-automaton`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("Raw response:", response);

  const data = await response.json();

  console.log("Backend returned data:", data);

  if (!response.ok || data.error) {
    console.error("Backend error:", data.error);
    throw new Error(data.error || "Failed to run automaton");
  }

  return data;
}

export async function getAutomataOptions(selectedType) {
  if (selectedType !== "dfa" && selectedType !== "pda") {
    return [];
  }

  const endpoint = selectedType === "dfa" ? "/dfas" : "/pdas";

  console.log("Fetching automata options from:", `${API_BASE_URL}${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  const data = await response.json();

  console.log("Automata options returned:", data);

  if (!response.ok || data.error) {
    throw new Error(data.error || "Failed to fetch automata options");
  }

  return selectedType === "dfa" ? data.dfas : data.pdas;
}