
//dummy File class for Node.js so it works well in server environment
if (typeof File === 'undefined') global.File = class {};

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

//imports lyrics route, lyricsRoute has all logic needed to search songs and get lyrics 
const lyricsRoute = require('./routes/lyrics');

//creates app and allows for cross origin ports 
const app = express();
app.use(cors());
app.use(express.json());

//connects lyrics route file to server, any request to /lyrics will go to that file
//example GET request http://localhost:5050/lyrics?q=hello will go to the lyrics route 
app.use('/lyrics', lyricsRoute);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
