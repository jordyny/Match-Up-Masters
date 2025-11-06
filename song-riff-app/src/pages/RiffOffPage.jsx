/**
 * Riff Off Page Component
 * 
 * Main game interface where users compare lyrics between two songs.
 * Follows Single Responsibility Principle by delegating business logic to services.
 * 
 * @component
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import SongListItem from '../components/SongListItem';
import { 
  calculateLyricSimilarity, 
  getSimilarityColor, 
  fetchSongWithLyrics 
} from '../services/lyricsService';

import './RiffOffPage.css';

/**
 * LyricColumn Component
 * 
 * Displays a single song's lyrics with clickable lines
 * 
 * @param {string} songTitle - Title of the song
 * @param {string} artist - Artist name
 * @param {Array<string>} lyrics - Array of lyric lines
 * @param {number} songId - Song identifier (1 or 2)
 * @param {Function} onLyricClick - Callback when a lyric line is clicked
 * @param {string} selectedLyric - Currently selected lyric line
 */
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

/**
 * Main RiffOffPage Component
 * 
 * Manages the game state and coordinates between UI and services
 */
const RiffOffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialSongId = id;
  
  // Game state
  const [leftSongId, setLeftSongId] = useState(initialSongId);
  const [rightSongId, setRightSongId] = useState(null);
  const [selectedLyric1, setSelectedLyric1] = useState(null);
  const [selectedLyric2, setSelectedLyric2] = useState(null);
  const [dotCount, setDotCount] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [addedDotThisRound, setAddedDotThisRound] = useState(false);
  
  // UI state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  
  // Mini search state
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [miniSearchResults, setMiniSearchResults] = useState([]);
  const [miniSearchLoading, setMiniSearchLoading] = useState(false);
  const [miniSearchError, setMiniSearchError] = useState('');

  /**
   * Effect: Validate initial song exists
   * Redirects to search page if song is not found
   */
  useEffect(() => {
    if (!songsWithLyrics[initialSongId]) {
      navigate('/new');
    }
  }, [initialSongId, songsWithLyrics, navigate]);

  /**
   * Effect: Reset game state when URL changes
   * Only triggers on URL parameter change, not when new songs are added
   */
  useEffect(() => {
    setLeftSongId(initialSongId);
    setSelectedLyric1(null);
    setRightSongId(null);
    setSelectedLyric2(null);
    setDotCount(1);
    setAddedDotThisRound(false);
    setTotalScore(0);
  }, [initialSongId]);

  /**
   * Get lyrics array for a song by ID
   * @param {string} songId - Song identifier
   * @returns {Array<string>} - Array of lyric lines
   */
  const getLyricsForSong = (songId) => {
    if (!songId || !songsWithLyrics[songId]) return [];
    return songsWithLyrics[songId].lyrics || [];
  };

  // Memoized song data to prevent unnecessary re-renders
  const leftSong = useMemo(() => songsWithLyrics[leftSongId], [leftSongId, songsWithLyrics]);
  const leftLyrics = useMemo(() => getLyricsForSong(leftSongId), [leftSongId, songsWithLyrics]);
  const rightSong = useMemo(() => songsWithLyrics[rightSongId], [rightSongId, songsWithLyrics]);
  const rightLyrics = useMemo(() => getLyricsForSong(rightSongId), [rightSongId, songsWithLyrics]);

  // Calculate similarity between selected lyrics using service
  const similarity = (selectedLyric1 && selectedLyric2)
    ? calculateLyricSimilarity(selectedLyric1, selectedLyric2)
    : null;
  /**
   * Advance to the next round
   * Moves right song to left, updates score, resets state
   */
  const handleNextRound = () => {
    if (!rightSong) return;
    
    // Add current round score to total
    if (similarity != null) {
      setTotalScore((s) => s + similarity);
    }
    
    // Trigger advancing animation
    setIsAdvancing(true);
    
    // After animation, update game state
    setTimeout(() => {
      setLeftSongId(rightSongId);
      setRightSongId(null);
      setSelectedLyric1(selectedLyric2);
      setSelectedLyric2(null);
      setIsAdvancing(false);
      setIsPickerOpen(false);
      setAddedDotThisRound(false);
      
      // Reset mini search state
      setMiniSearchQuery('');
      setMiniSearchResults([]);
      setMiniSearchError('');
    }, 250);
  };

  /**
   * Handle mini search form submission
   * Searches for songs within the riff-off page
   * 
   * @param {Event} e - Form submit event
   */
  const handleMiniSearch = async (e) => {
    e.preventDefault();
    if (!miniSearchQuery.trim()) return;

    setMiniSearchLoading(true);
    setMiniSearchError('');

    try {
      // Use service layer for API call
      const { searchForSongs } = await import('../services/lyricsService');
      const songs = await searchForSongs(miniSearchQuery);
      setMiniSearchResults(songs);
    } catch (err) {
      setMiniSearchError(err.message);
      setMiniSearchResults([]);
    } finally {
      setMiniSearchLoading(false);
    }
  };

  /**
   * Handle song selection from mini search
   * Fetches lyrics if needed and sets as right song
   * 
   * @param {Object} song - Selected song object
   */
  const handleMiniSongSelect = async (song) => {
    // Check if we already have lyrics cached
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
      // Fetch and parse lyrics using service layer
      const songWithLyrics = await fetchSongWithLyrics(song);
      
      // Store song with lyrics in app state
      setSongsWithLyrics(prev => ({
        ...prev,
        [song.id]: songWithLyrics
      }));

      // Set as right song and close picker
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

  // Get color classification for similarity score using service
  const similarityColor = getSimilarityColor(similarity);
  
  /**
   * Handle lyric line click
   * Updates selected lyric for the appropriate song
   * 
   * @param {string} lyric - The clicked lyric line
   * @param {number} songId - Song identifier (1 or 2)
   */
  const handleLyricClick = (lyric, songId) => {
    if (songId === 1) {
      setSelectedLyric1(lyric);
    } else if (songId === 2) {
      setSelectedLyric2(lyric);
    }
  };
  
  /**
   * Clear both selected lyrics
   */
  const clearSelection = () => {
    setSelectedLyric1(null);
    setSelectedLyric2(null);
  };

  /**
   * Effect: Update progress trail when second lyric is selected
   * Adds a dot to the trail only once per round
   */
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