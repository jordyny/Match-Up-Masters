import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const GameOverPage = () => {
  const { state } = useLocation();
  const finalScore = state?.totalScore ?? 0;
  const navigate = useNavigate();

  const goToScoreboard = () => {
    navigate('/scoreboard');
  };

  return (
    <div style={{ textAlign: "center", color: "white", marginTop: "150px" }}>
      <h1>🎉 Game Over!</h1>
      <h2>Your Final Score: {finalScore}</h2>

      <button 
        onClick={goToScoreboard}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer"
        }}
      >
        View Scoreboard
      </button>
    </div>
  );
};

export default GameOverPage;
