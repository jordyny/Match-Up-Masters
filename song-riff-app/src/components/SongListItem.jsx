import React from 'react';
import './SongListItem.css';

const SongListItem = ({ title, artist, duration, albumArt }) => {
  return (
    <div className="song-list-item">
      {/* Left side: optional album art + Title and Artist */}
      <div className="song-main">
        {albumArt && (
          <img
            src={albumArt}
            alt={`${title} album art`}
            className="song-album-art"
          />
        )}
        <div className="song-info">
          <span className="song-title">{title}</span>
          <span className="song-artist">{artist}</span>
        </div>
      </div>
      {/* Right side: Duration */}
      <span className="song-duration">{duration}</span>
    </div>
  );
};

export default SongListItem;