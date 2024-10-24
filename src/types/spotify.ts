export interface SpotifyImage {
    url: string;
    height: number | null;
    width: number | null;
}

export interface SpotifyUser {
    id: string;
    display_name: string;
    type: 'user';
}

export interface SpotifyPlaylist {
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

export interface SpotifyPlaylistTrack {
    added_at: string;
    track: SpotifyTrack;
}

export interface SpotifyTrack {
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

export interface AudioFeatures {
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

export interface PlaylistAnalysis {
    playlistId: string;
    playlistName: string;
    isCurated: boolean;
    metrics: {
        followerCount: number;
        trackCount: number;
        averagePopularity: number;
        descriptionLength: number;
        lastUpdated: string;
        audioFeatureAverages : {
            danceability: number;
            energy: number;
            valence: number;
            tempo: number;
            acousticness: number;
            instrumentalness: number;
        };
        popularityDistribution: {
            high: number;    // % tracks with popularity > 70
            medium: number;  // % tracks with popularity 30-70
            low: number;    // % tracks with popularity < 30
        };
        updateFrequency?: number; // average days between updates
    };
}

export interface ComparisonResult {
    curatedPlaylists: PlaylistAnalysis[];
    userPlaylists: PlaylistAnalysis[];
    aggregateComparison: {
        averageFollowers: {
            curated: number;
            user: number;
        };
        averageTrackPopularity: {
            curated: number;
            user: number;
        };        
        audioFeatures: {
            curated: Record<string, number>;
            user: Record<string, number>;
        };
    };
}
