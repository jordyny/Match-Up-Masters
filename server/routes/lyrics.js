const express = require('express');
const router = express.Router();

//adds functions from geniusAPI file 
const { searchSong, searchSongs, getLyricsFromUrl } = require('../services/geniusAPI');

// Search for songs (returns list of matches)
router.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const songs = await searchSongs(query);
    res.json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get lyrics for a specific song by URL
router.get('/fetch', async (req, res) => {
  const songUrl = req.query.url;

  if (!songUrl) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const lyrics = await getLyricsFromUrl(songUrl);
    if (!lyrics) return res.status(500).json({ error: 'Could not fetch lyrics' });

    res.json({ lyrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Original endpoint - search and get lyrics in one call
router.get('/', async (req, res) => {
  const query = req.query.q;

  //case for no query 
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    //searches for song using the query 
    const song = await searchSong(query);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    //gets lyrics from song url, parses using getlyricsfromURL function
    const lyrics = await getLyricsFromUrl(song.url);
    if (!lyrics) return res.status(500).json({ error: 'Could not fetch lyrics' });

    res.json({ title: song.title, lyrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//export router to be used in server.js
module.exports = router;
