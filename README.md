# Blendr

Blendr is a web application that allows users to search for and aggregate content from YouTube and Reddit. Users can save their favorite content and manage their selections.

## Features

- Search YouTube videos and Reddit threads simultaneously
- Sort results by relevance or date
- View thumbnails and publication dates for both YouTube videos and Reddit threads
- Save favorite content items
- User authentication (login/logout functionality)
- Responsive design for various screen sizes

## Technical Details

- Frontend: HTML, CSS, and vanilla JavaScript
- Backend: Node.js with Express.js
- APIs: YouTube Data API, Reddit JSON API
- Deployment: Heroku

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

## Recent Updates

- Changed app name from ContentHub to Blendr
- Implemented client-side Reddit API calls to avoid CORS issues
- Updated Content Security Policy to allow necessary resources and inline styles
- Added thumbnails and publication dates to search results
- Redesigned layout for better user experience
- Fixed various bugs related to event handling and favorites management

## Live Demo

You can view a live demo of the app here: https://blendr-app-2042e175ae6c.herokuapp.com/
