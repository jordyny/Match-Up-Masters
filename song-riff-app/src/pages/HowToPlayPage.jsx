import React from 'react';
import { pageVariants, pageTransition } from '../pageAnimations';
import './HowToPlayPage.css';

const HowToPlayPage = () => {
  return (
    <motion.div
      className="page-container"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="page-content how-to-page">
        <h2 className="how-to-title">How to Play</h2>
        <div className="info-box">
          <ol className="info-list">
            <li>Start a new game and pick your first song.</li>
            <li>While the lyrics display, select any lyric line within the time limit.</li>
            <li>Search for a second song and find a lyric that shares at least one word with your last selection.</li>
            <li>Select that matching lyric to chain the riff.</li>
            <li>Repeat: each new lyric must share a word with the immediately previous lyric.</li>
          </ol>
          <div className="info-notes">
            <p><strong>Goal:</strong> Build the longest chain you can.</p>
            <p><strong>Tip:</strong> Common words (like “love”, “night”) help extend your streak.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToPlayPage;


