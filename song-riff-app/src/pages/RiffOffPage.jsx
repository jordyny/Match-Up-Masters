import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import { lyrics } from '../mockData';
import Scoreboard from '../components/Scoreboard';


import './RiffOffPage.css';
// --- Sub-component for displaying a single song's lyrics ---
// 'songId' (1 or 2) and 'onLyricClick' (a function) are passed down
const LyricColumn = ({ songTitle, artist, lyrics, songId, onLyricClick }) => (
  <div className="lyric-column">
    <div className="song-header">
      <h3>{songTitle}</h3>
      <p>{artist}</p>
    </div>
    <div className="lyrics">
      {lyrics.map((line, index) => (
        <p
          key={index}
          className="lyric-line"
          // Call the handler function when a lyric is clicked
          onClick={() => onLyricClick(line, songId)}
        >
          {line}
        </p>
      ))}
    </div>
  </div>
);

// --- Main RiffOffPage Component ---
const RiffOffPage = () => {
  const [selectedLyric1, setSelectedLyric1] = useState(null);
  const [selectedLyric2, setSelectedLyric2] = useState(null);
// Event handler for clicking a lyric
  const handleLyricClick = (lyric, songId) => {
    if (songId === 1) {
      setSelectedLyric1(lyric);
    } else if (songId === 2) {
      setSelectedLyric2(lyric);
    }
  };
  // Event handler for the "Clear" button
  const clearSelection = () => {
    setSelectedLyric1(null);
    setSelectedLyric2(null);
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

      <Scoreboard score={0} />
    <div className="page-content riff-off-page">

      {/* --- for future add save button --- */}
      <Link to="/home" className="floating-save-button">
        Save
      </Link>

        {/* Page Header (Back arrow and Title) */}
      <div className="riff-header">
        <Link to="/new" className="back-link">←</Link>
        <h2>Tik Tok & Die Young</h2>
      </div>
{/* Chosen Lyrics Box (Translucent) */}
      <div className="chosen-lyrics-box">
        <div className="chosen-header">
          <h3>Chosen Lyrics</h3>
          <button onClick={clearSelection} className="clear-button">
            Clear
          </button>
        </div>
        <div className="chosen-lyrics-content">
          <p className="chosen-lyric">
            {selectedLyric1 || 'Select a lyric from song 1...'}
          </p>
          <p className="chosen-lyric">
            {selectedLyric2 || 'Select a lyric from song 2...'}
          </p>
        </div>
      </div>
     {/* Container for the two lyric columns, note I hardcoded these for demo purposes */}
      <div className="riff-container">
        <LyricColumn
          songTitle="Tik Tok"
          artist="Kesha"
          lyrics={lyrics['Tik Tok']}
          songId={1}
          onLyricClick={handleLyricClick}
        />
        <LyricColumn
          songTitle="Die Young"
          artist="Kesha"
          lyrics={lyrics['Die Young']}
          songId={2}
          onLyricClick={handleLyricClick}
        />
      </div>
    </div>
    </motion.div>
  );
};

export default RiffOffPage;