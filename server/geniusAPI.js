const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config(); // loads vars in env file 

const API_KEY = process.env.GENIUS_API_KEY;
const BASE_URL = 'https://api.genius.com';

async function searchSong(songTitle) {
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

async function getLyrics(url) {
  try {
    const { data } = await axios.get(url);
    console.log("HTML fetched");
    console.log(data.substring(0, 1000));
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    let lyrics = doc.querySelector('[data-lyrics-container="true"]')?.innerText || '';
    return lyrics.trim();
  } catch (err) {
    console.error('Error fetching lyrics:', err.message);
    return null;
  }
}

searchSong('Hello').then(async (url) => {
  console.log('Song URL:', url);
  const html = await getLyrics(url);
});
