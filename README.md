# ContentHub

ContentHub is a web-based content aggregator that pulls videos from YouTube and threads from Reddit based on user search queries.

## Features

- Search for YouTube videos and Reddit threads simultaneously
- Display results side by side with publication dates
- Sort results by relevance or date
- Simple user authentication with persistent sessions
- Save favorite videos and threads
- Responsive design for both desktop and mobile use

## Technology Stack

- Backend: Node.js with Express
- Frontend: HTML, CSS (Tailwind CSS), and Vanilla JavaScript
- APIs: 
  - YouTube Data API v3 (for video search)
  - Reddit JSON endpoint (for thread search)
- Local Storage for user preferences and favorites

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/Mreoch1/content-aggregator.git
   cd content-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. Start the server:
   ```
   npm start
   ```

5. For development with auto-restart on file changes:
   ```
   npm run dev
   ```

6. Open a web browser and navigate to `http://localhost:3000`

## Usage

1. Enter a username to log in
2. Enter a search query in the input field
3. Select sorting preference (relevance or date)
4. Click the "Search" button or press Enter
5. View the results from YouTube and Reddit
6. Click on video or thread links to view the original content
7. Save items to favorites for quick access later

## Project Structure

- `server.js`: Main server file with API endpoints
- `public/index.html`: Main HTML file
- `public/styles.css`: CSS styles (including Tailwind CSS)
- `public/app.js`: Frontend JavaScript

## Contributing

Please read the `best_practices.txt` file for our coding standards and best practices.

## License

This project is open source and available under the MIT License.
