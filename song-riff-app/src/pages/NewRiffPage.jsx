
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import SongListItem from '../components/SongListItem';
import './NewRiffPage.css';

const NewRiffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Search for songs using Genius API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:5050/lyrics/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error('Failed to search songs');
      }
      const data = await res.json();
      setSearchResults(data.songs || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lyrics for a selected song and navigate to riff page
  const handleSongSelect = async (song) => {
    // Check if we already have lyrics for this song
    if (songsWithLyrics[song.id]) {
      navigate(`/riff/${song.id}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:5050/lyrics/fetch?url=${encodeURIComponent(song.url)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch lyrics');
      }
      const data = await res.json();
      
      // Split lyrics into lines for the game
      const lyricsLines = data.lyrics.split('\n').filter(line => line.trim());
      
      // Store song with lyrics
      setSongsWithLyrics(prev => ({
        ...prev,
        [song.id]: {
          ...song,
          lyrics: lyricsLines
        }
      }));

      // Navigate to riff page
      navigate(`/riff/${song.id}`);
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