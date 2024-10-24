import TestPlaylistAnalyzer from "./testPlaylistAnalyser";

describe('PlaylistAnalyzer', () => {
    it('should calculate averages of audio features correctly', () => {
      const mockFeatures = [
        { danceability: 0.5, energy: 0.8, valence: 0.6, tempo: 120, acousticness: 0.3, instrumentalness: 0.0, id: 'x1', key: 5, loudness: 0.8, mode : .2, speechiness : .4, liveness: .5, duration_ms: 1000, time_signature: 4  },
        { danceability: 0.7, energy: 0.9, valence: 0.5, tempo: 125, acousticness: 0.4, instrumentalness: 0.1, id: 'x2', key: 6, loudness: 0.2, mode : .3, speechiness : .5, liveness: .2, duration_ms: 1010, time_signature: 3 },
      ];
  
      const averages = TestPlaylistAnalyzer.testCalculateAudioFeatureAverages(mockFeatures);
  
      expect(averages.danceability).toBeCloseTo(0.6);
      expect(averages.energy).toBeCloseTo(0.85);
      expect(averages.valence).toBeCloseTo(0.55);
      expect(averages.tempo).toBeCloseTo(122.5);
    });
  });