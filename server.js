const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Function to log errors
function logError(source, error) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${source} Error: ${error}\n`;
  fs.appendFile('error_log.txt', errorMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  console.error(errorMessage);
}

app.get('/api/youtube', async (req, res) => {
  try {
    const { q, sort } = req.query;
    console.log('YouTube API request:', { q, sort });
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
        order: sort === 'date' ? 'date' : 'relevance',
        maxResults: 10
      }
    });
    console.log('YouTube API response:', response.data);
    res.json(response.data.items);
  } catch (error) {
    logError('YouTube API', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching YouTube data', details: error.message });
  }
});

app.get('/api/reddit', async (req, res) => {
  try {
    const { q, sort } = req.query;
    console.log('Reddit request:', { q, sort });
    const response = await axios.get(`https://www.reddit.com/search.json`, {
      params: {
        q,
        sort: sort === 'date' ? 'new' : 'relevance',
        limit: 10
      },
      headers: {
        'User-Agent': 'ContentHub/1.0 (https://contenthub-app-2042e175ae6c.herokuapp.com/)'
      }
    });
    console.log('Reddit response:', response.data);
    res.json(response.data.data.children);
  } catch (error) {
    logError('Reddit', error.response ? JSON.stringify(error.response.data) : error.message);
    if (error.response && error.response.status === 403) {
      res.status(500).json({ error: 'Error fetching Reddit data', details: 'Access forbidden. This might be due to rate limiting.' });
    } else {
      res.status(500).json({ error: 'Error fetching Reddit data', details: error.message });
    }
  }
});

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment variables:', process.env);
});
