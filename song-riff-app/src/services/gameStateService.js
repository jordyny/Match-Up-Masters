/**
 * Game State Service
 * 
 * Manages game state logic and transitions for the Riff Off game.
 * Follows Single Responsibility Principle - handles only game state operations.
 * 
 * @module gameStateService
 */

/**
 * Create initial game state
 * 
 * @param {string} initialSongId - ID of the starting song
 * @returns {Object} - Initial game state object
 */
export function createInitialGameState(initialSongId) {
  return {
    leftSongId: initialSongId,
    rightSongId: null,
    selectedLyric1: null,
    selectedLyric2: null,
    dotCount: 1,
    totalScore: 0,
    addedDotThisRound: false
  };
}

/**
 * Advance to the next round
 * Moves right song to left, clears right side, updates score
 * 
 * @param {Object} currentState - Current game state
 * @param {number} roundScore - Score for the current round
 * @returns {Object} - New game state for next round
 */
export function advanceToNextRound(currentState, roundScore) {
  return {
    leftSongId: currentState.rightSongId,
    rightSongId: null,
    selectedLyric1: currentState.selectedLyric2,
    selectedLyric2: null,
    dotCount: currentState.dotCount,
    totalScore: currentState.totalScore + (roundScore || 0),
    addedDotThisRound: false
  };
}

/**
 * Check if the game can advance to next round
 * 
 * @param {string} rightSongId - ID of the right song
 * @param {string} selectedLyric1 - Selected lyric from left song
 * @param {string} selectedLyric2 - Selected lyric from right song
 * @returns {boolean} - True if can advance
 */
export function canAdvanceToNextRound(rightSongId, selectedLyric1, selectedLyric2) {
  return !!(rightSongId && selectedLyric1 && selectedLyric2);
}

/**
 * Update dot count when second lyric is selected
 * 
 * @param {number} currentDotCount - Current dot count
 * @param {boolean} addedDotThisRound - Whether dot was already added this round
 * @returns {Object} - Object with new dotCount and addedDotThisRound flag
 */
export function updateDotCount(currentDotCount, addedDotThisRound) {
  if (addedDotThisRound) {
    return { dotCount: currentDotCount, addedDotThisRound: true };
  }
  
  return {
    dotCount: currentDotCount + 1,
    addedDotThisRound: true
  };
}

/**
 * Reset search state
 * 
 * @returns {Object} - Clean search state
 */
export function resetSearchState() {
  return {
    searchQuery: '',
    searchResults: [],
    searchError: ''
  };
}
