/**
 * Progress Trail Component
 * 
 * Displays a visual progress indicator with dots and score
 * Fixed position next to the menu pill
 * 
 * @component
 */

import React from 'react';
import './ProgressTrail.css';

/**
 * ProgressTrail component
 * 
 * @param {number} count - Number of dots to display
 */
const ProgressTrail = ({ count = 1, dots = [] }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const r = 8; // radius of each dot
  const padding = 16;
  const height = 28; // reduced to match scoreboard pill height
  const step = 50; // fixed distance between dots
  const minWidth = 320;
  const effectiveCount = Math.max(count, dots.length || 0);
  const width = Math.max(minWidth, padding * 2 + (effectiveCount - 1) * step, padding * 2 + r * 2);
  
  const points = Array.from({ length: effectiveCount }, (_, i) => ({
    x: Math.round(padding + i * step),
    y: Math.round(height / 2),
  }));

  return (
    <div className="progress-trail-container">
      <div className="progress-trail-inner" style={{ width }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {points.map((p, i) =>
            i > 0 ? (
              <line
                key={`line-${i}`}
                x1={points[i - 1].x}
                y1={points[i - 1].y}
                x2={p.x}
                y2={p.y}
                className="trail-line"
              />
            ) : null
          )}
          {points.map((p, i) => (
            <g
              key={`dot-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
            >
              <circle cx={p.x} cy={p.y} r={r} className="trail-dot" />
            </g>
          ))}
        </svg>
        {hoveredIndex != null && dots[hoveredIndex] && (
          <div
            className="dot-tooltip"
            style={{ left: points[hoveredIndex].x, top: height + 8 }}
          >
            {dots[hoveredIndex].albumArt && (
              <img className="dot-tooltip-art" src={dots[hoveredIndex].albumArt} alt="Album art" />
            )}
            <div className="dot-tooltip-text">
              <div className="dot-tooltip-title">{dots[hoveredIndex].title}</div>
              <div className="dot-tooltip-artist">{dots[hoveredIndex].artist}</div>
              {dots[hoveredIndex].lyric && (
                <div className="dot-tooltip-lyric">“{dots[hoveredIndex].lyric}”</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTrail;
