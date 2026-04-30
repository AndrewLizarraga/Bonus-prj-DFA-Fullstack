import { useEffect, useMemo, useState } from "react";
import {
  searchSpotifyTracks,
  playSpotifyTrack,
  pauseSpotifyPlayback,
} from "../services/spotifyApi";

const DEFAULT_ARTIST = "Daft Punk";

function DfaMusicController({ accessToken, deviceId, result }) {
  const [artistName] = useState(DEFAULT_ARTIST);
  const [tracks, setTracks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState("Run a DFA to build the music plan.");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [musicPlanIndex, setMusicPlanIndex] = useState(0);

  const steps = result?.steps || [];
  const hasRunDfa = steps.length > 0;

  const neededSongCount = Math.max(steps.length, 1);

  useEffect(() => {
    async function loadArtistTracks() {
      if (!accessToken || !deviceId || !hasRunDfa || isLoaded || isLoadingTracks) {
        return;
      }

      try {
        setIsLoadingTracks(true);
        setStatus(`Loading ${neededSongCount} songs from ${artistName}...`);

        const loadedTracks = await searchSpotifyTracks(
          artistName,
          neededSongCount
        );

        setTracks(loadedTracks);
        setIsLoaded(true);
        setStatus("Songs loaded. Start DFA Music when ready.");
      } catch (err) {
        console.error(err);
        setStatus(err.message);
      } finally {
        setIsLoadingTracks(false);
      }
    }

    loadArtistTracks();
  }, [
    accessToken,
    deviceId,
    hasRunDfa,
    isLoaded,
    isLoadingTracks,
    artistName,
    neededSongCount,
  ]);

  useEffect(() => {
    setTracks([]);
    setIsLoaded(false);
    setIsEnabled(false);
    setCurrentTrack(null);
    setMusicPlanIndex(0);
    setStatus("Run a DFA to build the music plan.");
  }, [result]);

  const musicPlan = useMemo(() => {
  if (!hasRunDfa || tracks.length === 0) {
    return [];
  }

  let songIndex = 0;
  let previousState = null;
  let currentSong = tracks[0];

  return steps.map((step, index) => {
    const currentState = step.state;
    const isFirstStep = index === 0;
    const stateChanged =
      previousState !== null && currentState !== previousState;

    if (isFirstStep) {
      currentSong = tracks[0];
    } else if (stateChanged) {
      songIndex = (songIndex + 1) % tracks.length;
      currentSong = tracks[songIndex];
    }

    previousState = currentState;

    return {
      planIndex: index,
      dfaStep: step.step,
      dfaState: currentState,
      track: currentSong,
      action: isFirstStep
        ? "Start song"
        : stateChanged
        ? "State changed: play next song"
        : "Same state: restart current song",
    };
  });
}, [hasRunDfa, steps, tracks]);

  async function playPlanItem(planItem) {
  if (!planItem?.track) {
    setStatus("No track found for this DFA step.");
    return;
  }

  await playSpotifyTrack({
    accessToken,
    deviceId,
    uri: planItem.track.uri,
  });

  setCurrentTrack(planItem.track);

  setStatus(
    `Step ${planItem.dfaStep} | ${planItem.dfaState}: ${planItem.action} — ${planItem.track.name}`
  );
}

  async function handleStartController() {
    if (!accessToken) {
      setStatus("Connect Spotify first.");
      return;
    }

    if (!deviceId) {
      setStatus("Spotify player device is not ready yet.");
      return;
    }

    if (!hasRunDfa) {
      setStatus("Run the DFA first.");
      return;
    }

    if (!isLoaded) {
      setStatus("Songs are still loading.");
      return;
    }

    if (musicPlan.length === 0) {
      setStatus("No music plan found.");
      return;
    }

    try {
      setIsEnabled(true);
      setMusicPlanIndex(0);
      await playPlanItem(musicPlan[0]);
    } catch (err) {
      console.error(err);
      setStatus(err.message);
    }
  }

  async function handleSkipSong() {
  if (!isEnabled) {
    setStatus("Start DFA Music first.");
    return;
  }

  const nextIndex = musicPlanIndex + 1;

  if (nextIndex >= musicPlan.length) {
    setStatus("End of DFA music plan.");
    return;
  }

  try {
    setMusicPlanIndex(nextIndex);
    await playPlanItem(musicPlan[nextIndex]);
  } catch (err) {
    console.error(err);
    setStatus(err.message);
  }
}

  async function handleStopController() {
    setIsEnabled(false);

    if (!accessToken || !deviceId) {
      setStatus("DFA music stopped.");
      return;
    }

    try {
      setStatus("Stopping DFA music and pausing Spotify...");

      await pauseSpotifyPlayback({
        accessToken,
        deviceId,
      });

      setStatus("DFA music stopped. Spotify paused.");
    } catch (err) {
      console.error(err);
      setStatus(`DFA stopped, but Spotify pause failed: ${err.message}`);
    }
  }

  const currentPlanItem = musicPlan[musicPlanIndex];
  const canStart = hasRunDfa && isLoaded && deviceId && musicPlan.length > 0;
  const canSkip = isEnabled && musicPlanIndex < musicPlan.length - 1;

  return (
    <div className="card p-3 mt-4 text-start">
      <h6 className="text-center">DFA Music Controller</h6>

      <div className="small text-muted mb-3 text-center">
        Artist: <strong>{artistName}</strong>
      </div>

      <div className="small text-muted mb-2">
        DFA Steps: <strong>{steps.length || "N/A"}</strong>
      </div>

      <div className="small text-muted mb-2">
        Songs Loaded: <strong>{tracks.length}</strong>
      </div>

      <div className="small text-muted mb-2">
        Current Music Step:{" "}
        <strong>
          {currentPlanItem ? currentPlanItem.planIndex + 1 : "N/A"}
        </strong>{" "}
        / <strong>{musicPlan.length || "N/A"}</strong>
      </div>

      <div className="small text-muted mb-2">
        DFA Step:{" "}
        <strong>{currentPlanItem ? currentPlanItem.dfaStep : "N/A"}</strong>{" "}
        | DFA State:{" "}
        <strong>{currentPlanItem ? currentPlanItem.dfaState : "N/A"}</strong>
      </div>

      <div className="small text-muted mb-3">
        Action:{" "}
        <strong>{currentPlanItem ? currentPlanItem.action : "N/A"}</strong>
      </div>

      <div className="d-flex gap-2 justify-content-center mb-3 flex-wrap">
        {!isEnabled && (
          <button
            className="btn btn-success btn-sm"
            onClick={handleStartController}
            disabled={!canStart}
          >
            Start DFA Music
          </button>
        )}

        {isEnabled && (
          <>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleStopController}
            >
              Stop DFA Music
            </button>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleSkipSong}
              disabled={!canSkip}
            >
              Skip Song / Next DFA Step
            </button>
          </>
        )}
      </div>

      {currentTrack && (
        <div className="d-flex align-items-center gap-3 border rounded p-2 mb-3">
          {currentTrack.image && (
            <img
              src={currentTrack.image}
              alt={currentTrack.album}
              style={{
                width: "56px",
                height: "56px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />
          )}

          <div>
            <div className="fw-semibold">{currentTrack.name}</div>
            <div className="text-muted small">{currentTrack.artist}</div>
            <div className="text-muted small">{currentTrack.album}</div>
          </div>
        </div>
      )}

      {musicPlan.length > 0 && (
        <div className="border rounded p-2 mb-3 small">
          <div className="fw-semibold mb-2">Planned DFA Music Steps</div>

          {musicPlan.map((item, index) => (
            <div
              key={`${item.dfaStep}-${item.dfaState}-${index}`}
              className={
                index === musicPlanIndex ? "text-success fw-semibold" : ""
              }
            >
              {index + 1}. Step {item.dfaStep} | {item.dfaState} |{" "}
              {item.action}
              {item.track ? ` — ${item.track.name}` : " — No track"}
            </div>
          ))}
        </div>
      )}

      {status && <div className="alert alert-info py-2 mb-0">{status}</div>}
    </div>
  );
}

export default DfaMusicController;