import dotenv from 'dotenv';
import { PlaylistAnalyzer } from './utils/analysis';
import { PlaylistAnalysis, ComparisonResult } from './types/spotify';
import SpotifyApiService from './services/spotifyAPI';

dotenv.config();

class PlaylistComparisonApp {
    private apiService: SpotifyApiService;
    
    // Known Spotify-curated playlist IDs
    private curatedPlaylistIds = [
        '37i9dQZF1DXcBWIGoYBM5M',  // Today's Top Hits
        '37i9dQZF1DX0XUsuxWHRQd',  // RapCaviar
        '37i9dQZF1DX4JAvHpjipBk',  // New Music Friday
        '37i9dQZF1DX10zKzsJ2jva',  // Viva Latino
        '37i9dQZF1DX4sWSpwq3LiO'   // Peaceful Piano
    ];

    constructor() {
        this.apiService = new SpotifyApiService({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!
        });
    }

    private async analyzePlaylist(playlistId: string, isCurated: boolean): Promise<PlaylistAnalysis> {
        try {
            // Fetch playlist details
            const playlist = await this.apiService.getPlaylistDetails(playlistId);
            
            // Fetch all tracks (handling pagination)
            const tracks = await this.fetchAllTracks(playlistId);
            playlist.tracks.items = tracks;

            // Get audio features for all tracks
            const trackIds = tracks
                .map(item => item.track.id)
                .filter(id => id !== null);
            const audioFeatures = await this.apiService.getTracksAudioFeatures(trackIds);

            // Analyze the playlist
            return await PlaylistAnalyzer.analyzePlaylist(playlist, audioFeatures, isCurated);
        } catch (error) {
            console.error(`Error analyzing playlist ${playlistId}:`, error);
            throw error;
        }
    }

    private async fetchAllTracks(playlistId: string) {
        const limit = 100;
        let offset = 0;
        let allTracks = [];
        
        while (true) {
            const response = await this.apiService.getPlaylistTracks(playlistId, { limit, offset });
            allTracks.push(...response.items);
            
            if (response.items.length < limit) break;
            offset += limit;
        }
        
        return allTracks;
    }

    private async findPopularUserPlaylists(): Promise<string[]> {
        // Search for popular user playlists using relevant terms
        const searchTerms = ['top', 'best', 'popular', 'hits', 'favorite'];
        const playlistIds = new Set<string>();
        
        for (const term of searchTerms) {
            const results = await this.apiService.searchPlaylists(term, { limit: 10 });
            //const detailedResults = await this.apiService.getPlaylistDetails()
            
            for (const playlist of results.playlists.items) {
                const detailedPlaylist = await this.apiService.getPlaylistDetails(playlist.id);
                if (!playlist.owner.id.includes('spotify') &&
                    detailedPlaylist.followers.total > 10000 &&
                    !this.curatedPlaylistIds.includes(playlist.id)
                ) {
                    playlistIds.add(playlist.id)
                    if (playlistIds.size >= 5) break;
                }
            }
        }
        
        return Array.from(playlistIds).slice(0, 5);
    }

    public async runComparison(): Promise<ComparisonResult> {
        try {
            console.log('Starting playlist comparison...');

            // Analyze curated playlists
            console.log('Analyzing curated playlists...');
            const curatedAnalyses = await Promise.all(
                this.curatedPlaylistIds.map(id => this.analyzePlaylist(id, true))
            );

            // Find and analyze user playlists
            console.log('Finding popular user playlists...');
            const userPlaylistIds = await this.findPopularUserPlaylists();
            
            console.log('Analyzing user playlists...');
            const userAnalyses = await Promise.all(
                userPlaylistIds.map(id => this.analyzePlaylist(id, false))
            );

            // Compare the results
            console.log('Generating comparison...');
            const comparison = PlaylistAnalyzer.comparePlaylistGroups(
                curatedAnalyses,
                userAnalyses
            );

            return comparison;
        } catch (error) {
            console.error('Error running comparison:', error);
            throw error;
        }
    }
}

export default PlaylistComparisonApp;
