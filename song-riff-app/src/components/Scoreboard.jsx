/**
 * Scoreboard Component
 * 
 * Displays a the score of a riff game including the current score and high score.
 * 
 * @component
 */

import React from "react";
import "./Scoreboard.css";

const Scoreboard = ({ score = 0, highScore = 0 }) => {
  return (
    <div className="scoreboard-container">
      <h2 className="scoreboard-title">SCORE</h2>
      <div className="scoreboard-box">
        <span className="scoreboard-number">{score}</span>
        <span className="scoreboard-high">High Score: {highScore}</span>
      </div>
    </div>
  );
};

export default Scoreboard;
