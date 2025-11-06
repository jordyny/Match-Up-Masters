import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import SongListItem from '../components/SongListItem';

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
const RiffOffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialSongId = id; // Keep as string since Genius IDs are numbers
  const [leftSongId, setLeftSongId] = useState(initialSongId);
  const [selectedLyric1, setSelectedLyric1] = useState(null);
  const [selectedLyric2, setSelectedLyric2] = useState(null);
  const [rightSongId, setRightSongId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [addedDotThisRound, setAddedDotThisRound] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  // Mini search state
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [miniSearchResults, setMiniSearchResults] = useState([]);
  const [miniSearchLoading, setMiniSearchLoading] = useState(false);
  const [miniSearchError, setMiniSearchError] = useState('');

  // Check if initial song exists and redirect if not
  useEffect(() => {
    if (!songsWithLyrics[initialSongId]) {
      navigate('/new');
    }
  }, [initialSongId, songsWithLyrics, navigate]);

  // Only run when the URL parameter changes (initialSongId) to reset the game
  useEffect(() => {
    setLeftSongId(initialSongId);
    setSelectedLyric1(null);
    setRightSongId(null);
    setSelectedLyric2(null);
    setDotCount(1);
    setAddedDotThisRound(false);
    setTotalScore(0);
  }, [initialSongId]); // Only reset when URL changes, not when songs are added

  const getLyricsForSong = (songId) => {
    if (!songId || !songsWithLyrics[songId]) return [];
    return songsWithLyrics[songId].lyrics || [];
  };

  const leftSong = useMemo(() => songsWithLyrics[leftSongId], [leftSongId, songsWithLyrics]);
  const leftLyrics = useMemo(() => getLyricsForSong(leftSongId), [leftSongId, songsWithLyrics]);
  const rightSong = useMemo(() => songsWithLyrics[rightSongId], [rightSongId, songsWithLyrics]);
  const rightLyrics = useMemo(() => getLyricsForSong(rightSongId), [rightSongId, songsWithLyrics]);

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
      // Reset mini search
      setMiniSearchQuery('');
      setMiniSearchResults([]);
      setMiniSearchError('');
    }, 250);
  };

  // Handle mini search
  const handleMiniSearch = async (e) => {
    e.preventDefault();
    if (!miniSearchQuery.trim()) return;

    setMiniSearchLoading(true);
    setMiniSearchError('');

    try {
      const res = await fetch(`http://localhost:5050/lyrics/search?q=${encodeURIComponent(miniSearchQuery)}`);
      if (!res.ok) {
        throw new Error('Failed to search songs');
      }
      const data = await res.json();
      setMiniSearchResults(data.songs || []);
    } catch (err) {
      setMiniSearchError(err.message);
      setMiniSearchResults([]);
    } finally {
      setMiniSearchLoading(false);
    }
  };

  // Handle selecting a song from mini search
  const handleMiniSongSelect = async (song) => {
    // Check if we already have lyrics for this song
    if (songsWithLyrics[song.id]) {
      setRightSongId(song.id);
      setSelectedLyric2(null);
      setIsPickerOpen(false);
      setMiniSearchQuery('');
      setMiniSearchResults([]);
      return;
    }

    setMiniSearchLoading(true);
    setMiniSearchError('');

    try {
      const res = await fetch(`http://localhost:5050/lyrics/fetch?url=${encodeURIComponent(song.url)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch lyrics');
      }
      const data = await res.json();
      
      // Split lyrics into lines for the game
      const lyricsLines = data.lyrics.split('\n').filter(line => line.trim());
      
      // Store song with lyrics
      setSongsWithLyrics(prev => ({
        ...prev,
        [song.id]: {
          ...song,
          lyrics: lyricsLines
        }
      }));

      // Set as right song
      setRightSongId(song.id);
      setSelectedLyric2(null);
      setIsPickerOpen(false);
      setMiniSearchQuery('');
      setMiniSearchResults([]);
    } catch (err) {
      setMiniSearchError(`Failed to load lyrics: ${err.message}`);
    } finally {
      setMiniSearchLoading(false);
    }
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

  const ProgressTrail = ({ count = 1, score = 0 }) => {
    const height = 50;
    const padding = 12;
    const r = 8;
    const step = 50; // fixed distance between dots
    const minWidth = 320; // restore original visual footprint
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
      <ProgressTrail count={dotCount} score={totalScore} />

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
              style = {{whiteSpace:'nowrap'}}
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
                  {/* Search Form */}
                  <form onSubmit={handleMiniSearch} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={miniSearchQuery}
                        onChange={(e) => setMiniSearchQuery(e.target.value)}
                        placeholder="Search for a song..."
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.9rem',
                          backgroundColor: '#1a1a1a',
                          color: 'white',
                          border: '1px solid #444',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!miniSearchQuery.trim() || miniSearchLoading}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          backgroundColor: miniSearchLoading ? '#333' : '#6200ea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: miniSearchLoading ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        {miniSearchLoading ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                    {miniSearchError && (
                      <p style={{ color: 'tomato', marginTop: '0.5rem', fontSize: '0.85rem' }}>{miniSearchError}</p>
                    )}
                  </form>

                  <div className="mini-song-list">
                    {/* Show search results if available */}
                    {miniSearchResults.length > 0 ? (
                      <>
                        <p style={{ padding: '0.5rem 1rem', color: '#888', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Search Results:
                        </p>
                        {miniSearchResults.map(s => (
                          <div
                            key={s.id}
                            className="mini-song-item"
                            onClick={() => handleMiniSongSelect(s)}
                            style={{
                              cursor: miniSearchLoading ? 'wait' : 'pointer',
                              opacity: miniSearchLoading ? 0.6 : 1,
                            }}
                          >
                            <SongListItem title={s.title} artist={s.artist} duration="" />
                          </div>
                        ))}
                      </>
                    ) : null}

                    {/* Show previously loaded songs */}
                    {Object.values(songsWithLyrics).filter(s => s.id !== leftSongId).length > 0 && (
                      <>
                        <p style={{ padding: '0.5rem 1rem', color: '#888', fontSize: '0.85rem', fontWeight: 'bold', marginTop: miniSearchResults.length > 0 ? '1rem' : '0' }}>
                          Previously Loaded Songs:
                        </p>
                        {Object.values(songsWithLyrics)
                          .filter(s => s.id !== leftSongId)
                          .map(s => (
                            <div
                              key={s.id}
                              className="mini-song-item"
                              onClick={() => {
                                setRightSongId(s.id);
                                setSelectedLyric2(null);
                                setIsPickerOpen(false);
                                setMiniSearchQuery('');
                                setMiniSearchResults([]);
                              }}
                            >
                              <SongListItem title={s.title} artist={s.artist} duration="" />
                            </div>
                          ))}
                      </>
                    )}

                    {/* Show message if no results and no previously loaded songs */}
                    {miniSearchResults.length === 0 && Object.values(songsWithLyrics).filter(s => s.id !== leftSongId).length === 0 && (
                      <p style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888' }}>
                        Search for a song above to add it to the riff
                      </p>
                    )}
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