import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import { Link } from 'react-router-dom';
import './PastRiffsPage.css';

const PastRiffsPage = () => {
  const [pastRiffs, setPastRiffs] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pastRiffs')) || [];
    setPastRiffs(stored.reverse()); // Newest first
  }, []);

  return (
    <motion.div
      className="page-container"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="page-content">
        <h2>Past Riffs</h2>
        <Link to="/home" className="back-link">← Back</Link>

        {pastRiffs.length === 0 ? (
          <p>No past riffs yet.</p>
        ) : (
          <div className="riffs-list">
            {pastRiffs.map((riff, index) => (
              <div key={index} className="riff-card">
                {/* ✅ Show list of songs instead of "Song1 vs Song2" */}
                <h4>🎵 {riff.songs}</h4>

                {/* ✅ Show score */}
                <p><strong>Score:</strong> {riff.score}</p>

                {/* ✅ Show when it happened */}
                <p className="date">{new Date(riff.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PastRiffsPage;
