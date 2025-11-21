/**
 * New Riff Page Component
 * 
 * Allows users to search for songs and select one to start a riff-off game.
 * Uses service layer for API calls and business logic.
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import SongListItem from '../components/SongListItem';
import { searchForSongs, fetchSongWithLyrics } from '../services/lyricsService';
import { fetchLikedTracks } from '../services/spotifyUserService';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './NewRiffPage.css';

const NewRiffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  // Component state for search input, results, loading feedback, and error display
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [libraryTracks, setLibraryTracks] = useState([]);
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  // Animate trailing dots in the "Searching" label while an API request is in flight
  useEffect(() => {
    if (!loading) {
      setDots('');
      return;
    }
    const id = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(id);
  }, [loading]);

  /**
   * Handle song search form submission
   * Searches for songs using the lyrics service
   * 
   * @param {Event} e - Form submit event
   */
  // Submit handler that calls the lyrics service to search songs by query
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

  const loadSpotifyLibrary = async () => {
    setLibraryLoading(true);
    setLibraryError('');

    try {
      const tracks = await fetchLikedTracks(50, 0);
      setLibraryTracks(tracks);
    } catch (err) {
      setLibraryError(err.message);
      setLibraryTracks([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleToggleLibrary = () => {
    const next = !showLibrary;
    setShowLibrary(next);
    if (next && libraryTracks.length === 0 && !libraryLoading) {
      loadSpotifyLibrary();
    }
  };

  /**
   * Handle song selection from search results
   * Fetches lyrics if not already cached, then navigates to riff page
   * 
   * @param {Object} song - Selected song object
   */
  // When a song is chosen from results, ensure lyrics are loaded and cache them before navigating
  const handleSongSelect = async (song) => {
    // Check if we already have lyrics for this song (avoid redundant API calls)
    if (songsWithLyrics[song.id]) {
      navigate(`/riff/${song.id}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch and parse lyrics using service layer
      const songWithLyrics = await fetchSongWithLyrics(song);
      
      // Store song with lyrics in app state
      setSongsWithLyrics(prev => ({
        ...prev,
        [song.id]: songWithLyrics
      }));

      // Navigate to riff page with this song
      navigate(`/riff/${song.id}`);
    } catch (err) {
      setError(`Failed to load lyrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLibrarySongSelect = async (track) => {
    // Use Genius search to find a matching song for the selected Spotify track
    setLibraryError('');
    setError('');
    setLibraryLoading(true);

    try {
      const query = `${track.name} ${track.artist}`;
      const songs = await searchForSongs(query);

      if (!songs || songs.length === 0) {
        setLibraryError('Could not find lyrics for this Spotify track. Try a different one.');
        return;
      }

      // Use the top Genius result to start the game via existing flow
      await handleSongSelect(songs[0]);
    } catch (err) {
      setLibraryError(err.message);
    } finally {
      setLibraryLoading(false);
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
      {/* Main container for the search form and results list */}
      <div className="page-content new-riff-page">
        <div className="top-section">
          {/* Page title and Search Form */}
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            Search for a song to start
          </h2>
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
                {loading ? `Searching${dots}` : 'Search'}
              </button>
            </div>
          </form>

          {/* Spotify Library Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={handleToggleLibrary}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #444',
                backgroundColor: '#111',
                color: 'white',
                textAlign: 'left',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {showLibrary ? 'Hide Spotify Library' : 'Start game from Spotify Library'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {showLibrary ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </button>

            {showLibrary && (
              <div style={{ marginTop: '0.75rem' }}>
                {libraryLoading && (
                  <p style={{ color: '#888' }}>Loading your liked songs...</p>
                )}
                {libraryError && (
                  <p style={{ color: 'tomato', marginTop: '0.5rem' }}>{libraryError}</p>
                )}
                {!libraryLoading && !libraryError && libraryTracks.length === 0 && (
                  <p style={{ color: '#888' }}>
                    No liked songs found in your Spotify library.
                  </p>
                )}
                {!libraryLoading && libraryTracks.length > 0 && (
                  <div className="song-list" style={{ marginTop: '0.5rem' }}>
                    {libraryTracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => handleLibrarySongSelect(track)}
                        style={{
                          cursor: libraryLoading ? 'wait' : 'pointer',
                          opacity: libraryLoading ? 0.6 : 1,
                        }}
                      >
                        <SongListItem
                          title={track.name}
                          artist={track.artist}
                          albumArt={track.albumArt}
                          duration=""
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p style={{ color: 'tomato', marginBottom: '1rem' }}>{error}</p>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <h2 className="section-title">
              Search Results
            </h2>
          )}
          
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