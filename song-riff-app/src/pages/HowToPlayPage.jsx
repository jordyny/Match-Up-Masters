import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageVariants, pageTransition } from '../pageAnimations';
import './HowToPlayPage.css';

const HowToPlayPage = () => {
  const navigate = useNavigate();

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
            <li>Search for a second song and find a lyric phrase that shares at least one word with your last selection.</li>
            <li>Select that matching lyric to chain the riff.</li>
            <li> Based on the percentage similarity between the previous phrase and the phrase from the new song you click, points will be added to your score. </li>
            <li>Repeat: each new lyric must share a word with the immediately previous lyric.</li>
            <li> A final summary will popup after, and you can go to the scoreboard from there to check out the highest scores!</li>
          </ol>
          <div className="info-notes">
            <p><strong>Goal:</strong> Build the longest chain you can.</p>
            <p><strong>Tip:</strong> Common words (like “love”, “night”) help extend your streak.</p>
          </div>

          {/* Continue button using same HomePage custom-button styling */}
          <button
            className="circle-button"
            onClick={() => navigate('/home')}
          >
            →
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default HowToPlayPage;
