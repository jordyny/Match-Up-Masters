const express = require('express');
const router = express.Router();
const { searchSong, getLyricsFromUrl } = require('../services/geniusAPI');

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const song = await searchSong(query);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    const lyrics = await getLyricsFromUrl(song.url);
    if (!lyrics) return res.status(500).json({ error: 'Could not fetch lyrics' });

    res.json({ title: song.title, lyrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
