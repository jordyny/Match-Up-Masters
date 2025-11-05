import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import SearchBar from '../components/SearchBar';
import SongListItem from '../components/SongListItem';
import Button from '../components/Button';
import { songs } from '../mockData';
import { FaPlus } from 'react-icons/fa';
import './NewRiffPage.css';

const NewRiffPage = () => {
const [testQuery, setTestQuery] = useState(''); //stores what user types into song title box 
const [lyrics, setLyrics] = useState(''); //stores lyrics returned from API
const [loading, setLoading] = useState(false); //sets state of loading when getting lyrics 
const [error, setError] = useState(''); //set error state to display message if anything fails 

//when user clicks the Get Lyrics button triggers this function
const handleLyricsTest = async () => {
  setLoading(true);
  setError('');
  setLyrics('');

  try {
    const res = await fetch(`http://localhost:5050/lyrics?q=${encodeURIComponent(testQuery)}`); //sends request to backend and saves state 
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed with ${res.status}`);
    }
    const data = await res.json();
    setLyrics(data.lyrics || '(No lyrics found)');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

   return (
    // for animations
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
    <div className="page-content new-riff-page">
      <div className="top-section">
        <SearchBar />
        <h2 className="section-title">Songs</h2>
        <div className="song-list">
           {/* Map over the mock 'songs' data to create a list */}
          {songs.map((song) => (
             <Link to={`/riff/${song.id}`} key={song.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <SongListItem
                    title={song.title}
                    artist={song.artist}
                    duration={song.duration}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom section with a "Choose Song" button (mock) */}
        <div className="bottom-section">
          <Button to="/riff">
            Choose Song <FaPlus style={{ marginLeft: '0.5rem' }} />
          </Button>
        </div>

        {/* Temporary Genius Lyrics API Test Section */}
        <div
          style={{
            marginTop: '2rem',
            borderTop: '1px solid #444',
            paddingTop: '1rem',
          }}
        >
          <h3>Test Genius Lyrics API</h3>
          {/* Input + button */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Type a song title (Hello Adele)"
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button
              onClick={handleLyricsTest}
              disabled={!testQuery || loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#222',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Fetching…' : 'Get Lyrics'}
            </button>
          </div>
          {/* Error message */}
          {error && (
            <p style={{ color: 'tomato', marginTop: '0.5rem' }}>{error}</p>
          )}

          {/* Lyrics display */}
          {lyrics && (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid #333',
                borderRadius: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#111',
                color: '#eee',
              }}
            >
              {lyrics}
            </pre>
          )}
        </div>
      </div>
        {/* Bottom section with a "Choose Song" button (mock) */}
      <div className="bottom-section">
        <Button to={`/riff/${songs[0].id}`}>
          Choose Song <FaPlus style={{marginLeft: '0.5rem'}} />
        </Button>
      </div>
    </div>
    </motion.div>
  );
};

export default NewRiffPage;