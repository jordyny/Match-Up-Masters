import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import Button from '../components/Button';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    if (email && password) {
      onLogin(email);
    } else {
      
      alert("Please enter both email and password.");
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
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <Button primary type="submit">
          Log In
        </Button>
      </form>
    </div>
    </motion.div>
  );
};

export default LoginPage;