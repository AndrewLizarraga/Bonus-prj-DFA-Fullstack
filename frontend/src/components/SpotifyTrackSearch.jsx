import { useState } from "react";
import { searchSpotifyTracks, playSpotifyTrack } from "../services/spotifyApi";

function SpotifyTrackSearch({ accessToken, deviceId }) {
  const [query, setQuery] = useState("Daft Punk");
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch() {
    try {
      setStatus("");
      setIsSearching(true);

      const results = await searchSpotifyTracks(query, 5);
      setTracks(results);
    } catch (err) {
      console.error(err);
      setStatus(err.message);
    } finally {
      setIsSearching(false);
    }
  }

  async function handlePlay(track) {
    if (!accessToken) {
      setStatus("Missing Spotify access token.");
      return;
    }

    if (!deviceId) {
      setStatus("Spotify device is not ready yet.");
      return;
    }

    try {
      setStatus(`Playing ${track.name}...`);

      await playSpotifyTrack({
        accessToken,
        deviceId,
        uri: track.uri,
      });

      setStatus(`Now playing: ${track.name}`);
    } catch (err) {
      console.error(err);
      setStatus(err.message);
    }
  }

  return (
    <div className="mt-4 text-start">
      <h6 className="text-center">Search Spotify Tracks</h6>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song"
        />

        <button
          className="btn btn-success btn-sm"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      {status && <div className="alert alert-info py-2">{status}</div>}

      <div className="d-flex flex-column gap-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="card p-2 d-flex flex-row align-items-center gap-3"
          >
            {track.image && (
              <img
                src={track.image}
                alt={track.album}
                style={{
                  width: "56px",
                  height: "56px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}

            <div className="flex-grow-1">
              <div className="fw-semibold">{track.name}</div>
              <div className="text-muted small">{track.artist}</div>
              <div className="text-muted small">{track.album}</div>
            </div>

            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => handlePlay(track)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpotifyTrackSearch;