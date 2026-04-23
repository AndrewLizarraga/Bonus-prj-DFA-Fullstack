import { useState } from 'react';
import './App.css';

function App() {
  const [automatonType, setAutomatonType] = useState('dfa');
  const [automatonId, setAutomatonId] = useState('');
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function runAutomaton() {
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/run-automaton', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          automaton_type: automatonType,
          automaton_id: automatonId,
          input_string: inputString,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || `Request failed with status ${response.status}`);
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Failed to connect to backend.');
      console.error(err);
    }
  }

  return (
    <main className="app-shell">
      <h1>Automaton Visualizer</h1>

      <div className="controls">
        <label>
          Automaton Type
          <select
            value={automatonType}
            onChange={(e) => setAutomatonType(e.target.value)}
          >
            <option value="dfa">DFA</option>
            <option value="pda">PDA</option>
          </select>
        </label>

        <label>
          Automaton ID
          <input
            type="text"
            placeholder="dfa1 or pda1"
            value={automatonId}
            onChange={(e) => setAutomatonId(e.target.value)}
          />
        </label>

        <label>
          Input String
          <input
            type="text"
            placeholder="Enter input"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
          />
        </label>

        <button onClick={runAutomaton}>Run Automaton</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <section className="results">
          <h2>{result.is_accepted ? 'Accepted' : 'Rejected'}</h2>
          <p>
            <strong>Type:</strong> {result.automaton_type}
          </p>
          <p>
            <strong>ID:</strong> {result.automaton_id}
          </p>
          <pre>{JSON.stringify(result.steps, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

export default App;