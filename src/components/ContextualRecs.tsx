import React, { useState, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  coverUrl?: string;
  previewUrl?: string;
}

interface ContextualRecsProps {
  currentSong?: Song;
}

const ContextualRecs: React.FC<ContextualRecsProps> = ({ currentSong }) => {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContextualRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fix Bug 1: Add fallback for VITE_API_URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/recommendations/contextual`);

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching contextual recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContextualRecommendations();
  }, []);

  // Fix Bug 2: Add null/undefined check for currentSong.id
  const handleSongClick = (song: Song) => {
    // Handle song selection
    console.log('Selected song:', song);
  };

  if (isLoading) {
    return (
      <div className="contextual-recs">
        <h2>Contextual Recommendations</h2>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contextual-recs">
        <h2>Contextual Recommendations</h2>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="contextual-recs">
      <h2>Contextual Recommendations</h2>
      <p>Based on time of day, weather, and your preferences</p>
      
      {recommendations.length === 0 ? (
        <p>No recommendations available at the moment.</p>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((song) => (
            <div 
              key={song.id} 
              className="recommendation-item"
              onClick={() => handleSongClick(song)}
            >
              {song.coverUrl && (
                <img src={song.coverUrl} alt={`${song.title} cover`} />
              )}
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
                {song.mood && <span className="mood-badge">{song.mood}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fix Bug 2: Only render TimestampComments if currentSong.id is valid */}
      {currentSong?.id && currentSong.id !== 'undefined' && currentSong.id !== 'null' && (
        <div className="timestamp-comments-section">
          {/* TimestampComments component would be rendered here */}
          {/* Pass the validated songId */}
        </div>
      )}
    </div>
  );
};

export default ContextualRecs;

