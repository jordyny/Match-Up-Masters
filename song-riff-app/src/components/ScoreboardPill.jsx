import React, { useState } from 'react';
import './ScoreboardPill.css';

const ScoreboardPill = ({ score = 0, highScore = 0 }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="scoreboard-pill-wrapper">
      <button
        className="scoreboard-pill-button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={`Score ${score}. ${open ? 'Close scoreboard' : 'Open scoreboard'}`}
      >
        <span className="scoreboard-pill-label">Score:</span>
        <span className="scoreboard-pill-value">{score}</span>
      </button>

      {open && (
        <div className="scoreboard-panel" role="dialog" aria-modal="false">
          <h2 className="scoreboard-title">SCORE</h2>
          <div className="scoreboard-box">
            <span className="scoreboard-number">{score}</span>
            <span className="scoreboard-high">High Score: {highScore}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreboardPill;
