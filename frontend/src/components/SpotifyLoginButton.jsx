import { loginWithSpotify, logoutSpotify } from "../services/spotifyAuth";

function SpotifyLoginButton({ isLoggedIn, onLogout }) {
  function handleLogout() {
    logoutSpotify();
    onLogout();
  }

  if (isLoggedIn) {
    return (
      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
        Logout Spotify
      </button>
    );
  }

  return (
    <button className="btn btn-success btn-sm" onClick={loginWithSpotify}>
      Login with Spotify
    </button>
  );
}

export default SpotifyLoginButton;