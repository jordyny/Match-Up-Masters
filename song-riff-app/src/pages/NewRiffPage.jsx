/**
 * New Riff Page Component
 * 
 * Allows users to search for songs and select one to start a riff-off game.
 * Uses service layer for API calls and business logic.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import SongListItem from '../components/SongListItem';
import { searchForSongs, fetchSongWithLyrics } from '../services/lyricsService';
import './NewRiffPage.css';

const NewRiffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handle song search form submission
   * Searches for songs using the lyrics service
   * 
   * @param {Event} e - Form submit event
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const songs = await searchForSongs(searchQuery);
      setSearchResults(songs);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle song selection from search results
   * Fetches lyrics if not already cached, then navigates to riff page
   * 
   * @param {Object} song - Selected song object
   */
const handleSongSelect = async (song) => {
  const duration = parseInt(localStorage.getItem("selectedDuration")) || 60;

  // If lyrics already exist in cache, navigate immediately
  if (songsWithLyrics[song.id]) {
    navigate(`/riff/${song.id}`, { state: { duration } });
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Fetch and save lyrics
    const songWithLyrics = await fetchSongWithLyrics(song);
    setSongsWithLyrics(prev => ({
      ...prev,
      [song.id]: songWithLyrics
    }));

    // Now navigate to riff page with duration included
    navigate(`/riff/${song.id}`, { state: { duration } });

  } catch (err) {
    setError(`Failed to load lyrics: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="page-content new-riff-page">
        <div className="top-section">
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a song (e.g., Hello Adele)"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '1rem',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: '1px solid #444',
                  borderRadius: '8px',
                }}
              />
              <button
                type="submit"
                disabled={!searchQuery.trim() || loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: loading ? '#333' : '#6200ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <p style={{ color: 'tomato', marginBottom: '1rem' }}>{error}</p>
          )}

          {/* Search Results */}
          <h2 className="section-title">
            {searchResults.length > 0 ? 'Search Results' : 'Search for a song to start'}
          </h2>
          
          <div className="song-list">
            {searchResults.length > 0 ? (
              searchResults.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSongSelect(song)}
                  style={{
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <SongListItem
                    title={song.title}
                    artist={song.artist}
                    duration=""
                  />
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                {searchQuery ? 'No results found. Try a different search.' : 'Enter a song name above to search.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewRiffPage;