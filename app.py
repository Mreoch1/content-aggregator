from flask import Flask, render_template, request
from src.youtube.youtube_fetcher import fetch_youtube_videos
from src.reddit.reddit_fetcher import fetch_reddit_threads

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    youtube_videos = []
    reddit_threads = []
    if request.method == 'POST':
        youtube_query = request.form.get('youtube_query')
        subreddit_name = request.form.get('subreddit_name')
        
        if youtube_query:
            youtube_videos = fetch_youtube_videos(youtube_query)
        if subreddit_name:
            reddit_threads = fetch_reddit_threads(subreddit_name)
    
    return render_template('index.html', youtube_videos=youtube_videos, reddit_threads=reddit_threads)

if __name__ == '__main__':
    app.run(debug=True)