import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import { handleSpotifyCallback } from '../services/authService';
import './LoginPage.css';

const SpotifyCallbackPage = ({ onLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const hasHandledRef = useRef(false);

  useEffect(() => {
    console.log('[SpotifyCallback] Effect run', {
      search: location.search,
      hasHandled: hasHandledRef.current,
    });

    if (hasHandledRef.current) {
      console.log('[SpotifyCallback] Already handled this callback, skipping');
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Spotify authorization was cancelled or denied.');
      return;
    }

    if (!code) {
      setError('Missing authorization code from Spotify.');
      return;
    }

    let isMounted = true;

    hasHandledRef.current = true;
    console.log('[SpotifyCallback] Handling Spotify callback with code', code ? code.substring(0, 10) + '...' : null);

       (async () => {
      try {
        const auth = await handleSpotifyCallback(code);
        if (!isMounted) return;
        if (auth && auth.profile && onLogin) {
          const email = auth.profile.email || '';
          onLogin(email);
        }
        console.log('[SpotifyCallback] Navigating to /home');
        navigate('/home', { replace: true });
        // Hard redirect fallback to ensure we leave the callback page
        window.location.assign('/home');
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to complete Spotify login.');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate, onLogin]);

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
        <h1 className="title">Connecting to Spotify...</h1>
        {error && <p className="error-message">{error}</p>}
      </div>
    </motion.div>
  );
};

export default SpotifyCallbackPage;
