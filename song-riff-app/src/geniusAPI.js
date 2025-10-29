import axios from 'axios';

const API_KEY = 'kqhcoSkHpD9jGZ3KuGdAjvN8QSSomPo09Oz-oHDPKFm1OyFvX9S-w_zNtpSJ0svo';
const BASE_URL = 'https://api.genius.com';

export async function searchSong(songTitle) {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      params: { q: songTitle },
    });
    const hits = response.data.response.hits;
    if (hits.length > 0) {
      return hits[0].result.url;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error searching song:', err.message);
    return null;
  }
}

export async function getLyrics(url) {
  try {
    const { data } = await axios.get(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    let lyrics = doc.querySelector('[data-lyrics-container="true"]')?.innerText || '';
    return lyrics.trim();
  } catch (err) {
    console.error('Error fetching lyrics:', err.message);
    return null;
  }
}
