const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("Spotify API_BASE_URL:", API_BASE_URL);

export async function searchSpotifyTracks(query, limit = 5) {
  const response = await fetch(
    `${API_BASE_URL}/spotify/search-tracks?q=${encodeURIComponent(query)}&limit=${limit}`
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Failed to search Spotify tracks");
  }

  return data.tracks;
}

export async function playSpotifyTrack({ accessToken, deviceId, uri }) {
  const response = await fetch(`${API_BASE_URL}/spotify/play`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
      device_id: deviceId,
      uri,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Failed to play Spotify track");
  }

  return data;
}