document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sortSelect = document.getElementById('sortSelect');
    const youtubeList = document.getElementById('youtubeList');
    const redditList = document.getElementById('redditList');
    const loginButton = document.getElementById('loginButton');
    const usernameInput = document.getElementById('usernameInput');
    const favoritesList = document.getElementById('favoritesList');
    const loginSection = document.getElementById('loginSection');
    const profileSection = document.getElementById('profileSection');
    const profileCircle = document.getElementById('profileCircle');

    let currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        showLoggedInState(currentUser);
    }

    loginButton.addEventListener('click', login);
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    sortSelect.addEventListener('change', performSearch);

    function login() {
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            showLoggedInState(currentUser);
        } else {
            alert('Please enter a username');
        }
    }

    function showLoggedInState(username) {
        loginSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
        profileCircle.textContent = username[0].toUpperCase();
        loadFavorites();
    }

    async function performSearch() {
        const query = searchInput.value;
        const sort = sortSelect.value;
        if (!query) return;

        try {
            const [youtubeVideos, redditThreads] = await Promise.all([
                fetchYouTubeVideos(query, sort),
                fetchRedditThreads(query, sort)
            ]);

            displayContent(youtubeList, youtubeVideos, displayYouTubeVideo);
            displayContent(redditList, redditThreads, displayRedditThread);
        } catch (error) {
            console.error('Error performing search:', error);
            alert('An error occurred while searching. Please try again.');
        }
    }

    async function fetchYouTubeVideos(query, sort) {
        const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&sort=${sort}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('YouTube API Error:', errorText);
            throw new Error(`Failed to fetch YouTube videos: ${response.statusText}`);
        }
        return await response.json();
    }

    async function fetchRedditThreads(query, sort) {
        const response = await fetch(`/api/reddit?q=${encodeURIComponent(query)}&sort=${sort}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Reddit Error:', errorText);
            throw new Error(`Failed to fetch Reddit threads: ${response.statusText}`);
        }
        return await response.json();
    }

    function displayContent(container, items, itemDisplayFunction) {
        if (items.length === 0) {
            container.innerHTML = '<p>No results found.</p>';
            return;
        }
        container.innerHTML = items.map(item => itemDisplayFunction(item)).join('');
    }

    function displayYouTubeVideo(video) {
        const isFavorite = currentUser && isFavoriteItem('youtube', video.id.videoId);
        const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        const publishedDate = new Date(video.snippet.publishedAt).toLocaleDateString();
        return `
            <div class="youtube-item p-4 mb-4 bg-white rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">${video.snippet.title}</h3>
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" class="w-full mb-2">
                <p class="text-sm text-gray-600 mb-2">${video.snippet.channelTitle}</p>
                <p class="text-sm text-gray-500 mb-2">Published: ${publishedDate}</p>
                <a href="${videoUrl}" target="_blank" class="text-indigo-500 hover:underline">Watch Video</a>
                ${currentUser ? `<button onclick="toggleFavorite('youtube', '${video.id.videoId}', '${video.snippet.title.replace(/'/g, "\\'")}', '${videoUrl}')" class="ml-2 text-indigo-500 hover:underline">${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>` : ''}
            </div>
        `;
    }

    function displayRedditThread(thread) {
        const isFavorite = currentUser && isFavoriteItem('reddit', thread.data.id);
        const threadUrl = `https://www.reddit.com${thread.data.permalink}`;
        const createdDate = new Date(thread.data.created_utc * 1000).toLocaleDateString();
        return `
            <div class="reddit-item p-4 mb-4 bg-white rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">${thread.data.title}</h3>
                <p class="text-sm text-gray-600 mb-2">${thread.data.subreddit_name_prefixed} | Score: ${thread.data.score} | Comments: ${thread.data.num_comments}</p>
                <p class="text-sm text-gray-500 mb-2">Created: ${createdDate}</p>
                <a href="${threadUrl}" target="_blank" class="text-indigo-500 hover:underline">View Thread</a>
                ${currentUser ? `<button onclick="toggleFavorite('reddit', '${thread.data.id}', '${thread.data.title.replace(/'/g, "\\'")}', '${threadUrl}')" class="ml-2 text-indigo-500 hover:underline">${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>` : ''}
            </div>
        `;
    }

    function toggleFavorite(type, id, title, url) {
        if (!currentUser) {
            alert('Please log in to add favorites');
            return;
        }
        const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`) || '{}');
        if (!favorites[type]) favorites[type] = [];
        const index = favorites[type].findIndex(item => item.id === id);
        if (index > -1) {
            favorites[type].splice(index, 1);
        } else {
            favorites[type].push({ id, title, url });
        }
        localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites));
        loadFavorites();
        
        // Refresh the current search results to update the "Add/Remove from Favorites" buttons
        performSearch();
    }

    function isFavoriteItem(type, id) {
        const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`) || '{}');
        return favorites[type] && favorites[type].some(item => item.id === id);
    }

    function loadFavorites() {
        if (!currentUser) {
            favoritesList.innerHTML = '<p>Please log in to see favorites</p>';
            return;
        }
        const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`) || '{}');
        const favoritesHtml = Object.entries(favorites).map(([type, items]) => {
            return items.map(item => `
                <div class="favorite-item p-2 bg-white rounded shadow mb-2">
                    <a href="${item.url}" target="_blank" class="text-indigo-500 hover:underline">
                        ${type === 'youtube' ? '🎥' : '📄'} ${item.title}
                    </a>
                    <button onclick="toggleFavorite('${type}', '${item.id}', '${item.title.replace(/'/g, "\\'")}', '${item.url}')" class="ml-2 text-red-500 hover:underline">Remove</button>
                </div>
            `).join('');
        }).join('');
        favoritesList.innerHTML = favoritesHtml || '<p>No favorites yet</p>';
    }

    // Make toggleFavorite globally accessible
    window.toggleFavorite = toggleFavorite;
});
