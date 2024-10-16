# Blendr

Blendr is a web application that allows users to search for and aggregate content from YouTube and Reddit. Users can save their favorite content and manage their selections.

## Features

- Search YouTube videos and Reddit threads simultaneously
- Sort results by relevance or date
- View thumbnails and publication dates for both YouTube videos and Reddit threads
- Save favorite content items
- User authentication (login/logout functionality)
- Responsive design for various screen sizes
- Consistent layout across different zoom levels

## Technical Details

- Frontend: HTML, CSS, and vanilla JavaScript
- Backend: Node.js with Express.js
- APIs: YouTube Data API, Reddit JSON API
- Deployment: Heroku

## Recent Updates

- Improved layout responsiveness and alignment
- Added placeholder text in search box and result areas
- Implemented 'Enter' key functionality for search and login
- Enhanced display of Reddit threads
- Fixed alignment issues with "Add to Favorites" buttons
- Updated Node.js version to 18.x to resolve deployment issues

## Setup and Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in a `.env` file:
   - `PORT`: The port number for the server (default: 3000)
   - `YOUTUBE_API_KEY`: Your YouTube Data API key
4. Run locally: `npm start`
5. Deploy to Heroku:
   - Create a new Heroku app
   - Set the `YOUTUBE_API_KEY` config var in Heroku
   - Push the code to Heroku
   - Note: The app will use Heroku-24 stack on the next deployment

## Troubleshooting

If you encounter deployment issues:
1. Ensure Node.js version in `package.json` is set to a current LTS version (e.g., "18.x")
2. Delete `node_modules` and `package-lock.json`
3. Clear npm cache: `npm cache clean --force`
4. Reinstall dependencies: `npm install`
5. Commit changes and redeploy

## Live Demo

You can view a live demo of the app here: https://blendr-new-8af86a1d227b.herokuapp.com/

Note: The app is currently using Heroku-22 stack but will upgrade to Heroku-24 on the next deployment.

## Version

Current version: 1.0.1
