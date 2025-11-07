/**
 * SongPicker Component
 * 
 * Displays song search interface for selecting a new song
 * Follows Single Responsibility Principle - only handles song picker UI
 * 
 * @component
 */

import React from 'react';
import SongListItem from './SongListItem';

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
  // Filter out the left song from previously loaded songs
  const previouslyLoadedSongs = Object.values(songsWithLyrics)
    .filter(s => s.id !== excludeSongId);

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
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p style={{ color: 'tomato', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>
          )}
        </form>

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
                  <SongListItem title={song.title} artist={song.artist} duration="" />
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
                  <SongListItem title={song.title} artist={song.artist} duration="" />
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
