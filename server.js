const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const open = require('open');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Log the API key (for debugging purposes only, remove in production)
console.log('YouTube API Key:', process.env.YOUTUBE_API_KEY);

app.use(express.static('public'));
app.use(express.json());

// In-memory user profiles (replace with a database in a production environment)
const userProfiles = {};

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message, details: error.message });
};

app.get('/api/youtube', async (req, res) => {
  try {
    const { q, sort } = req.query;
    const cacheKey = `youtube_${q}_${sort}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return res.json(cachedResult);
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `"${q}"`, // Use quotes to search for the exact phrase
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
        maxResults: 10,
        order: sort === 'date' ? 'date' : 'relevance',
        relevanceLanguage: 'en', // Prioritize English results
        safeSearch: 'moderate' // Exclude adult content
      }
    });

    const videos = response.data.items.map(item => ({
      ...item,
      snippet: {
        ...item.snippet,
        publishedAt: new Date(item.snippet.publishedAt).toISOString()
      }
    }));

    cache.set(cacheKey, videos);
    res.json(videos);
  } catch (error) {
    handleError(res, error, 'Error fetching YouTube data');
  }
});

app.get('/api/reddit', async (req, res) => {
  try {
    const { q, sort } = req.query;
    console.log(`Fetching Reddit threads for query: "${q}", sort: ${sort}`);
    const cacheKey = `reddit_${q}_${sort}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      console.log('Returning cached Reddit results');
      return res.json(cachedResult);
    }

    // Simplify the Reddit search query
    const response = await axios.get(`https://www.reddit.com/search.json`, {
      params: {
        q: q, // Remove encodeURIComponent to allow Reddit to handle the query
        sort: sort === 'date' ? 'new' : 'relevance',
        limit: 10
      },
      headers: {
        'User-Agent': 'ContentHub/1.0'
      }
    });

    console.log('Reddit data received');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data && response.data.data.children) {
      const threads = response.data.data.children;
      console.log(`Found ${threads.length} Reddit threads`);
      cache.set(cacheKey, threads);
      res.json(threads);
    } else {
      console.log('No threads found in the response');
      res.json([]);
    }
  } catch (error) {
    handleError(res, error, 'Error fetching Reddit data');
  }
});

app.post('/api/profile/save', (req, res) => {
  const { userId, item } = req.body;
  if (!userProfiles[userId]) {
    userProfiles[userId] = { favorites: [] };
  }
  userProfiles[userId].favorites.push(item);
  res.json({ success: true });
});

app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(userProfiles[userId] || { favorites: [] });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let isWindowOpen = false;

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!isWindowOpen) {
      open(`http://localhost:${PORT}`, {app: {name: open.apps.chrome}}).then(() => {
        isWindowOpen = true;
      });
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log('Port is already in use. Trying again...');
      setTimeout(() => {
        server.close();
        startServer();
      }, 1000);
    } else {
      console.error('Server error:', error);
    }
  });
}

startServer();

app.get('/api/reddit-test', async (req, res) => {
    try {
        const response = await axios.get('https://www.reddit.com/r/popular.json', {
            headers: {
                'User-Agent': 'ContentHub/1.0'
            }
        });
        res.json(response.data.data.children.slice(0, 5));
    } catch (error) {
        console.error('Reddit Test API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error fetching Reddit test data', details: error.message });
    }
});
