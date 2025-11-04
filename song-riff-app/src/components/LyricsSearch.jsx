import { useState } from 'react';

function LyricsSearch() {
  const [query, setQuery] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setErr('');
    setLyrics('');

    try {
      const res = await fetch(`http://localhost:5050/lyrics?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
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
