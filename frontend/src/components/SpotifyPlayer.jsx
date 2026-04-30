import { useEffect, useState } from "react";

function SpotifyPlayer({ accessToken, onDeviceReady }) {
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("Loading Spotify player...");

  useEffect(() => {
    if (!accessToken) return;

    const scriptId = "spotify-player-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "DFA Music Controller",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

        player.addListener("ready", ({ device_id }) => {
            console.log("Spotify device ready:", device_id);
            setDeviceId(device_id);
            setPlayerReady(true);
            setStatus("Spotify player ready.");
            onDeviceReady(device_id);
            if (onDeviceReady) {
                onDeviceReady(device_id);
            }
        });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Spotify device offline:", device_id);
        setPlayerReady(false);
        setStatus("Spotify player went offline.");
      });

      player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
        setStatus(`Initialization error: ${message}`);
      });

      player.addListener("authentication_error", ({ message }) => {
  console.error("Authentication error:", message);

  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_code_verifier");

  setPlayerReady(false);
  setDeviceId("");
  setStatus("Spotify session expired. Please log in again.");

  if (onDeviceReady) {
    onDeviceReady("");
  }
});

      player.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
        setStatus(`Account error: ${message}`);
      });

      player.connect();
    };
  }, [accessToken]);

  return (
    <div className="mt-3">
      <p className={playerReady ? "text-success" : "text-muted"}>{status}</p>

      {deviceId && (
        <p className="small text-muted">
          Device ID: <code>{deviceId}</code>
        </p>
      )}
    </div>
  );
}

export default SpotifyPlayer;