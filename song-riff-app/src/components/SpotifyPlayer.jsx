/**
 * Spotify Player Component
 * 
 * Displays an embedded Spotify player for song previews.
 * Shows a message if no preview is available.
 * 
 * @component
 */

import React from 'react';
import './SpotifyPlayer.css';

/**
 * SpotifyPlayer component
 * 
 * @param {Object} spotify - Spotify track data with id
 */
const SpotifyPlayer = ({ spotify }) => {
  // If no Spotify data is available, show unavailable message
  if (!spotify || !spotify.id) {
    return (
      <div className="spotify-unavailable">
        <p>No Spotify preview available</p>
      </div>
    );
  }

  return (
    <div className="spotify-player-container">
      <iframe
        style={{
          borderRadius: '12px'
        }}
        src={`https://open.spotify.com/embed/track/${spotify.id}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Spotify player for ${spotify.name}`}
      />
    </div>
  );
};

export default SpotifyPlayer;
