/**
 * API Service
 * 
 * Centralized service for all API communication with the backend.
 * Follows Single Responsibility Principle - handles only API requests.
 * 
 * @module apiService
 */

const API_BASE_URL = 'http://localhost:5050';

/**
 * Generic fetch wrapper with error handling
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {Error} - If the request fails
 */
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Re-throw with more context if needed
    throw new Error(`API Error: ${error.message}`);
  }
}

/**
 * Search for songs using a query string
 * 
 * @param {string} query - Search query (e.g., "Hello Adele")
 * @returns {Promise<Array>} - Array of song objects
 */
export async function searchSongs(query) {
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }
  
  const url = `${API_BASE_URL}/lyrics/search?q=${encodeURIComponent(query)}`;
  const data = await fetchWithErrorHandling(url);
  
  return data.songs || [];
}

/**
 * Fetch lyrics for a specific song by URL
 * 
 * @param {string} songUrl - The Genius URL for the song
 * @param {string} title - Song title (optional, for Spotify search)
 * @param {string} artist - Artist name (optional, for Spotify search)
 * @returns {Promise<Object>} - Object with lyrics and spotify data
 */
export async function fetchLyrics(songUrl, title = '', artist = '') {
  if (!songUrl) {
    throw new Error('Song URL is required');
  }
  
  let url = `${API_BASE_URL}/lyrics/fetch?url=${encodeURIComponent(songUrl)}`;
  if (title) url += `&title=${encodeURIComponent(title)}`;
  if (artist) url += `&artist=${encodeURIComponent(artist)}`;
  
  const data = await fetchWithErrorHandling(url);
  
  return {
    lyrics: data.lyrics || '',
    spotify: data.spotify || null
  };
}

/**
 * Search for a song and get its lyrics in one call
 * (Legacy endpoint - prefer using searchSongs + fetchLyrics separately)
 * 
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Object with title and lyrics
 */
export async function searchAndFetchLyrics(query) {
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }
  
  const url = `${API_BASE_URL}/lyrics?q=${encodeURIComponent(query)}`;
  return await fetchWithErrorHandling(url);
}
