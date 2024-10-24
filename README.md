
# Spotify Playlist Analyzer

This project is a Spotify Playlist Analyzer that utilizes the Spotify API to analyze audio features of tracks in a given playlist.

## Features

- Fetches audio features like danceability, energy, valence, tempo, acousticness, and instrumentalness of tracks in a playlist.
- Calculates the average of these audio features for a given playlist.
- Designed to be extended with additional analysis functionality.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mganopolsky/spotify-playlist-analyzer.git
   ```

2. Navigate to the project directory:

   ```bash
   cd spotify-playlist-analyzer
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Setup

You will need to create a `.env` (temple `.env_template` is available) file in the root of the project with your Spotify API credentials; 

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

These credentials can be obtained by creating an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).

## Usage

1. Run the application:

   ```bash
   npm start
   ```

2. The app will fetch and analyze audio features for the specified playlist and output the results.

## Running Tests

The project uses **Jest** for testing. The test files are located in the `src/test` directory.

To run the tests, use the following command:

```bash
npm test
```

If you want to view test coverage, use:

```bash
npx jest --coverage
```

### Project Structure

The main code is located in the `src` folder, and the test files are located in the `src/test` folder.

```
spotify-playlist-analyzer/
├── src/
│   ├── index.ts              # Main entry point
│   ├── services/             # Spotify API services
│   ├── utils/                # Utility functions
│   └── test/                 # Unit tests
├── .env                      # Environment variables (not included in the repo)
├── package.json              # Dependencies and scripts
├── jest.config.js            # Jest configuration
└── README.md                 # Project documentation
```

## API Integration

This project uses the Spotify Web API to fetch data. The main API endpoint used is:

- **Playlists Audio Features**: Fetches the audio features of a playlist.
  - `GET https://api.spotify.com/v1/playlists/{playlist_id}`

## TODO: 
    - The next order of business is to upload data back to Spotify

## License

This project is licensed under the MIT License.
