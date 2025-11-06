import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import { songs, lyrics } from '../mockData';
import SongListItem from '../components/SongListItem';
import SearchBar from '../components/SearchBar';
import './RiffOffPage.css';

// --- Sub-component for displaying a single song's lyrics ---
const LyricColumn = ({ songTitle, artist, lyrics, songId, onLyricClick, selectedLyric, isDisabled }) => (
  <div className="lyric-column">
    <div className="song-header">
      <h3>{songTitle}</h3>
      <p>{artist}</p>
    </div>
    {lyrics && lyrics.length > 0 ? (
      <div className="lyrics">
        {lyrics.map((line, index) => (
          <p
            key={index}
            className={`lyric-line ${selectedLyric === line ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && onLyricClick(line, songId)}
          >
            {line}
          </p>
        ))}
      </div>
    ) : (
      <div className="lyrics no-lyrics">
        <p className="no-lyrics-text">Lyrics unavailable for this song.</p>
      </div>
    )}
  </div>
);

// --- Main RiffOffPage Component ---
const RiffOffPage = () => {
  const { id } = useParams();
  const initialSongId = Number(id);
  const [leftSongId, setLeftSongId] = useState(initialSongId);
  const [selectedLyric1, setSelectedLyric1] = useState(null);
  const [selectedLyric2, setSelectedLyric2] = useState(null);
  const [rightSongId, setRightSongId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [addedDotThisRound, setAddedDotThisRound] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // --- Timer state ---
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Load timer value from localStorage when page starts
  useEffect(() => {
    const storedTime = localStorage.getItem('riffTimer');
    if (storedTime) {
      setTimeLeft(parseInt(storedTime));
    }
  }, []);

  // Countdown logic
  useEffect(() => {
    if (timeLeft === null || isTimeUp) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isTimeUp]);

  // Reset logic when new song starts
  useEffect(() => {
    setLeftSongId(initialSongId);
    setSelectedLyric1(null);
    setRightSongId(null);
    setSelectedLyric2(null);
    setDotCount(1);
    setAddedDotThisRound(false);
    setTotalScore(0);
  }, [initialSongId]);

  const getLyricsForSong = (song) => {
    if (!song) return [];
    const lines = lyrics[song.title];
    return Array.isArray(lines) ? lines : [];
  };

  const leftSong = useMemo(() => songs.find(s => s.id === leftSongId), [leftSongId]);
  const leftLyrics = useMemo(() => getLyricsForSong(leftSong), [leftSong]);
  const rightSong = useMemo(() => songs.find(s => s.id === rightSongId), [rightSongId]);
  const rightLyrics = useMemo(() => getLyricsForSong(rightSong), [rightSong]);

  const getSimilarityPercentage = (a, b) => {
    const tokenize = (text) => {
      if (!text) return [];
      return (text.match(/[A-Za-z0-9']+/g) || []).map(w => w.toLowerCase());
    };
    const w1 = new Set(tokenize(a));
    const w2 = new Set(tokenize(b));
    if (w1.size === 0 && w2.size === 0) return 100;
    if (w1.size === 0 || w2.size === 0) return 0;
    let common = 0;
    for (const word of w1) {
      if (w2.has(word)) common += 1;
    }
    const denom = Math.max(w1.size, w2.size);
    return Math.round((common / denom) * 100);
  };

  const similarity = (selectedLyric1 && selectedLyric2)
    ? getSimilarityPercentage(selectedLyric1, selectedLyric2)
    : null;

  const handleNextRound = () => {
    if (!rightSong) return;
    if (similarity != null) {
      setTotalScore((s) => s + similarity);
    }
    setIsAdvancing(true);
    setTimeout(() => {
      setLeftSongId(rightSongId);
      setRightSongId(null);
      setSelectedLyric1(selectedLyric2);
      setSelectedLyric2(null);
      setIsAdvancing(false);
      setIsPickerOpen(false);
      setAddedDotThisRound(false);
    }, 250);
  };

  const similarityColor = similarity == null
    ? 'neutral'
    : similarity <= 25
      ? 'red'
      : similarity <= 50
        ? 'orange'
        : similarity <= 75
          ? 'yellow'
          : 'green';

  const handleLyricClick = (lyric, songId) => {
    if (isTimeUp) return; // Disable clicks when time’s up
    if (songId === 1) {
      setSelectedLyric1(lyric);
    } else if (songId === 2) {
      setSelectedLyric2(lyric);
    }
  };

  const clearSelection = () => {
    if (isTimeUp) return;
    setSelectedLyric1(null);
    setSelectedLyric2(null);
  };

  useEffect(() => {
    if (selectedLyric2 && !addedDotThisRound) {
      setDotCount((c) => c + 1);
      setAddedDotThisRound(true);
    }
  }, [selectedLyric2, addedDotThisRound]);

  const ProgressTrail = ({ count = 1, score = 0 }) => {
    const height = 50;
    const padding = 12;
    const r = 8;
    const step = 50;
    const minWidth = 320;
    const width = Math.max(minWidth, padding * 2 + (count - 1) * step, padding * 2 + r * 2);
    const points = Array.from({ length: count }, (_, i) => ({
      x: Math.round(padding + i * step),
      y: Math.round(height / 2),
    }));
    return (
      <div className="progress-trail">
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
              <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={r} className="trail-dot" />
            ))}
          </svg>
          <div className="score-pill" title="Total score">
            <span>{score}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="page-content riff-off-page">
        {/* Timer Display*/}
        {timeLeft !== null && (
          <div className="timer-overlay">
            ⏱️ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}

        <ProgressTrail count={dotCount} score={totalScore} />

        <Link to="/home" className="floating-save-button">Save</Link>

        <div className="riff-header">
          <Link to="/new" className="back-link">←</Link>
          <h2>{leftSong ? leftSong.title : 'Song'} {rightSong ? `& ${rightSong.title}` : ''}</h2>
        </div>

        <div className="chosen-lyrics-row">
          <div className="chosen-lyrics-box">
            <div className="chosen-header">
              <h3>Chosen Lyrics</h3>
              {similarity != null && (
                <div className={`similarity-badge ${similarityColor}`} title="Similarity">
                  <span>{similarity}% word similarity</span>
                </div>
              )}
              <button onClick={clearSelection} className="clear-button" disabled={isTimeUp}>
                Clear
              </button>
            </div>
            <div className="chosen-lyrics-content">
              <p className="chosen-lyric">
                {selectedLyric1 || 'Select a lyric from song 1...'}
              </p>
              <p className="chosen-lyric">
                {selectedLyric2 || 'Select a lyric from song 2...'}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {selectedLyric1 && selectedLyric2 && !isTimeUp && (
              <motion.button
                key="next-round"
                className="next-round-button"
                onClick={handleNextRound}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Next Round →
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className={`riff-container ${isAdvancing ? 'advancing' : ''}`}>
          {leftSong && (
            <div className="column-wrapper left-col">
              <LyricColumn
                songTitle={leftSong.title}
                artist={leftSong.artist}
                lyrics={leftLyrics}
                songId={1}
                onLyricClick={handleLyricClick}
                selectedLyric={selectedLyric1}
                isDisabled={isTimeUp}
              />
            </div>
          )}

          {rightSong ? (
            <div className="column-wrapper right-col">
              <LyricColumn
                songTitle={rightSong.title}
                artist={rightSong.artist}
                lyrics={rightLyrics}
                songId={2}
                onLyricClick={handleLyricClick}
                selectedLyric={selectedLyric2}
                isDisabled={isTimeUp}
              />
            </div>
          ) : (
            <div className="column-wrapper right-col">
              <div className="lyric-column add-song-box">
                <div className="add-song-content">
                  <button
                    className="add-song-button"
                    onClick={() => !isTimeUp && setIsPickerOpen(v => !v)}
                    disabled={isTimeUp}
                  >
                    +
                  </button>
                </div>
                {isPickerOpen && (
                  <div className="mini-search">
                    <div className="mini-search-inner">
                      <SearchBar />
                      <div className="mini-song-list">
                        {songs
                          .filter(s => s.id !== leftSongId)
                          .map(s => (
                            <div
                              key={s.id}
                              className="mini-song-item"
                              onClick={() => {
                                setRightSongId(s.id);
                                setSelectedLyric2(null);
                                setIsPickerOpen(false);
                              }}
                            >
                              <SongListItem title={s.title} artist={s.artist} duration={s.duration} />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/*Time's Up Overlay section */}
        {isTimeUp && (
          <div className="timesup-overlay">
            <div className="timesup-box">
              <h2>⏰ Time’s Up!</h2>
              <p>Your total score: {totalScore}%</p>
              <Link to="/timer" className="restart-btn">Play Again</Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RiffOffPage;
