/**
 * Riff Off Page Component (Refactored)
 * 
 * Main game interface where users compare lyrics between two songs.
 * Follows SOLID principles:
 * - Single Responsibility: Delegates logic to custom hooks and services
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Depends on abstractions (hooks/services)
 * 
 * @component
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import { pageVariants, pageTransition } from '../pageAnimations';
import LyricColumn from '../components/LyricColumn';
import SongPicker from '../components/SongPicker';
import ProgressTrail from '../components/ProgressTrail';
import ScoreboardPill from '../components/ScoreboardPill';
import FloatingSpotifyPlayer from '../components/FloatingSpotifyPlayer';
import { useRiffOffGame } from '../hooks/useRiffOffGame';
import { useSongSearch } from '../hooks/useSongSearch';

import './RiffOffPage.css';

/**
 * Main RiffOffPage Component
 * 
 * Coordinates between game logic, search, and UI
 */
const RiffOffPage = ({ songsWithLyrics, setSongsWithLyrics }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialSongId = id;
  
  // UI state
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Custom hooks for business logic
  const gameState = useRiffOffGame(initialSongId);
  const songSearch = useSongSearch();
  const [dots, setDots] = useState([]);
  const containerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  /**
   * Effect: Validate initial song exists
   */
  useEffect(() => {
    if (!songsWithLyrics[initialSongId]) {
      navigate('/new');
    }
  }, [initialSongId, songsWithLyrics, navigate]);

  /**
   * Get lyrics array for a song by ID
   */
  const getLyricsForSong = (songId) => {
    if (!songId || !songsWithLyrics[songId]) return [];
    return songsWithLyrics[songId].lyrics || [];
  };

  // Memoized song data
  const leftSong = useMemo(() => songsWithLyrics[gameState.leftSongId], [gameState.leftSongId, songsWithLyrics]);
  const leftLyrics = useMemo(() => getLyricsForSong(gameState.leftSongId), [gameState.leftSongId, songsWithLyrics]);
  const rightSong = useMemo(() => songsWithLyrics[gameState.rightSongId], [gameState.rightSongId, songsWithLyrics]);
  const rightLyrics = useMemo(() => getLyricsForSong(gameState.rightSongId), [gameState.rightSongId, songsWithLyrics]);

  useEffect(() => {
    if (leftSong && gameState.dotCount === 1) {
      setDots([{ title: leftSong.title, artist: leftSong.artist, albumArt: leftSong.spotify?.albumArt }]);
    } else if (!leftSong) {
      setDots([]);
    }
  }, [initialSongId, leftSong?.title, leftSong?.artist, leftSong?.spotify?.albumArt, gameState.dotCount]);

  useEffect(() => {
    if (rightSong && dots.length < gameState.dotCount) {
      setDots((prev) => [...prev, { title: rightSong.title, artist: rightSong.artist, albumArt: rightSong.spotify?.albumArt }]);
    }
  }, [gameState.dotCount, rightSong?.title, rightSong?.artist, rightSong?.spotify?.albumArt]);

  /**
   * Handle song selection from picker
   */
  const handleSongSelect = async (song) => {
    try {
      await songSearch.selectSong(song, songsWithLyrics, setSongsWithLyrics);
      gameState.selectRightSong(song.id);
      setIsPickerOpen(false);
      songSearch.resetSearch();
    } catch (err) {
      // Error is handled in the hook
      console.error('Failed to select song:', err);
    }
  };

  /**
   * Handle next round with cleanup
   */
  const handleNextRound = () => {
    gameState.handleNextRound(() => {
      setIsPickerOpen(false);
      songSearch.resetSearch();
    });
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
      {/* Fixed Progress Trail */}
      <ProgressTrail count={gameState.dotCount} dots={dots} />
      {/* Scoreboard pill to the left of Save button */}
      <ScoreboardPill score={gameState.totalScore} highScore={gameState.totalScore} />
      
      {/* Save Button */}
      <Link to="/home" className="floating-save-button">
        Save
      </Link>

      <div className="page-content riff-off-page">
        {/* Page Header */}
        <div className="riff-header">
          <Link to="/new" className="back-link">←</Link>
          <h2>{leftSong ? leftSong.title : 'Song'} {rightSong ? `& ${rightSong.title}` : ''}</h2>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          {gameState.similarity != null && (
            <div className={`similarity-badge ${gameState.similarityColor}`} title="Similarity">
              <span>{gameState.similarity}% word similarity</span>
            </div>
          )}
          <button onClick={gameState.clearSelection} className="clear-button">
            Clear Selection
          </button>
          <AnimatePresence>
            {gameState.selectedLyric1 && gameState.selectedLyric2 && (
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

        {/* Container for the two lyric columns */}
        <div ref={containerRef} className={`riff-container ${gameState.isAdvancing ? 'advancing' : ''}`}>
          {/* Single floating Spotify player that moves without re-rendering */}
          <FloatingSpotifyPlayer
            containerRef={containerRef}
            targetRef={rightSong ? rightColRef : leftColRef}
            track={(rightSong && rightSong.spotify) ? rightSong.spotify : (leftSong ? leftSong.spotify : null)}
          />
          {leftSong && (
            <div ref={leftColRef} className="column-wrapper left-col">
              <LyricColumn
                songTitle={leftSong.title}
                artist={leftSong.artist}
                lyrics={leftLyrics}
                songId={1}
                onLyricClick={gameState.handleLyricClick}
                selectedLyric={gameState.selectedLyric1}
                spotify={null}
              />
            </div>
          )}

          {/* Right column: either selected song or add box */}
          {rightSong ? (
            <div ref={rightColRef} className="column-wrapper right-col">
              <LyricColumn
                songTitle={rightSong.title}
                artist={rightSong.artist}
                lyrics={rightLyrics}
                songId={2}
                onLyricClick={gameState.handleLyricClick}
                selectedLyric={gameState.selectedLyric2}
                spotify={null}
              />
            </div>
          ) : (
            <div className="column-wrapper right-col">
              <div className="lyric-column add-song-box">
                <div className="add-song-content">
                  <button 
                    className="add-song-button" 
                    onClick={() => setIsPickerOpen(v => !v)}
                  >
                    +
                  </button>
                </div>
                {isPickerOpen && (
                  <SongPicker
                    searchQuery={songSearch.searchQuery}
                    onSearchQueryChange={songSearch.setSearchQuery}
                    onSearch={songSearch.handleSearch}
                    searchResults={songSearch.searchResults}
                    isLoading={songSearch.isLoading}
                    error={songSearch.error}
                    onSongSelect={handleSongSelect}
                    songsWithLyrics={songsWithLyrics}
                    excludeSongId={gameState.leftSongId}
                  />
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
