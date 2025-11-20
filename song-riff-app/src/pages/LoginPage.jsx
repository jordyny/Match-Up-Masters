import React from 'react';
import { motion } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import Button from '../components/Button';
import { startSpotifyLogin } from '../services/authService';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const handleSpotifyLogin = () => {
    startSpotifyLogin().catch((error) => {
      alert(error.message || 'Failed to start Spotify login.');
    });
  };

  const handleContinueWithoutSpotify = () => {
    if (onLogin) {
      onLogin('Guest');
    }
  };

  return (
    //This motion div wrapper enables the blur animation between pages
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
    <div className="page-content">
      <h1 className="title">Song Riff Off</h1>
      
      {/* Login form */}
      <div className="login-form">
        <Button primary type="button" onClick={handleSpotifyLogin}>
          Log in with Spotify
        </Button>
        <Button type="button" onClick={handleContinueWithoutSpotify}>
          Continue without Spotify
        </Button>
      </div>
    </div>
    </motion.div>
  );
};

export default LoginPage;