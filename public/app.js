let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const loginButton = document.getElementById('loginButton');

    searchButton.addEventListener('click', performSearch);
    loginButton.addEventListener('click', login);

    // Check if user is already logged in
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        login(savedUsername);
    }
});

function login() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('username', username);
        document.getElementById('loginContainer').innerHTML = `Welcome, ${username}! <button id="logoutButton" class="btn">Logout</button>`;
        document.getElementById('favoritesContainer').style.display = 'block';
        document.getElementById('logoutButton').addEventListener('click', logout);
        loadFavorites();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('username');
    document.getElementById('loginContainer').innerHTML = `
        <input type="text" id="usernameInput" placeholder="Username">
        <button id="loginButton" class="btn btn-primary">Login</button>
    `;
    document.getElementById('favoritesContainer').style.display = 'none';
    document.getElementById('loginButton').addEventListener('click', login);
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || [];
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = favorites.map(item => `
        <li>
            <a href="${item.url}" target="_blank">${item.title}</a>
            <button onclick="removeFavorite('${item.id}')" class="add-favorite-btn">Remove</button>
        </li>
    `).join('');
}

function addFavorite(id, title, url) {
    if (!currentUser) {
        alert('Please log in to add favorites.');
        return;
    }
    const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || [];
    if (!favorites.some(item => item.id === id)) {
        favorites.push({ id, title, url });
        localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites));
        loadFavorites();
    }
}

function removeFavorite(id) {
    if (!currentUser) return;
    let favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || [];
    favorites = favorites.filter(item => item.id !== id);
    localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites));
    loadFavorites();
}

async function fetchYouTubeVideos(query, sort) {
    const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&sort=${sort}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch YouTube videos: ${response.statusText}`);
    }
    return await response.json();
}

async function fetchRedditThreads(query, sort) {
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=${sort === 'date' ? 'new' : 'relevance'}&limit=10`);
    if (!response.ok) {
        throw new Error(`Failed to fetch Reddit threads: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.children;
}

async function performSearch() {
    const query = document.getElementById('searchInput').value;
    const sort = document.getElementById('sortSelect').value;
    
    try {
        const [youtubeResults, redditResults] = await Promise.all([
            fetchYouTubeVideos(query, sort),
            fetchRedditThreads(query, sort)
        ]);

        displayResults(youtubeResults, redditResults);
    } catch (error) {
        console.error('Error performing search:', error);
        document.getElementById('youtubeList').innerHTML = '<li>Error fetching YouTube results</li>';
        document.getElementById('redditList').innerHTML = '<li>Error fetching Reddit results</li>';
    }
}

function displayResults(youtubeResults, redditResults) {
    const youtubeList = document.getElementById('youtubeList');
    const redditList = document.getElementById('redditList');

    youtubeList.innerHTML = youtubeResults.map(video => `
        <li>
            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">${video.snippet.title}</a>
            <button onclick="addFavorite('yt_${video.id.videoId}', '${video.snippet.title}', 'https://www.youtube.com/watch?v=${video.id.videoId}')" class="add-favorite-btn">Add to Favorites</button>
        </li>
    `).join('');

    redditList.innerHTML = redditResults.map(thread => `
        <li>
            <a href="https://www.reddit.com${thread.data.permalink}" target="_blank">${thread.data.title}</a>
            <button onclick="addFavorite('rd_${thread.data.id}', '${thread.data.title}', 'https://www.reddit.com${thread.data.permalink}')" class="add-favorite-btn">Add to Favorites</button>
        </li>
    `).join('');
}
