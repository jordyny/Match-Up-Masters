/**
 * Lyrics Search Component
 * 
 * Standalone component for searching and displaying song lyrics.
 * Uses service layer for API communication.
 * 
 * @component
 */

import { useState } from 'react';
import { searchAndFetchLyrics } from '../services/apiService';

function LyricsSearch() {
  const [query, setQuery] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  /**
   * Handle search button click
   * Fetches lyrics for the searched song using service layer
   */
  const handleSearch = async () => {
    setLoading(true);
    setErr('');
    setLyrics('');

    try {
      // Use service layer for API call
      const data = await searchAndFetchLyrics(query);
      setLyrics(data.lyrics || '(No lyrics found)');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h2>Lyrics Search</h2>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a song (e.g., Hello Adele)"
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={handleSearch} disabled={!query || loading}>
          {loading ? 'Searching…' : 'Get Lyrics'}
        </button>
      </div>

      {err && <p style={{ color: 'tomato', marginTop: '1rem' }}>{err}</p>}

      {lyrics && (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #444',
            borderRadius: 8,
          }}
        >
          {lyrics}
        </pre>
      )}
    </div>
  );
}

export default LyricsSearch;
