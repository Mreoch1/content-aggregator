console.log('Starting server.js');
const express = require('express');
console.log('Express loaded');
const path = require('path');
console.log('Path loaded');
const dotenv = require('dotenv');
console.log('Dotenv loaded');
const axios = require('axios');
console.log('Axios loaded');

// Load environment variables
dotenv.config();
console.log('Dotenv config applied');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Express app created');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/youtube', async (req, res) => {
  try {
    const { q } = req.query;
    console.log('YouTube API request:', { q });
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
        order: 'relevance', // Default to relevance
        maxResults: 20 // Increase to 20 to have more results for sorting
      }
    });
    console.log('YouTube API response:', response.data);
    res.json(response.data.items);
  } catch (error) {
    logError('YouTube API', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching YouTube data', details: error.message });
  }
});

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this route for testing
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
