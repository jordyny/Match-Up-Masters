import React from 'react';
import { motion } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import Button from '../components/Button';
import './HomePage.css';

const HomePage = () => {
  return (
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="page-content home-page">
        {/* Navigation buttons */}
        {/* Go to the Timer Select page after Home */}
        <Button to="/timer">New Riff</Button>

        {/* Past Riffs can stay as is or go to a new page later */}
        <Button to="/home">Past Riffs</Button>
      </div>
    </motion.div>
  );
};

export default HomePage;
