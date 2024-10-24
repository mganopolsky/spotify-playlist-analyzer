// src/utils/analysis.ts

import { 
    SpotifyPlaylist, 
    SpotifyTrack, 
    AudioFeatures, 
    PlaylistAnalysis,
    ComparisonResult 
} from '../types/spotify';

export class PlaylistAnalyzer {
    private static calculateAverages(numbers: number[]): number {
        return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
    }

    private static calculatePopularityDistribution(tracks: SpotifyTrack[]) {
        const total = tracks.length;
        const distribution = tracks.reduce(
            (acc, track) => {
                if (track.popularity > 70) acc.high++;
                else if (track.popularity > 30) acc.medium++;
                else acc.low++;
                return acc;
            },
            { high: 0, medium: 0, low: 0 }
        );

        return {
            high: (distribution.high / total) * 100,
            medium: (distribution.medium / total) * 100,
            low: (distribution.low / total) * 100,
        };
    }

    private static calculateAudioFeatureAverages(features: (AudioFeatures | null)[]) {
        return {
            danceability: this.calculateAverages(features.filter(f => f !== null).map(f => f.danceability)),
            energy: this.calculateAverages(features.filter(f => f !== null).map(f => f.energy)),
            valence: this.calculateAverages(features.filter(f => f !== null).map(f => f.valence)),
            tempo: this.calculateAverages(features.filter(f => f !== null).map(f => f.tempo)),
            acousticness: this.calculateAverages(features.filter(f => f !== null).map(f => f.acousticness)),
            instrumentalness: this.calculateAverages(features.filter(f => f !== null).map(f => f.instrumentalness)),
        };
    }

    static async analyzePlaylist(
        playlist: SpotifyPlaylist,
        audioFeatures: AudioFeatures[],
        isCurated: boolean
    ): Promise<PlaylistAnalysis> {
        const tracks = playlist.tracks.items.map(item => item.track);
        
        return {
            playlistId: playlist.id,
            playlistName: playlist.name,
            isCurated,
            metrics: {
                followerCount: playlist.followers.total,
                trackCount: playlist.tracks.total,
                averagePopularity: this.calculateAverages(
                    tracks.map(track => track.popularity)
                ),
                descriptionLength: playlist.description.length,
                lastUpdated: playlist.tracks.items[0]?.added_at || '',
                audioFeatureAverages: this.calculateAudioFeatureAverages(audioFeatures),
                popularityDistribution: this.calculatePopularityDistribution(tracks),
                updateFrequency: this.calculateUpdateFrequency(playlist.tracks.items),
            },
        };
    }

    private static calculateUpdateFrequency(tracks: any[]): number {
        if (tracks.length < 2) return 0;
        
        const dates = tracks
            .map(item => new Date(item.added_at))
            .sort((a, b) => b.getTime() - a.getTime());
            
        const totalDays = (dates[0].getTime() - dates[dates.length - 1].getTime()) 
            / (1000 * 60 * 60 * 24);
            
        return totalDays / (dates.length - 1);
    }

    static comparePlaylistGroups(
        curatedPlaylists: PlaylistAnalysis[],
        userPlaylists: PlaylistAnalysis[]
    ): ComparisonResult {
        const calculateGroupAverages = (playlists: PlaylistAnalysis[]) => ({
            followers: this.calculateAverages(
                playlists.map(p => p.metrics.followerCount)
            ),
            popularity: this.calculateAverages(
                playlists.map(p => p.metrics.averagePopularity)
            ),            
            audioFeatures: {                
                danceability: this.calculateAverages(
                    playlists.map(p => p.metrics.audioFeatureAverages.danceability)
                ),
                energy: this.calculateAverages(
                    playlists.map(p => p.metrics.audioFeatureAverages.energy)
                ),
                valence: this.calculateAverages(
                    playlists.map(p => p.metrics.audioFeatureAverages.valence)
                ),
                tempo: this.calculateAverages(
                    playlists.map(p => p.metrics.audioFeatureAverages.tempo)
                ),
            },
        });

        const curatedStats = calculateGroupAverages(curatedPlaylists);
        const userStats = calculateGroupAverages(userPlaylists);

        return {
            curatedPlaylists,
            userPlaylists,
            aggregateComparison: {
                averageFollowers: {
                    curated: curatedStats.followers,
                    user: userStats.followers,
                },
                averageTrackPopularity: {
                    curated: curatedStats.popularity,
                    user: userStats.popularity,
                }
                ,
                audioFeatures: {
                    curated: curatedStats.audioFeatures,
                    user: userStats.audioFeatures,
                },
            },
        };
    }
}
