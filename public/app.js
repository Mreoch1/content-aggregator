let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const loginButton = document.getElementById('loginButton');
    const searchInput = document.getElementById('searchInput');
    const usernameInput = document.getElementById('usernameInput');

    searchButton.addEventListener('click', performSearch);
    loginButton.addEventListener('click', login);
    loginButton.addEventListener('touchend', function(event) {
        event.preventDefault(); // Prevent double-firing on touch devices
        login(event);
    });

    // Add event listeners for 'Enter' key
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    usernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            login();
        }
    });

    // Check if user is already logged in
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        login(savedUsername);
    }
    toggleLoginPrompt();
});

function login(event) {
    event.preventDefault(); // Prevent default form submission
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('username', username);
        document.getElementById('loginContainer').innerHTML = `Welcome, ${username}! <button id="logoutButton" class="btn">Logout</button>`;
        document.getElementById('favoritesContainer').style.display = 'block';
        document.getElementById('logoutButton').addEventListener('click', logout);
        document.getElementById('logoutButton').addEventListener('touchend', logout);
        loadFavorites();
        toggleLoginPrompt();
    }
}

function logout(event) {
    event.preventDefault(); // Prevent default button action
    currentUser = null;
    localStorage.removeItem('username');
    const loginContainer = document.getElementById('loginContainer');
    loginContainer.innerHTML = `
        <form id="loginForm">
            <input type="text" id="usernameInput" placeholder="Username">
            <button type="submit" id="loginButton" class="btn btn-primary">Login</button>
        </form>
    `;
    document.getElementById('favoritesContainer').style.display = 'none';
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('loginButton').addEventListener('touchend', function(event) {
        event.preventDefault();
        login(event);
    });
    document.getElementById('favoritesList').innerHTML = '<li class="placeholder">Your favorite content will appear here after you log in and add items.</li>';
    toggleLoginPrompt();
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || [];
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = favorites.map(item => `
        <li>
            <img src="${item.thumbnail}" alt="${item.title}">
            <div class="content">
                <a href="${item.url}" target="_blank">${item.title}</a>
                <div class="date">${item.date}</div>
            </div>
            <button class="add-favorite-btn" data-id="${item.id}">Remove</button>
        </li>
    `).join('');
    favoritesList.addEventListener('click', handleFavoriteClick);
}

function handleFavoriteClick(event) {
    if (event.target.classList.contains('add-favorite-btn')) {
        const id = event.target.getAttribute('data-id');
        removeFavorite(id);
    }
}

function addFavorite(id, title, url, thumbnail, date) {
    if (!currentUser) {
        alert('Please log in to add favorites.');
        return;
    }
    const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || [];
    if (!favorites.some(item => item.id === id)) {
        favorites.push({ id, title, url, thumbnail, date });
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

    youtubeList.innerHTML = youtubeResults.length ? youtubeResults.map(video => `
        <li>
            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
            <div class="content">
                <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">${video.snippet.title}</a>
                <div class="date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
            </div>
            <button class="add-favorite-btn" data-id="yt_${video.id.videoId}" data-title="${video.snippet.title}" data-url="https://www.youtube.com/watch?v=${video.id.videoId}" data-thumbnail="${video.snippet.thumbnails.medium.url}" data-date="${new Date(video.snippet.publishedAt).toLocaleDateString()}">Add to Favorites</button>
        </li>
    `).join('') : '<li class="placeholder">No YouTube videos found for this search.</li>';

    redditList.innerHTML = redditResults.length ? redditResults.map(thread => `
        <li>
            <img src="${thread.data.thumbnail && thread.data.thumbnail !== 'self' ? thread.data.thumbnail : 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png'}" alt="${thread.data.title}">
            <div class="content">
                <a href="https://www.reddit.com${thread.data.permalink}" target="_blank">${thread.data.title}</a>
                <div class="date">${new Date(thread.data.created_utc * 1000).toLocaleDateString()}</div>
            </div>
            <button class="add-favorite-btn" data-id="rd_${thread.data.id}" data-title="${thread.data.title}" data-url="https://www.reddit.com${thread.data.permalink}" data-thumbnail="${thread.data.thumbnail && thread.data.thumbnail !== 'self' ? thread.data.thumbnail : 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png'}" data-date="${new Date(thread.data.created_utc * 1000).toLocaleDateString()}">Add to Favorites</button>
        </li>
    `).join('') : '<li class="placeholder">No Reddit threads found for this search.</li>';

    youtubeList.addEventListener('click', handleResultClick);
    redditList.addEventListener('click', handleResultClick);
}

function handleResultClick(event) {
    if (event.target.classList.contains('add-favorite-btn')) {
        const { id, title, url, thumbnail, date } = event.target.dataset;
        addFavorite(id, title, url, thumbnail, date);
    }
}

function toggleLoginPrompt() {
    const loginPrompt = document.getElementById('loginPrompt');
    loginPrompt.style.display = currentUser ? 'none' : 'block';
}
