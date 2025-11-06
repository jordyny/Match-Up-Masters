# Services Layer

This directory contains the service layer for the Song Riff Off application, following SOLID principles.

## Architecture Overview

The services layer separates business logic from UI components, following the **Single Responsibility Principle** and **Dependency Inversion Principle**.

```
Components → Services → API
```

## Service Modules

### 1. `apiService.js`
**Responsibility**: HTTP communication with the backend API

**Functions**:
- `searchSongs(query)` - Search for songs by query string
- `fetchLyrics(songUrl)` - Fetch lyrics for a specific song
- `searchAndFetchLyrics(query)` - Legacy combined search and fetch

**Usage**:
```javascript
import { searchSongs, fetchLyrics } from './services/apiService';

const songs = await searchSongs('Hello Adele');
const lyrics = await fetchLyrics(song.url);
```

### 2. `lyricsService.js`
**Responsibility**: Business logic for lyrics operations

**Functions**:
- `parseLyricsIntoLines(lyricsText)` - Parse raw lyrics into array
- `createSongWithLyrics(songMetadata, lyricsText)` - Create complete song object
- `searchForSongs(query)` - Search wrapper
- `fetchSongWithLyrics(song)` - Fetch and prepare song with lyrics
- `calculateLyricSimilarity(line1, line2)` - Calculate word similarity (0-100%)
- `getSimilarityColor(similarity)` - Get color classification for score

**Usage**:
```javascript
import { fetchSongWithLyrics, calculateLyricSimilarity } from './services/lyricsService';

const songWithLyrics = await fetchSongWithLyrics(song);
const similarity = calculateLyricSimilarity(lyric1, lyric2);
```

### 3. `gameStateService.js`
**Responsibility**: Game state management and transitions

**Functions**:
- `createInitialGameState(initialSongId)` - Create initial state
- `advanceToNextRound(currentState, roundScore)` - Calculate next round state
- `canAdvanceToNextRound(rightSongId, selectedLyric1, selectedLyric2)` - Validation
- `updateDotCount(currentDotCount, addedDotThisRound)` - Progress trail logic
- `resetSearchState()` - Clear search state

**Usage**:
```javascript
import { advanceToNextRound, canAdvanceToNextRound } from './services/gameStateService';

if (canAdvanceToNextRound(rightSongId, lyric1, lyric2)) {
  const nextState = advanceToNextRound(currentState, similarity);
}
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
Each service has one clear responsibility:
- `apiService` - API communication only
- `lyricsService` - Lyrics business logic only
- `gameStateService` - Game state management only

### Open/Closed Principle (OCP)
Services are open for extension but closed for modification. New features can be added by creating new services or extending existing ones without changing core logic.

### Dependency Inversion Principle (DIP)
Components depend on service abstractions, not concrete implementations. This allows for easy testing and swapping of implementations.

## Benefits

1. **Testability**: Services can be unit tested independently
2. **Reusability**: Logic can be shared across components
3. **Maintainability**: Changes to business logic are centralized
4. **Separation of Concerns**: UI components focus on presentation
5. **Type Safety**: Clear function signatures and documentation

## Error Handling

All service functions throw errors that should be caught by the calling component:

```javascript
try {
  const songs = await searchForSongs(query);
} catch (error) {
  // Handle error in component
  setError(error.message);
}
```

## Future Enhancements

- Add TypeScript for type safety
- Implement caching layer
- Add request cancellation
- Implement retry logic
- Add analytics service
