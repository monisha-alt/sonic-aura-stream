// TypeScript interfaces for local music dataset

export interface MusicTrack {
  track_id: string;
  track_name: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  file_name: string;
  file_path: string;
  source: string;
  license: string;
  download_url?: string;
  attribution?: string;
  emotion_tags?: string[];
  tags: string[];
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: MusicTrack[];
  currentIndex: number;
}

export type EmotionType = 'happy' | 'sad' | 'calm' | 'energetic' | 'romantic' | 'angry' | 'excited' | 'all';

export interface FilterOptions {
  emotion: EmotionType;
  searchQuery: string;
  genre?: string;
}

