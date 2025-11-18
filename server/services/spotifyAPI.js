/**
 * Spotify API service.
 *
 * Handles authentication and track search using the Spotify Web API.
 * Uses the Client Credentials flow so no user login is required.
 */

const axios = require('axios');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

/**
 * Get Spotify access token using Client Credentials flow.
 *
 * Caches the token in memory until shortly before it expires to avoid
 * unnecessary authentication requests.
 *
 * @returns {Promise<string>} A valid bearer token for Spotify.
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(
            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
          ).toString('base64')
        }
      }
    );

    accessToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    
    console.log('✓ Spotify access token obtained');
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error.message);
    throw new Error('Failed to authenticate with Spotify');
  }
}

/**
 * Search for a track on Spotify.
 * 
 * @param {string} songTitle - Title of the song.
 * @param {string} artist - Artist name.
 * @returns {Promise<Object|null>} Simplified Spotify track object or null if not found.
 */
async function searchTrack(songTitle, artist) {
  try {
    const token = await getAccessToken();
    
    // Build search query
    const query = `track:${songTitle} artist:${artist}`;
    
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track',
        limit: 1
      }
    });

    const tracks = response.data.tracks.items;
    
    if (tracks.length === 0) {
      console.log(`✗ No Spotify track found for: ${songTitle} by ${artist}`);
      return null;
    }

    const track = tracks[0];
    
    console.log(`✓ Found Spotify track: ${track.name} by ${track.artists[0].name}`);
    
    return {
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      previewUrl: track.preview_url, // 30-second preview MP3 (may be null)
      spotifyUrl: track.external_urls.spotify,
      albumArt: track.album.images[0]?.url || null
    };
  } catch (error) {
    console.error('Error searching Spotify:', error.message);
    return null;
  }
}

module.exports = { searchTrack };
