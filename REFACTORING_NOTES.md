# RiffOffPage Refactoring - SOLID Principles

## Overview
Refactored the RiffOffPage component to follow SOLID principles and best practices by extracting business logic into custom hooks and separating UI concerns into dedicated components.

## Changes Made

### 1. Custom Hooks Created

#### `useRiffOffGame.js`
**Responsibility**: Manages core game state and logic
- Game state (selected lyrics, scores, progress)
- Lyric selection handling
- Round advancement logic
- Score calculation
- Follows **Single Responsibility Principle**

#### `useSongSearch.js`
**Responsibility**: Manages song search operations
- Search query state
- API calls for searching songs
- Song selection and lyrics fetching
- Error handling
- Follows **Single Responsibility Principle**

### 2. Components Extracted

#### `LyricColumn.jsx`
**Responsibility**: Display lyrics for a single song
- Renders song title, artist, and lyrics
- Handles Spotify player integration
- Shows selected lyric display
- Pure presentational component
- Follows **Single Responsibility Principle**

#### `SongPicker.jsx`
**Responsibility**: Song search and selection UI
- Search form interface
- Display search results
- Show previously loaded songs
- Follows **Single Responsibility Principle**

#### `ProgressTrail.jsx` (already created)
**Responsibility**: Display game progress
- Visual progress indicator
- Score display
- Fixed positioning

### 3. Main Component (RiffOffPage.jsx)

**New Responsibilities** (Reduced):
- Coordinate between hooks and components
- Handle routing and navigation
- Manage UI state (picker open/closed)
- Compose child components

**Removed Responsibilities**:
- ❌ Game state management → `useRiffOffGame`
- ❌ Search logic → `useSongSearch`
- ❌ Lyric display → `LyricColumn`
- ❌ Song picker UI → `SongPicker`

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
✅ Each module has one reason to change:
- `useRiffOffGame`: Game logic changes
- `useSongSearch`: Search logic changes
- `LyricColumn`: Lyric display changes
- `SongPicker`: Picker UI changes
- `RiffOffPage`: Composition/coordination changes

### Open/Closed Principle (OCP)
✅ Components are open for extension, closed for modification:
- Hooks can be extended with new features
- Components accept props for customization
- New game rules can be added without modifying existing code

### Liskov Substitution Principle (LSP)
✅ Components can be replaced with alternatives:
- `LyricColumn` can be swapped with different implementations
- `SongPicker` can be replaced with alternative pickers
- Hooks return consistent interfaces

### Interface Segregation Principle (ISP)
✅ Components receive only the props they need:
- `LyricColumn` doesn't know about game state
- `SongPicker` doesn't know about lyrics
- Each component has a focused interface

### Dependency Inversion Principle (DIP)
✅ High-level modules depend on abstractions:
- `RiffOffPage` depends on hook interfaces, not implementations
- Services are injected through hooks
- Easy to mock for testing

## Benefits

### Maintainability
- Easier to locate and fix bugs
- Clear separation of concerns
- Reduced cognitive load

### Testability
- Hooks can be tested independently
- Components can be tested in isolation
- Easier to mock dependencies

### Reusability
- `useSongSearch` can be used in other pages
- `LyricColumn` can display lyrics anywhere
- `SongPicker` can be reused for different selection flows

### Scalability
- Easy to add new features
- Can extend hooks without modifying components
- Clear boundaries for new functionality

## File Structure

```
src/
├── hooks/
│   ├── useRiffOffGame.js      # Game state management
│   └── useSongSearch.js       # Search functionality
├── components/
│   ├── LyricColumn.jsx        # Lyric display
│   ├── SongPicker.jsx         # Song selection UI
│   └── ProgressTrail.jsx      # Progress indicator
└── pages/
    ├── RiffOffPage.jsx        # Main page (refactored)
    └── RiffOffPage.old.jsx    # Original (backup)
```

## Migration Notes

- Original file backed up as `RiffOffPage.old.jsx`
- All functionality preserved
- No breaking changes to parent components
- Props interface remains the same

## Future Improvements

1. **Add unit tests** for hooks and components
2. **Extract CSS** into component-specific files
3. **Add TypeScript** for type safety
4. **Create a context** for global game state if needed
5. **Add error boundaries** for better error handling
