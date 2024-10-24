import axios, { AxiosError } from 'axios';
import SpotifyAuthService from './spotifyAuth';

interface SpotifyApiConfig {
    clientId: string;
    clientSecret: string;
}

interface PaginationParams {
    limit?: number;
    offset?: number;
}

interface SpotifyImage {
    url: string;
    height: number | null;
    width: number | null;
}

interface SpotifyUser {
    id: string;
    display_name: string;
    type: 'user';
    followers? : number;
}

interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    followers: {
        total: number;
    };
    images: SpotifyImage[];
    owner: SpotifyUser;
    tracks: {
        total: number;
        items: SpotifyPlaylistTrack[];
    };
    public: boolean;
    collaborative: boolean;
    snapshot_id: string;
}

interface SimplifiedSpotifyPlaylist {
    id: string;
    name: string;
    description: string;    
    images: SpotifyImage[];
    owner: SpotifyUser;
    tracks: {
        total: number;
        items: SpotifyPlaylistTrack[];
    };
    public: boolean;
    collaborative: boolean;
    snapshot_id: string;
}

interface SpotifyPlaylistTrack {
    added_at: string;
    track: SpotifyTrack;
}

interface SpotifyTrack {
    id: string;
    name: string;
    popularity: number;
    duration_ms: number;
    explicit: boolean;
    artists: {
        id: string;
        name: string;
    }[];
}

interface AudioFeatures {
    id: string;
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    duration_ms: number;
    time_signature: number;
}

interface AudioFeaturesResponse {
    audio_features: AudioFeatures[];
}

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    previous: string | null;
    next: string | null;
}

interface FeaturedPlaylistsResponse {
    message: string;
    playlists: PaginatedResponse<SpotifyPlaylist>;
}

interface CategoryPlaylistsResponse {
    playlists: PaginatedResponse<SpotifyPlaylist>;
}

interface PlaylistTracksResponse extends PaginatedResponse<SpotifyPlaylistTrack> {}

interface SearchResponse {
    playlists: PaginatedResponse<SimplifiedSpotifyPlaylist>;
}

class SpotifyApiService {
    private authService: SpotifyAuthService;
    private baseUrl = 'https://api.spotify.com/v1';

    constructor(config: SpotifyApiConfig) {
        this.authService = new SpotifyAuthService(config);
    }

    private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        try {
            const headers = await this.authService.getAuthenticatedHeaders();
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                headers,
                params,
            });
            if (response.data.followers != null){                
                const parts = endpoint.split('/');
                const playlistId = parts[parts.length - 1];
                console.log(`Playlist ${playlistId} has ${response.data.followers.total} followers`)
            }
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const status = error.response?.status;
                const message = error.response?.data?.error?.message || error.message;

                switch (status) {
                    case 429:
                        throw new Error(`Rate limit exceeded. Try again later.`);
                    case 401:
                        throw new Error(`Authentication error: ${message}`);
                    case 403:
                        throw new Error(`Forbidden: ${message}`);
                    case 404:
                        throw new Error(`Resource not found: ${message}`);
                    default:
                        throw new Error(`API request failed: ${message}`);
                }
            }
            throw error;
        }
    }

    async getFeaturedPlaylists(params?: PaginationParams): Promise<FeaturedPlaylistsResponse> {
        return this.request<FeaturedPlaylistsResponse>('/browse/featured-playlists', params);
    }

    async getCategoryPlaylists(
        categoryId: string, 
        params?: PaginationParams
    ): Promise<CategoryPlaylistsResponse> {
        return this.request<CategoryPlaylistsResponse>(
            `/browse/categories/${categoryId}/playlists`, 
            params
        );
    }

    async getPlaylistDetails(playlistId: string): Promise<SpotifyPlaylist> {
        return this.request<SpotifyPlaylist>(`/playlists/${playlistId}`);
    }

    async getPlaylistTracks(
        playlistId: string, 
        params?: PaginationParams
    ): Promise<PlaylistTracksResponse> {
        return this.request<PlaylistTracksResponse>(`/playlists/${playlistId}/tracks`, params);
    }

    async getTracksAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
        const chunks = trackIds.reduce((acc: string[][], id, i) => {
            const chunkIndex = Math.floor(i / 100);
            if (!acc[chunkIndex]) acc[chunkIndex] = [];
            acc[chunkIndex].push(id);
            return acc;
        }, []);

        const features = await Promise.all(
            chunks.map(chunk =>
                this.request<AudioFeaturesResponse>('/audio-features', {
                    ids: chunk.join(','),
                })
            )
        );

        return features.flatMap(response => response.audio_features);
    }

    async searchPlaylists(
        query: string, 
        params?: PaginationParams
    ): Promise<SearchResponse> {
        return this.request<SearchResponse>('/search', {
            ...params,
            q: query,
            type: 'playlist',
        });
    }
}

export default SpotifyApiService;