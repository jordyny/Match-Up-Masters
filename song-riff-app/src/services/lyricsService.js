/**
 * Lyrics Service
 * 
 * Business logic layer for handling song lyrics operations.
 * Follows Single Responsibility Principle - manages lyrics data transformation and storage.
 * 
 * @module lyricsService
 */

import { searchSongs as apiSearchSongs, fetchLyrics as apiFetchLyrics } from './apiService';

/**
 * Parse raw lyrics string into an array of clean lines
 * 
 * @param {string} lyricsText - Raw lyrics text from API
 * @returns {Array<string>} - Array of lyric lines
 */
export function parseLyricsIntoLines(lyricsText) {
  if (!lyricsText) return [];
  
  return lyricsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Create a song object with lyrics for storage
 * 
 * @param {Object} songMetadata - Song metadata (id, title, artist, url)
 * @param {string} lyricsText - Raw lyrics text
 * @returns {Object} - Complete song object with parsed lyrics
 */
export function createSongWithLyrics(songMetadata, lyricsText) {
  return {
    ...songMetadata,
    lyrics: parseLyricsIntoLines(lyricsText)
  };
}

/**
 * Search for songs and return results
 * 
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of song objects
 */
export async function searchForSongs(query) {
  return await apiSearchSongs(query);
}

/**
 * Fetch and prepare a song with its lyrics and Spotify data
 * 
 * @param {Object} song - Song object with at least {id, title, artist, url}
 * @returns {Promise<Object>} - Complete song object with lyrics array and spotify data
 */
export async function fetchSongWithLyrics(song) {
  if (!song || !song.url) {
    throw new Error('Invalid song object - missing URL');
  }
  
  const result = await apiFetchLyrics(song.url, song.title, song.artist);
  
  return {
    ...createSongWithLyrics(song, result.lyrics),
    spotify: result.spotify
  };
}

/**
 * Calculate word similarity between two lyric lines
 * Uses Jaccard similarity coefficient on word tokens
 * 
 * @param {string} line1 - First lyric line
 * @param {string} line2 - Second lyric line
 * @returns {number} - Similarity percentage (0-100)
 */
export function calculateLyricSimilarity(line1, line2) {
  /**
   * Tokenize a line into lowercase words
   * @param {string} text - Text to tokenize
   * @returns {Array<string>} - Array of word tokens
   */
  const tokenize = (text) => {
    if (!text) return [];
    return (text.match(/[A-Za-z0-9']+/g) || []).map(word => word.toLowerCase());
  };
  
  const words1 = new Set(tokenize(line1));
  const words2 = new Set(tokenize(line2));
  
  // Handle edge cases
  if (words1.size === 0 && words2.size === 0) return 100;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  // Calculate intersection
  let commonWords = 0;
  for (const word of words1) {
    if (words2.has(word)) commonWords++;
  }
  
  // Jaccard similarity: intersection / max(set1, set2)
  const denominator = Math.max(words1.size, words2.size);
  return Math.round((commonWords / denominator) * 100);
}

/**
 * Get color classification based on similarity percentage
 * 
 * @param {number} similarity - Similarity percentage (0-100)
 * @returns {string} - Color class name
 */
export function getSimilarityColor(similarity) {
  if (similarity == null) return 'neutral';
  if (similarity <= 25) return 'red';
  if (similarity <= 50) return 'orange';
  if (similarity <= 75) return 'yellow';
  return 'green';
}
