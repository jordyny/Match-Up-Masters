if (typeof File === 'undefined') global.File = class {};

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const lyricsRoute = require('./routes/lyrics');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/lyrics', lyricsRoute);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
