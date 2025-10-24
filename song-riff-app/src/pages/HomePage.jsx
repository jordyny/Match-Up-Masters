import React from 'react';
import { motion } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import Button from '../components/Button';
import './HomePage.css';

const HomePage = () => {
  return (
    // for animation
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
      <Button to="/new">New Riff</Button>
      <Button to="/home">Past Riffs</Button>
    </div>
    </motion.div>
  );
};

export default HomePage;
