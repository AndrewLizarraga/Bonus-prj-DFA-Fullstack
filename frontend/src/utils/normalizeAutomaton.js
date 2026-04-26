export function normalizeAutomaton(automatonType, automaton) {
  if (!automaton) return null;

  if (automatonType === "dfa") {
    return automaton;
  }

  if (automatonType === "pda") {
    return {
      ...automaton,
      transitions: automaton.transitions.map((t) => ({
        from: t.from_state,
        to: t.to_state,
        label: `${t.input_symbol || "ε"}, ${t.stack_top} → ${
          t.push.length > 0 ? t.push.join("") : "ε"
        }`,
      })),
    };
  }

  return automaton;
}