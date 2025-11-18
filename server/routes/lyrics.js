/**
 * Lyrics router
 *
 * Defines HTTP endpoints for searching songs and retrieving lyrics.
 * All routes are mounted under `/lyrics` in `server.js`.
 */
const express = require('express');
const router = express.Router();

//adds functions from geniusAPI file 
const { searchSong, searchSongs, getLyricsFromUrl } = require('../services/geniusAPI');
const { searchTrack } = require('../services/spotifyAPI');

/**
 * GET /lyrics/search
 *
 * Query params:
 * - q: search query string
 *
 * Returns a list of matching songs from Genius.
 */
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

/**
 * GET /lyrics/fetch
 *
 * Query params:
 * - url: Genius song URL (required)
 * - title: song title (optional, used for Spotify search)
 * - artist: artist name (optional, used for Spotify search)
 *
 * Returns cleaned lyrics text and optional Spotify track metadata.
 */
// Get lyrics for a specific song by URL
router.get('/fetch', async (req, res) => {
  const songUrl = req.query.url;
  const songTitle = req.query.title;
  const artist = req.query.artist;

  if (!songUrl) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const lyrics = await getLyricsFromUrl(songUrl);
    if (!lyrics) return res.status(500).json({ error: 'Could not fetch lyrics' });

    // Search for Spotify track if we have title and artist
    let spotifyTrack = null;
    if (songTitle && artist) {
      spotifyTrack = await searchTrack(songTitle, artist);
    }

    res.json({ 
      lyrics,
      spotify: spotifyTrack
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /lyrics
 *
 * Legacy endpoint that searches for a single best match and returns its lyrics.
 *
 * Query params:
 * - q: search query string
 */
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
