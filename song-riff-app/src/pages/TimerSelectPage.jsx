import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import './TimerSelectPage.css';

const TimerSelectPage = () => {
  const navigate = useNavigate();

  const handleSelect = (time) => {
    // store chosen time in localStorage so RiffOffPage can access it
    localStorage.setItem('riffTimer', time);
    navigate('/riff/1'); // navigate to the game 
  };

  return (
    <motion.div
      className="timer-select-container"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <h2 className="timer-title">⏱️ Choose Your Challenge</h2>
      <div className="timer-options">
        <button className="timer-btn easy" onClick={() => handleSelect(120)}>
          Easy (2 minutes)
        </button>
        <button className="timer-btn medium" onClick={() => handleSelect(60)}>
          Medium (1 minute)
        </button>
        <button className="timer-btn hard" onClick={() => handleSelect(30)}>
          Hard (30 seconds)
        </button>
      </div>
    </motion.div>
  );
};

export default TimerSelectPage;
