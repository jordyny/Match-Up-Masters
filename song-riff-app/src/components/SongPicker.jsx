/**
 * SongPicker Component
 * 
 * Displays song search interface for selecting a new song
 * Follows Single Responsibility Principle - only handles song picker UI
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import SongListItem from './SongListItem';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchLikedTracks } from '../services/spotifyUserService';
import { searchForSongs } from '../services/lyricsService';

/**
 * SongPicker component
 * 
 * @param {string} searchQuery - Current search query
 * @param {Function} onSearchQueryChange - Handler for search query changes
 * @param {Function} onSearch - Handler for search submission
 * @param {Array} searchResults - Array of search results
 * @param {boolean} isLoading - Loading state
 * @param {string} error - Error message
 * @param {Function} onSongSelect - Handler for song selection
 * @param {Object} songsWithLyrics - Previously loaded songs
 * @param {string} excludeSongId - Song ID to exclude from results
 */
const SongPicker = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchResults,
  isLoading,
  error,
  onSongSelect,
  songsWithLyrics,
  excludeSongId
}) => {
  const [dots, setDots] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [libraryTracks, setLibraryTracks] = useState([]);
  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(id);
  }, [isLoading]);
  // Filter out the left song from previously loaded songs
  const previouslyLoadedSongs = Object.values(songsWithLyrics)
    .filter(s => s.id !== excludeSongId);

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

  const handleLibrarySongSelect = async (track) => {
    setLibraryError('');

    try {
      const query = `${track.name} ${track.artist}`;
      const songs = await searchForSongs(query);

      if (!songs || songs.length === 0) {
        setLibraryError('Could not find lyrics for this Spotify track. Try a different one.');
        return;
      }

      // Use the top Genius result to start the game via parent handler
      onSongSelect(songs[0]);
    } catch (err) {
      setLibraryError(err.message);
    }
  };

  return (
    <div className="mini-search">
      <div className="mini-search-inner">
        {/* Search Form */}
        <form onSubmit={onSearch} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search for a song..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.9rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                backgroundColor: isLoading ? '#333' : '#6200ea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isLoading ? `Searching${dots}` : 'Search'}
            </button>
          </div>
          {error && (
            <p style={{ color: 'tomato', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>
          )}
        </form>

        {/* Spotify Library Toggle */}
        <div style={{ borderBottom: '1px solid #333' }}>
          <button
            type="button"
            onClick={handleToggleLibrary}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'white',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {showLibrary ? 'Hide Spotify Library' : 'Choose from Spotify Library'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {showLibrary ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </button>

          {showLibrary && (
            <div style={{ padding: '0.5rem 1rem' }}>
              {libraryLoading && (
                <p style={{ color: '#888', fontSize: '0.85rem' }}>Loading your liked songs...</p>
              )}
              {libraryError && (
                <p style={{ color: 'tomato', marginTop: '0.25rem', fontSize: '0.85rem' }}>{libraryError}</p>
              )}
              {!libraryLoading && !libraryError && libraryTracks.length === 0 && (
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                  No liked songs found in your Spotify library.
                </p>
              )}
              {!libraryLoading && libraryTracks.length > 0 && (
                <div className="song-list" style={{ marginTop: '0.5rem' }}>
                  {libraryTracks.map((track) => (
                    <div
                      key={track.id}
                      className="mini-song-item"
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

        <div className="mini-song-list">
          {/* Show search results */}
          {searchResults.length > 0 ? (
            <>
              <p style={{ padding: '0.5rem 1rem', color: '#888', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Search Results:
              </p>
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className="mini-song-item"
                  onClick={() => onSongSelect(song)}
                  style={{
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <SongListItem
                    title={song.title}
                    artist={song.artist}
                    albumArt={song.albumArt}
                    duration=""
                  />
                </div>
              ))}
            </>
          ) : null}

          {/* Show previously loaded songs */}
          {previouslyLoadedSongs.length > 0 && (
            <>
              <p style={{ 
                padding: '0.5rem 1rem', 
                color: '#888', 
                fontSize: '0.85rem', 
                fontWeight: 'bold', 
                marginTop: searchResults.length > 0 ? '1rem' : '0' 
              }}>
                Previously Loaded Songs:
              </p>
              {previouslyLoadedSongs.map((song) => (
                <div
                  key={song.id}
                  className="mini-song-item"
                  onClick={() => onSongSelect(song)}
                  style={{
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <SongListItem
                    title={song.title}
                    artist={song.artist}
                    albumArt={song.spotify?.albumArt}
                    duration=""
                  />
                </div>
              ))}
            </>
          )}

          {/* Show message if no results and no previously loaded songs */}
          {searchResults.length === 0 && previouslyLoadedSongs.length === 0 && (
            <p style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888' }}>
              Search for a song above to add it to the riff
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongPicker;
