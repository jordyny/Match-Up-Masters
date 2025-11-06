const axios = require('axios');
const cheerio = require('cheerio');
const GENIUS_API_KEY = "O3dHSiLrkubAAdYTm-o_qc5lTK33qQ7jM6YmZNPAlTbsmHZ6jrGiIlP6tMgFfmRx";

async function searchSong(query) {

  //goes to base url and submits get request with query/API key 
  const url = 'https://api.genius.com/search';
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${GENIUS_API_KEY}` },
    params: { q: query },
  });
  //gets number of matches from the search 
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

// New function to return multiple search results
async function searchSongs(query, limit = 10) {
  const url = 'https://api.genius.com/search';
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${GENIUS_API_KEY}` },
    params: { q: query },
  });
  
  const hits = response.data.response.hits;
  
  if (hits.length === 0) {
    return [];
  }

  // Return array of songs with relevant info
  return hits.slice(0, limit).map(hit => {
    const song = hit.result;
    return {
      id: song.id,
      title: song.title,
      artist: song.primary_artist.name,
      fullTitle: song.full_title,
      url: song.url,
    };
  });
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

module.exports = { searchSong, searchSongs, getLyricsFromUrl };
