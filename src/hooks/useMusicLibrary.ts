import { useState, useEffect } from 'react';
import { MusicTrack, EmotionType } from '../types/music';
import { allSongs as fallbackSongs } from '../data/realSongs';

export const useMusicLibrary = () => {
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMusicData = async () => {
      try {
        setLoading(true);
        
        // Load all JSON metadata files
        const [mainResponse, emotionResponse, backgroundResponse] = await Promise.all([
          fetch('/music-dataset/metadata/main_tracks.json'),
          fetch('/music-dataset/metadata/emotion_tracks.json'),
          fetch('/music-dataset/metadata/background_tracks.json')
        ]);

        if (!mainResponse.ok || !emotionResponse.ok || !backgroundResponse.ok) {
          throw new Error('Failed to load music metadata');
        }

        const mainTracks: MusicTrack[] = await mainResponse.json();
        const emotionTracks: MusicTrack[] = await emotionResponse.json();
        const backgroundTracks: MusicTrack[] = await backgroundResponse.json();

        // Combine all tracks
        const combined = [...mainTracks, ...emotionTracks, ...backgroundTracks];
        
        console.log('🎵 Loaded music library:', {
          main: mainTracks.length,
          emotion: emotionTracks.length,
          background: backgroundTracks.length,
          total: combined.length
        });
        
        setAllTracks(combined);
        setError(null);
      } catch (err) {
        console.error('Error loading music data:', err);
        // Fallback: map sample songs into MusicTrack shape
        // Note: Fallback songs don't have actual file_path, so they won't play
        // This is just for display purposes
        const mapToMusicTrack = (idx: number, s: any): MusicTrack => ({
          track_id: s.id || String(idx + 1),
          track_name: s.title,
          artist: s.artist,
          album: s.album,
          genre: (s.genre || 'Unknown'),
          duration: s.duration || '3:00',
          file_name: s.title.replace(/\s+/g, '-').toLowerCase() + '.mp3',
          file_path: `/music-dataset/main-tracks/${s.title.replace(/\s+/g, '-').toLowerCase()}.mp3`,
          source: 'sample',
          license: 'N/A',
          download_url: undefined,
          attribution: undefined,
          emotion_tags: s.mood ? [s.mood.toLowerCase()] : [],
          tags: []
        });

        const fallback: MusicTrack[] = fallbackSongs.map((s, i) => mapToMusicTrack(i, s));
        if (fallback.length > 0) {
          console.warn('⚠️ Dataset missing, using fallback sample songs from src/data/realSongs.ts');
          setAllTracks(fallback);
          setError(null);
        } else {
          setError('Failed to load music library. Please check if metadata files exist.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMusicData();
  }, []);

  const filterByEmotion = (emotion: EmotionType): MusicTrack[] => {
    if (emotion === 'all') return allTracks;
    // Map "excited" to "energetic" for filtering
    const filterEmotion = emotion === 'excited' ? 'energetic' : emotion;
    return allTracks.filter(track => 
      track.emotion_tags?.includes(filterEmotion) || 
      track.emotion_tags?.includes(emotion)
    );
  };

  const searchTracks = (query: string): MusicTrack[] => {
    if (!query.trim()) return allTracks;
    
    const lowerQuery = query.toLowerCase();
    return allTracks.filter(track =>
      track.track_name.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
    );
  };

  const filterAndSearch = (emotion: EmotionType, searchQuery: string): MusicTrack[] => {
    let filtered = emotion === 'all' ? allTracks : filterByEmotion(emotion);
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.track_name.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.album.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  };

  return {
    allTracks,
    loading,
    error,
    filterByEmotion,
    searchTracks,
    filterAndSearch
  };
};

