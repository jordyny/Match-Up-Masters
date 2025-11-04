const axios = require('axios');
const cheerio = require('cheerio');
const GENIUS_API_KEY = process.env.GENIUS_API_KEY;

async function searchSong(query) {
  const url = 'https://api.genius.com/search';
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${GENIUS_API_KEY}` },
    params: { q: query },
  });

  const hits = response.data.response.hits;

  if (hits.length === 0) {
    console.log('No resulting song found');
    return null;
  }

  // Get all keys in song to determine what to extract 
  console.log('Full song parameters:', hits[0].result);
  const song = hits[0].result;

  return {
    title: song.full_title,
    url: song.url,
  };
}

// function to get lyrics from song URL, needs to use cheerio package to parse HTML 
// selector grabs each div that contains lyrics on the page, each loops through them one ny one 
async function getLyricsFromUrl(songUrl) {
  const { data: html } = await axios.get(songUrl);
  const $ = cheerio.load(html);
  let lyrics = '';
  $('[data-lyrics-container="true"]').each((i, el) => {
    lyrics += $(el).text() + '\n';
  });
  return lyrics.trim();
}

module.exports = { searchSong, getLyricsFromUrl };
