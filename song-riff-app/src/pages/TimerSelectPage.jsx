import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import { useNavigate, useParams } from 'react-router-dom';
import './TimerSelectPage.css';

const TimerSelectPage = () => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState(null); // ✅ store selected time

  const { id } = useParams(); // Example: id = "2332455"

  const handleSelect = (time) => {
    localStorage.setItem("selectedDuration", time); // ✅ Store timer globally
    navigate('/new'); // go to song selection
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
