import React from 'react';
import { pageVariants, pageTransition } from '../pageAnimations';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TimerSelectPage.css';

const TimerSelectPage = () => {
const navigate = useNavigate();

  // Handle timer selection
const handleSelect = (seconds) => {
  sessionStorage.setItem('riff_duration', seconds); // ✅ store selection
  navigate('/riff/1', { state: { duration: seconds } });
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
      <div className="timer-select-container">
        <h2 className="timer-title">Choose Your Challenge</h2>

        <div className="timer-options">
          <button className="timer-btn pro" onClick={() => handleSelect(300)}>
            5 Minutes (Super Easy)
          </button>
          <button className="timer-btn easy" onClick={() => handleSelect(120)}>
            2 Minutes (Easy)
          </button>
          <button className="timer-btn medium" onClick={() => handleSelect(60)}>
            1 Minute (Medium)
          </button>
          <button className="timer-btn hard" onClick={() => handleSelect(30)}>
            30 Seconds (Hard)
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TimerSelectPage;
