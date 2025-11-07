// src/pages/GameOverPage.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";

const GameOverPage = () => {
  const location = useLocation();
  const { totalScore = 0 } = location.state || {}; // get score passed from RiffOffPage

  return (
    <div style={{ 
      textAlign: "center", 
      color: "white", 
      marginTop: "150px"
    }}>
      <h1>🎉 Game Over!</h1>
      <h2>Your Final Score: {totalScore}</h2>

      <div style={{ marginTop: "30px" }}>
        <Link to="/home" style={{ 
          padding: "10px 20px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "8px",
          color: "white",
          textDecoration: "none",
          marginRight: "15px"
        }}>
          Back to Home
        </Link>

        <Link to="/timer" style={{ 
          padding: "10px 20px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "8px",
          color: "white",
          textDecoration: "none"
        }}>
          Play Again
        </Link>

        <Link to="/scoreboard" style={{ 
          padding: "10px 20px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "8px",
          color: "white",
          textDecoration: "none",
          marginLeft: "15px"
        }}>
          View Scoreboard
        </Link>
      </div>
    </div>
  );
};

export default GameOverPage;
