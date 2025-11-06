/**
 * LyricColumn Component
 * 
 * Displays a single song's lyrics with clickable lines, Spotify player, and selected lyric
 * Follows Single Responsibility Principle - only handles lyric display
 * 
 * @component
 */

import React from 'react';
import SpotifyPlayer from './SpotifyPlayer';

/**
 * LyricColumn component
 * 
 * @param {string} songTitle - Title of the song
 * @param {string} artist - Artist name
 * @param {Array<string>} lyrics - Array of lyric lines
 * @param {number} songId - Song identifier (1 or 2)
 * @param {Function} onLyricClick - Callback when a lyric line is clicked
 * @param {string} selectedLyric - Currently selected lyric line
 * @param {Object} spotify - Spotify track data
 */
const LyricColumn = ({ 
  songTitle, 
  artist, 
  lyrics, 
  songId, 
  onLyricClick, 
  selectedLyric, 
  spotify 
}) => (
  <>
    {/* Selected Lyric Display - above the entire column */}
    {selectedLyric && (
      <div className="selected-lyric-display">
        <p>{selectedLyric}</p>
      </div>
    )}
    <div className="lyric-column">
      <div className="song-header">
        <h3>{songTitle}</h3>
        <p>{artist}</p>
      </div>
      {/* Spotify Player - only shows if Spotify track is available */}
      <SpotifyPlayer spotify={spotify} />
      {lyrics && lyrics.length > 0 ? (
        <div className="lyrics">
          {lyrics.map((line, index) => (
            <p
              key={index}
              className={`lyric-line ${selectedLyric === line ? 'selected' : ''}`}
              onClick={() => onLyricClick(line, songId)}
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <div className="lyrics no-lyrics">
          <p className="no-lyrics-text">Lyrics unavailable for this song.</p>
        </div>
      )}
    </div>
  </>
);

export default LyricColumn;
