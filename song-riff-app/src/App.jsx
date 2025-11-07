/**
 * App Component
 * 
 * Root component that manages global state and routing.
 * Follows Open/Closed Principle - open for extension via routes, closed for modification.
 * 
 * @component
 */

import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; 
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NewRiffPage from './pages/NewRiffPage';
import RiffOffPage from './pages/RiffOffPage';
import HowToPlayPage from './pages/HowToPlayPage';
import TimerSelectPage from './pages/TimerSelectPage';
import GameOverPage from './pages/GameOverPage';

function App() {
  // Authentication state - stores logged in user's email
  const [userEmail, setUserEmail] = useState(null);
  
  // Global song cache - stores songs with their fetched lyrics
  // Structure: { [songId]: { id, title, artist, url, lyrics: [] } }
  const [songsWithLyrics, setSongsWithLyrics] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation(); 

  /**
   * Handle successful user login
   * Sets user email and redirects to home page
   * 
   * @param {string} email - User's email address
   */
  const handleLogin = (email) => {
    setUserEmail(email);
    navigate('/home');
  };
  
  /**
   * Handle user logout
   * Clears user email and redirects to login page
   */
  const handleLogout = () => {
    setUserEmail(null);
    navigate('/');
  };
  
  // Conditionally show header (hide on login page)
  const showHeader = location.pathname !== '/';

  return (
    <div className="app-container">
      {showHeader && <Header userEmail={userEmail} onLogout={handleLogout} />}
      
      {/* Wrap the content in AnimatePresence */}
      <AnimatePresence mode="wait">
        <div className="main-content" key={location.pathname}> {}
    <Routes location={location}>
      <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/home" element={<HomePage />} />
      <Route 
        path="/new" 
        element={<NewRiffPage songsWithLyrics={songsWithLyrics} setSongsWithLyrics={setSongsWithLyrics} />} 
      />
      <Route path="/timer" element={<TimerSelectPage />} />  {/* <-- keep your new route */}
      <Route 
        path="/riff/:id" 
        element={<RiffOffPage songsWithLyrics={songsWithLyrics} setSongsWithLyrics={setSongsWithLyrics} />} 
      />
      <Route path="/how-to" element={<HowToPlayPage />} />
      <Route path="/gameover" element={<GameOverPage />} />
    </Routes>

        </div>
      </AnimatePresence>

    </div>
  );
}

export default App;