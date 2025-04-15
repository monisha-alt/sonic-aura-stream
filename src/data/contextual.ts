
import { SongType } from './songs';

export interface WeatherSuggestion {
  condition: string;
  genres: string[];
  description: string;
}

export interface TimeSuggestion {
  timeFrame: string;
  startHour: number; 
  endHour: number;
  genres: string[];
  description: string;
}

export interface LocationSuggestion {
  environment: string;
  genres: string[];
  description: string;
}

export const weatherSuggestions: WeatherSuggestion[] = [
  {
    condition: 'Clear',
    genres: ['Pop', 'Dance-pop', 'Indie'],
    description: 'Upbeat and bright tunes for sunny weather'
  },
  {
    condition: 'Clouds',
    genres: ['Alternative', 'Indie', 'Soft Rock'],
    description: 'Mellower tracks to match the overcast sky'
  },
  {
    condition: 'Rain',
    genres: ['R&B', 'Soul', 'Jazz'],
    description: 'Smooth and reflective music for rainy days'
  },
  {
    condition: 'Snow',
    genres: ['Classical', 'Ambient', 'Acoustic'],
    description: 'Calm and peaceful melodies for snowy landscapes'
  },
  {
    condition: 'Thunderstorm',
    genres: ['Rock', 'Metal', 'Electronic'],
    description: 'Intense and powerful tracks to match the storm'
  },
  {
    condition: 'Mist',
    genres: ['Ambient', 'Chillout', 'Trip-hop'],
    description: 'Atmospheric sounds for misty conditions'
  }
];

export const timeSuggestions: TimeSuggestion[] = [
  {
    timeFrame: 'Morning',
    startHour: 5,
    endHour: 11,
    genres: ['Pop', 'Indie', 'Acoustic'],
    description: 'Energizing tracks to start your day'
  },
  {
    timeFrame: 'Afternoon',
    startHour: 12,
    endHour: 16,
    genres: ['Dance', 'Hip-Hop', 'Funk'],
    description: 'Upbeat songs to keep your energy high'
  },
  {
    timeFrame: 'Evening',
    startHour: 17,
    endHour: 20,
    genres: ['R&B', 'Soft Rock', 'Jazz'],
    description: 'Relaxing tunes to wind down your day'
  },
  {
    timeFrame: 'Night',
    startHour: 21,
    endHour: 4,
    genres: ['Electronic', 'Ambient', 'Chillout'],
    description: 'Atmospheric tracks for the late hours'
  }
];

export const locationSuggestions: LocationSuggestion[] = [
  {
    environment: 'Urban',
    genres: ['Hip-Hop', 'R&B', 'Pop', 'Electronic'],
    description: 'Dynamic beats for city life'
  },
  {
    environment: 'Suburban',
    genres: ['Pop', 'Rock', 'Indie', 'Alternative'],
    description: 'Familiar and relaxed tunes for residential areas'
  },
  {
    environment: 'Rural',
    genres: ['Country', 'Folk', 'Acoustic', 'Americana'],
    description: 'Earthy sounds for countryside settings'
  },
  {
    environment: 'Beach',
    genres: ['Reggae', 'Surf Rock', 'Tropical House', 'Pop'],
    description: 'Laid-back vibes for seaside relaxation'
  },
  {
    environment: 'Mountain',
    genres: ['Folk', 'Indie Folk', 'Ambient', 'Classical'],
    description: 'Majestic melodies for mountainous terrain'
  }
];

export const getContextualRecommendations = (
  songs: SongType[],
  weather?: string, 
  timeHour?: number,
  environment?: string
): { songs: SongType[], context: string[] } => {
  const context: string[] = [];
  let filteredSongs = [...songs];
  
  // Filter by weather if provided
  if (weather) {
    const weatherSuggestion = weatherSuggestions.find(
      w => w.condition.toLowerCase() === weather.toLowerCase()
    );
    if (weatherSuggestion) {
      context.push(`${weatherSuggestion.description} (${weather})`);
      filteredSongs = filteredSongs.filter(song => 
        song.genre.some(g => 
          weatherSuggestion.genres.some(wg => 
            g.toLowerCase().includes(wg.toLowerCase())
          )
        )
      );
    }
  }
  
  // Filter by time if provided
  if (timeHour !== undefined) {
    const timeSuggestion = timeSuggestions.find(
      t => timeHour >= t.startHour && (t.endHour > t.startHour ? timeHour <= t.endHour : timeHour <= 24 || timeHour <= t.endHour)
    );
    if (timeSuggestion) {
      context.push(`${timeSuggestion.description} (${timeSuggestion.timeFrame})`);
      filteredSongs = filteredSongs.filter(song => 
        song.genre.some(g => 
          timeSuggestion.genres.some(tg => 
            g.toLowerCase().includes(tg.toLowerCase())
          )
        )
      );
    }
  }
  
  // Filter by location environment if provided
  if (environment) {
    const locationSuggestion = locationSuggestions.find(
      l => l.environment.toLowerCase() === environment.toLowerCase()
    );
    if (locationSuggestion) {
      context.push(`${locationSuggestion.description} (${environment})`);
      filteredSongs = filteredSongs.filter(song => 
        song.genre.some(g => 
          locationSuggestion.genres.some(lg => 
            g.toLowerCase().includes(lg.toLowerCase())
          )
        )
      );
    }
  }
  
  // If no songs match all filters, return a smaller set based on any matching criteria
  if (filteredSongs.length === 0) {
    return { 
      songs: songs.slice(0, 5), 
      context: ['No perfect matches, showing popular tracks instead']
    };
  }
  
  return { songs: filteredSongs.slice(0, 10), context };
};
