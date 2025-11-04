const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// loads variables from env file 
dotenv.config() 
const GENIUS_API_KEY = process.env.GENIUS_API_KEY
//make web server with Express 
const app = express();
const PORT = process.env.PORT || 5000;

//allows different browser ports to run at the same time 
app.use(cors());
app.use(express.json());

console.log('API starts with:', GENIUS_API_KEY.slice(0, 10));

async function testGeniusAPI() {
    const URL = 'https://api.genius.com';
    const test = "Hello"

    try {
        const response = await axios.get(`${URL}/search`, {
            headers: { Authorization: `Bearer ${GENIUS_API_KEY}` },
            params: {q: test} ,
        }
        );
        const hits = response.data.response.hits;
        console.log("API call suceess");
        console.log("First title:", hits[0]?.result?.full_title);
    } catch (error) {
        console.log("API key failed")
    }
}

testGeniusAPI();
