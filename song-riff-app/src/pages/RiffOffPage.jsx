import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import { songs, lyrics } from '../mockData';
import SongListItem from '../components/SongListItem';
import SearchBar from '../components/SearchBar';

import './RiffOffPage.css';
// --- Sub-component for displaying a single song's lyrics ---
// 'songId' (1 or 2) and 'onLyricClick' (a function) are passed down
const LyricColumn = ({ songTitle, artist, lyrics, songId, onLyricClick, selectedLyric }) => (
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
            className={`lyric-line ${selectedLyric === line ? 'selected' : ''}`}
            onClick={() => onLyricClick(line, songId)}
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

  useEffect(() => {
    setLeftSongId(initialSongId);
    setSelectedLyric1(null);
    setRightSongId(null);
    setSelectedLyric2(null);
    setDotCount(1);
    setAddedDotThisRound(false);
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
// Event handler for clicking a lyric
  const handleLyricClick = (lyric, songId) => {
    if (songId === 1) {
      setSelectedLyric1(lyric);
    } else if (songId === 2) {
      setSelectedLyric2(lyric);
    }
  };
  // Event handler for the "Clear" button
  const clearSelection = () => {
    setSelectedLyric1(null);
    setSelectedLyric2(null);
  };

  // When second lyric is selected and we haven't added a dot for this round yet, increment the trail
  useEffect(() => {
    if (selectedLyric2 && !addedDotThisRound) {
      setDotCount((c) => c + 1);
      setAddedDotThisRound(true);
    }
  }, [selectedLyric2, addedDotThisRound]);

  const ProgressTrail = ({ count = 1 }) => {
    const width = 320;
    const height = 26;
    const padding = 16;
    const r = 4;
    const gap = count > 1 ? (width - padding * 2) / (count - 1) : 0;
    const points = Array.from({ length: count }, (_, i) => ({
      x: Math.round(padding + i * gap),
      y: Math.round(height / 2),
    }));
    return (
      <div className="progress-trail">
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

      <ProgressTrail count={dotCount} />

      {/* --- for future add save button --- */}
      <Link to="/home" className="floating-save-button">
        Save
      </Link>

        {/* Page Header (Back arrow and Title) */}
      <div className="riff-header">
        <Link to="/new" className="back-link">←</Link>
        <h2>{leftSong ? leftSong.title : 'Song'} {rightSong ? `& ${rightSong.title}` : ''}</h2>
      </div>
{/* Chosen Lyrics + Next Round (row) */}
      <div className="chosen-lyrics-row">
        <div className="chosen-lyrics-box">
          <div className="chosen-header">
            <h3>Chosen Lyrics</h3>
            {similarity != null && (
              <div className={`similarity-badge ${similarityColor}`} title="Similarity">
                <span>{similarity}% word similarity</span>
              </div>
            )}
            <button onClick={clearSelection} className="clear-button">
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
          {selectedLyric1 && selectedLyric2 && (
            <motion.button
              key="next-round"
              className="next-round-button"
              onClick={handleNextRound}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              Next Round →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
     {/* Container for the two lyric columns */}
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
            />
          </div>
        )}

        {/* Right column: either selected song or add box */}
        {rightSong ? (
          <div className="column-wrapper right-col">
            <LyricColumn
              songTitle={rightSong.title}
              artist={rightSong.artist}
              lyrics={rightLyrics}
              songId={2}
              onLyricClick={handleLyricClick}
              selectedLyric={selectedLyric2}
            />
          </div>
        ) : (
          <div className="column-wrapper right-col">
            <div className="lyric-column add-song-box">
              <div className="add-song-content">
                <button className="add-song-button" onClick={() => setIsPickerOpen(v => !v)}>+
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
    </div>
    </motion.div>
  );
};

export default RiffOffPage;