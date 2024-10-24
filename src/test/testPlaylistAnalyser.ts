import { AudioFeatures } from "../types/spotify";
import { PlaylistAnalyzer } from "../utils/analysis";

class TestPlaylistAnalyzer extends PlaylistAnalyzer {
    public static testCalculateAudioFeatureAverages(features: AudioFeatures[]) {
      return this.calculateAudioFeatureAverages(features);
    }
}

export default TestPlaylistAnalyzer;