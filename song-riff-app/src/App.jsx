import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; 
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NewRiffPage from './pages/NewRiffPage';
import RiffOffPage from './pages/RiffOffPage';
import HowToPlayPage from './pages/HowToPlayPage';

function App() {
  //'user email' holds the logged in users email, null means they logged out
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  // ---Event Handlers---
  //Called by the login page on successful login
  const handleLogin = (email) => {
    setUserEmail(email);
    navigate('/home'); //redirect to the home page after logging in
  };
// for logout:
  const handleLogout = () => {
    setUserEmail(null);
    navigate('/');
  };
  
  // only show the header if we are not on the login page
  const showHeader = location.pathname !== '/';

  return (
    <div className="app-container">
      {showHeader && <Header userEmail={userEmail} onLogout={handleLogout} />}
      
      {/* Wrap the content in AnimatePresence */}
      <AnimatePresence mode="wait">
        <div className="main-content" key={location.pathname}> {}
          <Routes location={location}> {/* Pass location to Routes */}
            <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/new" element={<NewRiffPage />} />
            <Route path="/riff" element={<RiffOffPage />} />
            <Route path="/how-to" element={<HowToPlayPage />} />
          </Routes>
        </div>
      </AnimatePresence>

    </div>
  );
}

export default App;