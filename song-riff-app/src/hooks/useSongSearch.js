/**
 * Custom Hook: useSongSearch
 * 
 * Manages song search state and operations
 * Follows Single Responsibility Principle - handles only search logic
 * 
 * @returns {Object} Search state and handlers
 */

import { useState } from 'react';
import { searchForSongs, fetchSongWithLyrics } from '../services/lyricsService';

export const useSongSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Search for songs by query
   */
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const songs = await searchForSongs(searchQuery);
      setSearchResults(songs);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select a song and fetch its lyrics
   */
  const selectSong = async (song, songsWithLyrics, setSongsWithLyrics) => {
    // Check if we already have lyrics cached
    if (songsWithLyrics[song.id]) {
      return song.id;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch and parse lyrics
      const songWithLyrics = await fetchSongWithLyrics(song);
      
      // Store song with lyrics in app state
      setSongsWithLyrics(prev => ({
        ...prev,
        [song.id]: songWithLyrics
      }));

      return song.id;
    } catch (err) {
      setError(`Failed to load lyrics: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset search state
   */
  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  return {
    // State
    searchQuery,
    searchResults,
    isLoading,
    error,
    
    // Actions
    setSearchQuery,
    handleSearch,
    selectSong,
    resetSearch,
  };
};
