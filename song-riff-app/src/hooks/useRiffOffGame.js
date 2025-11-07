/**
 * Custom Hook: useRiffOffGame
 * 
 * Manages the core game state for the Riff Off page
 * Follows Single Responsibility Principle - handles only game state logic
 * 
 * @param {string} initialSongId - Starting song ID
 * @returns {Object} Game state and handlers
 */

import { useState, useEffect } from 'react';
import { calculateLyricSimilarity, getSimilarityColor } from '../services/lyricsService';

export const useRiffOffGame = (initialSongId) => {
  // Game state
  const [leftSongId, setLeftSongId] = useState(initialSongId);
  const [rightSongId, setRightSongId] = useState(null);
  const [selectedLyric1, setSelectedLyric1] = useState(null);
  const [selectedLyric2, setSelectedLyric2] = useState(null);
  const [dotCount, setDotCount] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [addedDotThisRound, setAddedDotThisRound] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  /**
   * Reset game state when initial song changes
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
   * Add dot to progress trail when second lyric is selected
   */
  useEffect(() => {
    if (selectedLyric2 && !addedDotThisRound) {
      setDotCount((c) => c + 1);
      setAddedDotThisRound(true);
    }
  }, [selectedLyric2, addedDotThisRound]);

  /**
   * Calculate similarity between selected lyrics
   */
  const similarity = (selectedLyric1 && selectedLyric2)
    ? calculateLyricSimilarity(selectedLyric1, selectedLyric2)
    : null;

  const similarityColor = getSimilarityColor(similarity);

  /**
   * Handle lyric selection
   */
  const handleLyricClick = (lyric, songId) => {
    if (songId === 1) {
      setSelectedLyric1(lyric);
    } else if (songId === 2) {
      setSelectedLyric2(lyric);
    }
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setSelectedLyric1(null);
    setSelectedLyric2(null);
  };

  /**
   * Advance to next round
   */
  const handleNextRound = (onComplete) => {
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
      setAddedDotThisRound(false);
      
      // Call completion callback if provided
      if (onComplete) onComplete();
    }, 250);
  };

  /**
   * Set right song (for song selection)
   */
  const selectRightSong = (songId) => {
    setRightSongId(songId);
    setSelectedLyric2(null);
  };

  return {
    // State
    leftSongId,
    rightSongId,
    selectedLyric1,
    selectedLyric2,
    dotCount,
    totalScore,
    similarity,
    similarityColor,
    isAdvancing,
    
    // Actions
    handleLyricClick,
    clearSelection,
    handleNextRound,
    selectRightSong,
  };
};
