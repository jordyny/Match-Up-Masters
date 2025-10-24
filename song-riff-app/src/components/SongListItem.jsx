import React from 'react';
import './SongListItem.css';

const SongListItem = ({ title, artist, duration }) => {
  return (
    <div className="song-list-item">
      {/* Left side: Title and Artist */}
      <div className="song-info">
        <span className="song-title">{title}</span>
        <span className="song-artist">{artist}</span>
      </div>
      {/* Right side: Duration */}
      <span className="song-duration">{duration}</span>
    </div>
  );
};

export default SongListItem;