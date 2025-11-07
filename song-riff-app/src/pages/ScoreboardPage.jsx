import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ScoreboardPage = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem("scores")) || [];
    // Sort high → low
    savedScores.sort((a, b) => b.score - a.score);
    setScores(savedScores);
  }, []);

  return (
    <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
      <h1>🏆 Scoreboard</h1>

      {scores.length === 0 ? (
        <p>No scores yet — play a game first!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, maxWidth: "400px", margin: "0 auto" }}>
          {scores.map((entry, i) => (
            <li key={i} style={{
              background: "rgba(255,255,255,0.1)",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "8px"
            }}>
              #{i + 1} — <strong>{entry.score}</strong> points 
              <br />
              <span style={{ fontSize: "0.8rem", color: "gray" }}>
                {new Date(entry.date).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/home" style={{ color: "white", marginTop: "20px", display: "inline-block" }}>
        ⬅ Back to Home
      </Link>
    </div>
  );
};

export default ScoreboardPage;
