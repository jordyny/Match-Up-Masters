import { getStoredSpotifyAuth, clearSpotifyAuth } from './authService';

function getValidAccessToken() {
  const auth = getStoredSpotifyAuth();
  if (!auth || !auth.accessToken) {
    throw new Error('You must log in with Spotify to view your library.');
  }

  if (auth.expiresAt && Date.now() > auth.expiresAt) {
    clearSpotifyAuth();
    throw new Error('Your Spotify session has expired. Please log in again.');
  }

  return auth.accessToken;
}

export async function fetchLikedTracks(limit = 50, offset = 0) {
  const accessToken = getValidAccessToken();

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(`https://api.spotify.com/v1/me/tracks?${params.toString()}` , {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    clearSpotifyAuth();
    throw new Error('Spotify authorization failed. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Failed to load Spotify library.');
  }

  const data = await response.json();

  return (data.items || []).map((item) => {
    const track = item.track;
    return {
      id: track.id,
      name: track.name,
      artist: (track.artists || []).map((a) => a.name).join(', '),
      albumArt: track.album?.images?.[0]?.url || null,
    };
  });
}
