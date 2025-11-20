/**
 * Genius API service.
 *
 * Provides functions to search songs via the Genius API and scrape lyrics
 * from a Genius song page.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const GENIUS_API_KEY = process.env.GENIUS_API_KEY;

/**
 * Search for a single best matching song on Genius.
 *
 * @param {string} query - Search query entered by the user.
 * @returns {Promise<{title: string, url: string} | null>} The top result or null.
 */
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
/**
 * Search Genius for multiple matching songs.
 *
 * @param {string} query - Search query entered by the user.
 * @param {number} [limit=10] - Maximum number of hits to return.
 * @returns {Promise<Array>} List of simplified song objects.
 */
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
/**
 * Fetch and clean lyrics from a Genius song URL.
 *
 * Downloads the page HTML, extracts the main lyrics containers, removes
 * section headers and non-lyric noise, and returns a cleaned multiline string.
 *
 * @param {string} songUrl - Public Genius URL for the song.
 * @returns {Promise<string>} Clean lyrics text with line breaks preserved.
 */
async function getLyricsFromUrl(songUrl) {
  const { data: html } = await axios.get(songUrl);
  const $ = cheerio.load(html);
  
  // Get lyrics and preserve line breaks by replacing <br> with newlines
  let lyrics = '';
  $('[data-lyrics-container="true"]').each((i, el) => {
    // Replace <br> tags with newlines before getting text
    $(el).find('br').replaceWith('\n');
    lyrics += $(el).text() + '\n';
  });
  
  // Clean up the lyrics - remove section headers and extra whitespace
  const lines = lyrics.split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Remove empty lines
      if (!line) return false;
      // Remove section headers like [Chorus], [Verse 1], [Bridge], etc.
      if (/^\[.*\]$/.test(line)) return false;
      // Remove lines that are just numbers (sometimes used for annotations)
      if (/^\d+$/.test(line)) return false;
      // Remove lines with just special characters or brackets
      if (/^[\[\]\(\)\{\}]+$/.test(line)) return false;
      return true;
    });
  
  return lines.join('\n');
}

module.exports = { searchSong, searchSongs, getLyricsFromUrl };
