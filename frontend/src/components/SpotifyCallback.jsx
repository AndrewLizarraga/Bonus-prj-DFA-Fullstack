import { useEffect, useState } from "react";
import { exchangeCodeForToken } from "../services/spotifyAuth";

function SpotifyCallback() {
  const [status, setStatus] = useState("Connecting to Spotify...");

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          setStatus(`Spotify login failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus("No Spotify code found in callback URL.");
          return;
        }

        await exchangeCodeForToken(code);

        setStatus("Spotify login successful. Redirecting...");

        window.history.replaceState({}, document.title, "/");
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        setStatus(err.message);
      }
    }

    handleCallback();
  }, []);

  return (
    <main className="container py-5 text-center">
      <div className="card p-4 shadow-sm">
        <h3>Spotify Callback</h3>
        <p>{status}</p>
      </div>
    </main>
  );
}

export default SpotifyCallback;