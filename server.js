const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Your API routes go here
app.get('/api/youtube', async (req, res) => {
  try {
    const { q, sort } = req.query;
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
    res.json(response.data.items);
  } catch (error) {
    console.error('YouTube API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching YouTube data', details: error.message });
  }
});

app.get('/api/reddit', async (req, res) => {
  try {
    const { q, sort } = req.query;
    const response = await axios.get(`https://www.reddit.com/search.json`, {
      params: {
        q,
        sort: sort === 'date' ? 'new' : 'relevance',
        limit: 10
      }
    });
    res.json(response.data.data.children);
  } catch (error) {
    console.error('Reddit API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching Reddit data', details: error.message });
  }
});

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
