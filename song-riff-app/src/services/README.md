# Architecture and Services

This document describes how the Song Riff Off application is structured and how the service layer fits into the overall architecture.

The project is split into a backend (`/server`) and a frontend (`/song-riff-app`). The frontend uses a services layer and custom hooks to keep UI components simple and focused on presentation.

## High-level Architecture

```text
Client (React)
  ├── Pages (screens)
  ├── Components (UI building blocks)
  ├── Hooks (stateful logic)
  └── Services (business logic + API calls)

Backend (Node/Express)
  ├── server.js (app setup)
  ├── routes/ (HTTP endpoints)
  └── services/ (Genius + Spotify integrations)
```

### Data Flow

1. A user interacts with a React **page** or **component**.
2. Pages call **hooks** for complex state (game flow, search) and **services** for business logic.
3. Frontend services call the **backend API** via `apiService`.
4. Backend **routes** delegate to backend **services**, which talk to Genius and Spotify.
5. The response flows back through the same layers to the UI.

---

## Frontend Services

All services in this folder are pure JavaScript modules with no React imports. They focus on:

- Talking to the backend API.
- Transforming data for the UI.
- Encapsulating game and lyrics logic.

### `apiService.js`

**Responsibility**: HTTP communication with the backend API.

- Defines `API_BASE_URL` (currently `http://localhost:5050`).
- Wraps `fetch` with `fetchWithErrorHandling` to normalize error handling.

**Key functions**:

- `searchSongs(query)`
  - Calls `GET /lyrics/search?q=...`.
  - Returns an array of song objects from Genius via the backend.

- `fetchLyrics(songUrl, title?, artist?)`
  - Calls `GET /lyrics/fetch?url=...&title=...&artist=...`.
  - Returns `{ lyrics, spotify }` where `spotify` contains optional preview metadata.

- `searchAndFetchLyrics(query)`
  - Calls legacy `GET /lyrics?q=...` endpoint.
  - Returns `{ title, lyrics }`.

**Usage**:

```js
import { searchSongs, fetchLyrics } from './apiService';

const songs = await searchSongs('Hello Adele');
const { lyrics, spotify } = await fetchLyrics(songs[0].url, songs[0].title, songs[0].artist);
```

### `lyricsService.js`

**Responsibility**: Lyrics-related business logic and transformations.

**Key functions**:

- `parseLyricsIntoLines(lyricsText)`
  - Splits raw lyrics text into an array of trimmed, non-empty lines.

- `createSongWithLyrics(songMetadata, lyricsText)`
  - Combines song metadata `{ id, title, artist, url }` with parsed `lyrics`.

- `searchForSongs(query)`
  - Thin wrapper around `apiService.searchSongs`.

- `fetchSongWithLyrics(song)`
  - Calls `apiService.fetchLyrics` for a song.
  - Returns a rich song object with `lyrics` (array of lines) and `spotify` info.

- `calculateLyricSimilarity(line1, line2)`
  - Computes a word-level similarity score (0–100) using a Jaccard-style metric.

- `getSimilarityColor(similarity)`
  - Maps similarity percentage to a color classification string.

**Usage**:

```js
import { fetchSongWithLyrics, calculateLyricSimilarity } from './lyricsService';

const songWithLyrics = await fetchSongWithLyrics(song);
const similarity = calculateLyricSimilarity(lyric1, lyric2);
```

### `gameStateService.js`

**Responsibility**: Pure game state calculations for the Riff Off game.

**Key functions**:

- `createInitialGameState(initialSongId)`
  - Returns a clean initial game state object.

- `advanceToNextRound(currentState, roundScore)`
  - Computes the next state when the player advances.

- `canAdvanceToNextRound(rightSongId, selectedLyric1, selectedLyric2)`
  - Returns a boolean indicating whether the next round is allowed.

- `updateDotCount(currentDotCount, addedDotThisRound)`
  - Increments the progress trail when appropriate.

- `resetSearchState()`
  - Returns a clean search state object.

**Usage**:

```js
import { advanceToNextRound, canAdvanceToNextRound } from './gameStateService';

if (canAdvanceToNextRound(rightSongId, lyric1, lyric2)) {
  const nextState = advanceToNextRound(currentState, similarity);
}
```

---

## Custom Hooks and Their Relationship to Services

Custom hooks live in `src/hooks` and wrap service functions with React state.

### `useRiffOffGame`

- Uses `calculateLyricSimilarity` and `getSimilarityColor` from `lyricsService`.
- Manages game-specific React state:
  - `leftSongId`, `rightSongId`
  - `selectedLyric1`, `selectedLyric2`
  - `dotCount`, `totalScore`
  - `similarity`, `similarityColor`, `isAdvancing`
- Exposes handlers like `handleLyricClick`, `handleNextRound`, `clearSelection`, `selectRightSong`.

### `useSongSearch`

- Uses `searchForSongs` and `fetchSongWithLyrics` from `lyricsService`.
- Manages search query, loading, error, and results.
- Exposes `handleSearch`, `selectSong`, `resetSearch` to pages/components.

Hooks depend on services, not the other way around. This keeps services reusable outside React and makes hooks easy to test.

---

## Backend Overview (for context)

Although the backend lives outside this folder, it is an important part of the overall flow.

- `server/server.js`
  - Sets up Express with CORS and JSON parsing.
  - Mounts `/lyrics` routes.

- `server/routes/lyrics.js`
  - Defines endpoints:
    - `GET /lyrics/search` – search songs via Genius.
    - `GET /lyrics/fetch` – fetch lyrics and optional Spotify track.
    - `GET /lyrics` – legacy combined search + lyrics endpoint.
  - Delegates to `geniusAPI` and `spotifyAPI` services.

- `server/services/geniusAPI.js`
  - Calls Genius API to search for songs.
  - Scrapes lyrics HTML with Cheerio and normalizes the text.

- `server/services/spotifyAPI.js`
  - Obtains and caches a Spotify access token.
  - Searches for matching tracks and returns basic track metadata.

---

## Error Handling

Service functions throw errors with clear messages. Callers (hooks or components) are responsible for catching them and updating UI state.

```js
import { searchForSongs } from './lyricsService';

try {
  const songs = await searchForSongs(query);
} catch (error) {
  setError(error.message);
}
```

---

## Future Enhancements

- Make `API_BASE_URL` configurable via Vite env variables.
- Add a caching layer for lyrics and search results.
- Add request cancellation for in-flight searches.
- Implement retry logic with backoff for transient network errors.
- Add analytics/tracking services at the service/hook level.
