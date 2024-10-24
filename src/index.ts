import PlaylistComparisonApp from "./playlistComparisonApp";

async function runAnalysis() {
    try {
        const app = new PlaylistComparisonApp();
        
        console.log('Starting playlist analysis...');
        const results = await app.runComparison();
        
        // Log summary statistics
        console.log('\n=== Comparison Results ===\n');
        
        console.log('Curated Playlists Stats:');
        console.log('Average Followers:', 
            results.aggregateComparison.averageFollowers.curated.toLocaleString());
        console.log('Average Track Popularity:', 
            results.aggregateComparison.averageTrackPopularity.curated.toFixed(2));
        
        console.log('\nUser Playlists Stats:');
        console.log('Average Followers:', 
            results.aggregateComparison.averageFollowers.user.toLocaleString());
        console.log('Average Track Popularity:', 
            results.aggregateComparison.averageTrackPopularity.user.toFixed(2));
        
        console.log('\nAudio Features Comparison:');
        
        console.log('Curated Playlists:');
        console.log(results.aggregateComparison.audioFeatures.curated);
        //console.log('\nUser Playlists:');
        //console.log(results.aggregateComparison.audioFeatures.user);
        
        // Log individual playlist details
        console.log('\n=== Individual Playlist Details ===\n');
        
        console.log('Curated Playlists:');
        results.curatedPlaylists.forEach(playlist => {
            console.log(`\n${playlist.playlistName}:`);
            console.log('Followers:', playlist.metrics.followerCount.toLocaleString());
            console.log('Average Popularity:', playlist.metrics.averagePopularity.toFixed(2));
            console.log('Update Frequency:', 
                playlist.metrics.updateFrequency?.toFixed(2), 'days');
        });
        
        console.log('\nUser Playlists:');
        results.userPlaylists.forEach(playlist => {
            console.log(`\n${playlist.playlistName}:`);
            console.log('Followers:', playlist.metrics.followerCount.toLocaleString());
            console.log('Average Popularity:', playlist.metrics.averagePopularity.toFixed(2));
            console.log('Update Frequency:', 
                playlist.metrics.updateFrequency?.toFixed(2), 'days');
        });
        
    } catch (error) {
        console.error('Analysis failed:', error);
    }
}

// Run the analysis
runAnalysis().catch(console.error);
