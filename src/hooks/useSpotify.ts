import { useState, useEffect } from 'react';
import { searchTracks, formatTrack } from '../services/spotifyService';
import { getSongsByMood, getRandomSongs, Song } from '../data/realSongs';

export const useSpotifySearch = (query: string, enabled: boolean = true) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !query) return;

    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const tracks = await searchTracks(query, 10);
        const formattedSongs = tracks.map(formatTrack);
        setSongs(formattedSongs);
      } catch (err) {
        console.error('Error fetching from Spotify:', err);
        setError('Failed to fetch from Spotify API');
        // Fallback to hardcoded songs
        setSongs(getRandomSongs(10));
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [query, enabled]);

  return { songs, loading, error };
};

export const useSpotifyRecommendations = (mood: string, enabled: boolean = true) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !mood) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Map moods to Spotify seed genres
        const genreMap: { [key: string]: string } = {
          happy: 'pop,dance,party',
          sad: 'sad,acoustic,piano',
          calm: 'ambient,chill,study',
          energetic: 'rock,workout,power',
          excited: 'edm,electronic,party',
          romantic: 'romance,love,acoustic',
          angry: 'metal,rock,punk'
        };

        const genre = genreMap[mood.toLowerCase()] || 'pop';
        
        // Search for songs by genre (Spotify API doesn't have direct mood search)
        const tracks = await searchTracks(`genre:${genre}`, 10);
        const formattedSongs = tracks.map(formatTrack);
        setSongs(formattedSongs);
      } catch (err) {
        console.error('Error fetching recommendations from Spotify:', err);
        setError('Failed to fetch recommendations');
        // Fallback to hardcoded songs by mood
        setSongs(getSongsByMood(mood));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [mood, enabled]);

  return { songs, loading, error };
};

export const useSpotifyTrending = (enabled: boolean = true) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Search for current trending songs
        const tracks = await searchTracks('year:2024 2025', 20);
        const formattedSongs = tracks.map(formatTrack);
        setSongs(formattedSongs);
      } catch (err) {
        console.error('Error fetching trending from Spotify:', err);
        setError('Failed to fetch trending songs');
        // Fallback to hardcoded trending songs
        setSongs(getRandomSongs(20));
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [enabled]);

  return { songs, loading, error };
};

