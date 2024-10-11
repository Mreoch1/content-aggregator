document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', performSearch);
});

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
            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">
                ${video.snippet.title}
            </a>
        </li>
    `).join('');

    redditList.innerHTML = redditResults.map(thread => `
        <li>
            <a href="https://www.reddit.com${thread.data.permalink}" target="_blank">
                ${thread.data.title}
            </a>
        </li>
    `).join('');
}
