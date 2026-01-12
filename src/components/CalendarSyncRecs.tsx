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

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: string;
}

interface CalendarSyncRecsProps {
  currentSong?: Song;
  calendarEvents?: CalendarEvent[];
}

const CalendarSyncRecs: React.FC<CalendarSyncRecsProps> = ({ 
  currentSong, 
  calendarEvents = [] 
}) => {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarBasedRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fix Bug 1: Add fallback for VITE_API_URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/recommendations/calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: calendarEvents.map(event => ({
              id: event.id,
              title: event.title,
              startTime: event.startTime.toISOString(),
              endTime: event.endTime.toISOString(),
              type: event.type,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch calendar recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching calendar-based recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (calendarEvents.length > 0) {
      fetchCalendarBasedRecommendations();
    }
  }, [calendarEvents]);

  const handleSongClick = (song: Song) => {
    // Handle song selection
    console.log('Selected song:', song);
  };

  if (isLoading) {
    return (
      <div className="calendar-sync-recs">
        <h2>Calendar-Based Recommendations</h2>
        <p>Loading recommendations based on your calendar events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-sync-recs">
        <h2>Calendar-Based Recommendations</h2>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (calendarEvents.length === 0) {
    return (
      <div className="calendar-sync-recs">
        <h2>Calendar-Based Recommendations</h2>
        <p>No upcoming calendar events found.</p>
      </div>
    );
  }

  return (
    <div className="calendar-sync-recs">
      <h2>Calendar-Based Recommendations</h2>
      <p>Music recommendations based on your upcoming events</p>
      
      <div className="upcoming-events">
        <h3>Upcoming Events</h3>
        {calendarEvents.map((event) => (
          <div key={event.id} className="event-item">
            <h4>{event.title}</h4>
            <p>{event.startTime.toLocaleString()} - {event.endTime.toLocaleString()}</p>
            <span className="event-type">{event.type}</span>
          </div>
        ))}
      </div>

      {recommendations.length === 0 ? (
        <p>No recommendations available for these events.</p>
      ) : (
        <div className="recommendations-list">
          <h3>Recommended Songs</h3>
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
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
                {song.mood && <span className="mood-badge">{song.mood}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fix Bug 2: Only render TimestampComments if currentSong.id is valid */}
      {currentSong?.id && 
       currentSong.id !== 'undefined' && 
       currentSong.id !== 'null' && (
        <div className="timestamp-comments-section">
          {/* TimestampComments would be rendered here with validated songId */}
          {/* Example: <TimestampComments songId={currentSong.id} ... /> */}
        </div>
      )}
    </div>
  );
};

export default CalendarSyncRecs;

