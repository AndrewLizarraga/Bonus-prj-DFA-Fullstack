import { useEffect, useState } from "react";
import VisulazationSelector from "./components/VisulazationSelector";
import AnimationCanvas from "./components/AnimationCanvas";
import TracePanel from "./components/TracePanel";
import StackPanel from "./components/StackPanel";
import PdaGridWalkCanvas from "./components/PdaGridWalkCanvas";
import { runAutomaton, getAutomataOptions } from "./services/automatonApi";
import useStepPlayback from "./hooks/useStepPlayback";
import { normalizeAutomaton } from "./utils/normalizeAutomaton";
import "./components/AlertCard";
import AlertCard from "./components/AlertCard";

import SpotifyLoginButton from "./components/SpotifyLoginButton";
import SpotifyCallback from "./components/SpotifyCallback";
import { getSpotifyAccessToken } from "./services/spotifyAuth";

function App() {
  const [userSelectedType, setSelectedType] = useState("");
  const [selectedAutomaton, setSelectedAutomaton] = useState("");
  const [automataOptions, setAutomataOptions] = useState([]);
  const [inputString, setInputString] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stepSpeed, setStepSpeed] = useState(1);
  const [renderMode, setRenderMode] = useState("diagram");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingCard, setShowLoadingCard] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(getSpotifyAccessToken());
  const [showMusicMode, setShowMusicMode] = useState(false);

  const { activeStepIndex } = useStepPlayback(result, stepSpeed);

  const hasSelectedType =
    userSelectedType === "dfa" || userSelectedType === "pda";

  const selectedAutomatonObject = automataOptions.find(
    (a) => a.id === selectedAutomaton
  );


  const drawableAutomaton =
    selectedAutomatonObject && userSelectedType
      ? normalizeAutomaton(userSelectedType, selectedAutomatonObject)
      : null;

  useEffect(() => {
    async function fetchAutomataOptions() {
      
      try {
        setIsLoading(true);
        const options = await getAutomataOptions(userSelectedType);

        console.log("Setting automata options:", options);

        setAutomataOptions(options);
        setSelectedAutomaton("");
        setResult(null);
        setRenderMode("diagram");
      } catch (err) {
        console.error("Failed to fetch automata options:", err.message);
        setAutomataOptions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAutomataOptions();
  }, [userSelectedType]);

  useEffect(() => {
    let timerId;

    if(isLoading){
      timerId = setTimeout(() => {
        setShowLoadingCard(true);
      }, 1500);
    } else {
      setShowLoadingCard(false);
    }

    return () => clearTimeout(timerId);
  }, [isLoading]);

  async function handleRunAutomaton() {
    console.log("Run button clicked");

    if (!hasSelectedType) {
      console.warn("Not running API because selected type is:", userSelectedType);
      return;
    }

    if (!selectedAutomaton) {
      setError("Please select an automaton first.");
      return;
    }

    try {
      setError("");
      setResult(null);


      const data = await runAutomaton(
        userSelectedType,
        selectedAutomaton,
        inputString
      );

      console.log("API result:", data);
      setResult(data);
    } catch (err) {
      console.error("API error:", err.message);
      setError(err.message);
    } finally {
    }
  }

  if (window.location.pathname === "/callback") {
    return <SpotifyCallback />;
  }

  return (
    <>
      <main>
        <VisulazationSelector
          selectedType={userSelectedType}
          onTypeChange={setSelectedType}
          automataOptions={automataOptions}
          selectedAutomaton={selectedAutomaton}
          onAutomatonChange={setSelectedAutomaton}
          stepSpeed={stepSpeed}
          onStepSpeedChange={setStepSpeed}
        />

        {userSelectedType === "dfa" && <div>DFA Visualizer</div>}
        {userSelectedType === "pda" && <div>PDA Visualizer</div>}

        {showLoadingCard && (
          <div className="px-5 mt-3">
            <AlertCard
              title="Intial Fetch:"
              description="The first fetch can take a bit longer(~20 seconds) due to free render server waking up. Thanks for your patience! "
              type="api-response"
            />
          </div>
        )}

        {hasSelectedType && (
          <>
            <div className="d-flex gap-2 align-items-center mt-3 px-5">
              <input
                className="form-control form-control-sm input-string-field"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter input string"
              />

              <button
                className="btn btn-primary btn-sm run-automaton-btn"
                onClick={handleRunAutomaton}
              >
                Run Automaton
              </button>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>

            <div className="container-fluid mt-4 px-0 px-md-5">
              <div className="row g-3">
                <div className={userSelectedType === "pda" ? "col-md-10" : "col-12"}>
                  
                  {userSelectedType === "dfa" && (
                    <div className="d-flex justify-content-end mb-2">
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => setShowMusicMode((currentMode) => !currentMode)}
                      >
                        {showMusicMode ? "Switch to DFA Diagram" : "Switch to Music View"}
                      </button>
                    </div>
                  )}
                  {userSelectedType === "pda" && (
                    <div className="d-flex justify-content-end mb-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          setRenderMode((currentMode) =>
                            currentMode === "diagram" ? "grid" : "diagram"
                          )
                        }
                      >
                        {renderMode === "diagram"
                          ? "Switch to Grid Walk"
                          : "Switch to Diagram"}
                      </button>
                    </div>
                  )}

                  {userSelectedType === "dfa" && showMusicMode ? (
                    <div className="card p-4 shadow-sm text-center">
                      <h5>Music View</h5>

                      <p className="text-muted mb-3">
                        Connect Spotify to control music from this DFA.
                      </p>

                      <SpotifyLoginButton
                        isLoggedIn={!!spotifyToken}
                        onLogout={() => setSpotifyToken(null)}
                      />

                      {spotifyToken && (
                        <div className="text-success small mt-3">
                          Spotify connected
                        </div>
                      )}
                    </div>
                  ) : userSelectedType === "pda" && renderMode === "grid" ? (
                    <PdaGridWalkCanvas
                      result={result}
                      activeStepIndex={activeStepIndex}
                    />
                  ) : (
                    <AnimationCanvas
                      automaton={drawableAutomaton}
                      result={result}
                      activeStepIndex={activeStepIndex}
                    />
                  )}

                  <div className="mt-3">
                    <TracePanel
                      result={result}
                      activeStepIndex={activeStepIndex}
                    />
                  </div>
                </div>

                {userSelectedType === "pda" && (
                  <div className="col-md-2">
                    <StackPanel
                      result={result}
                      activeStepIndex={activeStepIndex}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;