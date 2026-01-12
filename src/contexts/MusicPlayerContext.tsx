import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { MusicTrack, MusicPlayerState } from '../types/music';

interface MusicPlayerContextType extends MusicPlayerState {
  audioRef: React.RefObject<HTMLAudioElement>;
  play: (track: MusicTrack, playlist?: MusicTrack[]) => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (tracks: MusicTrack[], startIndex?: number) => void;
  getPlaybackHistory: () => MusicTrack[];
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [state, setState] = useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    playlist: [],
    currentIndex: -1
  });

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      }));
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error('❌ Audio Error:', {
        error: target.error,
        code: target.error?.code,
        message: target.error?.message,
        src: target.src
      });
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Track playback history in localStorage
  const addToHistory = useCallback((track: MusicTrack) => {
    try {
      const historyKey = 'music_playback_history';
      const existingHistory = localStorage.getItem(historyKey);
      const history: Array<{ track: MusicTrack; playedAt: number }> = existingHistory 
        ? JSON.parse(existingHistory) 
        : [];
      
      // Remove if already exists (to avoid duplicates)
      const filteredHistory = history.filter(h => h.track.track_id !== track.track_id);
      
      // Add to beginning
      filteredHistory.unshift({ track, playedAt: Date.now() });
      
      // Keep only last 50 songs
      const limitedHistory = filteredHistory.slice(0, 50);
      
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving playback history:', error);
    }
  }, []);

  const play = useCallback((track: MusicTrack, playlist?: MusicTrack[]) => {
    const newPlaylist = playlist || [track];
    const index = newPlaylist.findIndex(t => t.track_id === track.track_id);
    
    // Add to playback history
    addToHistory(track);
    
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      playlist: newPlaylist,
      currentIndex: index
    }));

    if (!audioRef.current) {
      console.error('❌ Audio element not found');
      return;
    }

    if (!track.file_path) {
      console.warn('⚠️ No audio file available for this track. Skipping playback.');
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // Build correct audio source path
    let audioSrc: string;
    
    if (track.file_path.startsWith('http://') || track.file_path.startsWith('https://')) {
      audioSrc = track.file_path;
    } else if (track.file_path.startsWith('/music-dataset/')) {
      audioSrc = track.file_path;
    } else if (track.file_path.startsWith('music-dataset/')) {
      audioSrc = `/${track.file_path}`;
    } else {
      audioSrc = `/music-dataset/${track.file_path}`;
    }

    console.log('🎵 Playing track:', {
      track: track.track_name,
      file_path: track.file_path,
      audioSrc: audioSrc
    });

    const audio = audioRef.current;
    
    // Set source and volume
    audio.src = audioSrc;
    audio.volume = state.volume / 100;
    
    console.log('🎵 Audio TRY:', audio.src);
    
    // Load and play
    audio.load();
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✅ Audio playing successfully');
        })
        .catch(err => {
          console.error('❌ Error playing audio:', {
            error: err,
            message: err.message,
            name: err.name,
            audioSrc: audioSrc,
            track: track.track_name
          });
          setState(prev => ({ ...prev, isPlaying: false }));
        });
    }
  }, [state.volume, addToHistory]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setState(prev => {
        if (prev.playlist.length === 0) return prev;
        const nextIndex = (prev.currentIndex + 1) % prev.playlist.length;
        const nextTrack = prev.playlist[nextIndex];
        if (nextTrack) {
          setTimeout(() => {
            play(nextTrack, prev.playlist);
          }, 100);
        }
        return prev;
      });
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [state.playlist, state.currentIndex, play]);

  const pause = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
    audioRef.current?.pause();
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else if (state.currentTrack) {
      setState(prev => ({ ...prev, isPlaying: true }));
      audioRef.current?.play().catch(err => {
        console.error('❌ Error resuming playback:', err);
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    }
  };

  const next = () => {
    if (state.playlist.length === 0) return;
    
    const nextIndex = (state.currentIndex + 1) % state.playlist.length;
    const nextTrack = state.playlist[nextIndex];
    
    if (nextTrack) {
      play(nextTrack, state.playlist);
    }
  };

  const previous = () => {
    if (state.playlist.length === 0) return;
    
    if (state.currentTime > 3) {
      seek(0);
      return;
    }
    
    const prevIndex = state.currentIndex - 1 < 0 
      ? state.playlist.length - 1 
      : state.currentIndex - 1;
    const prevTrack = state.playlist[prevIndex];
    
    if (prevTrack) {
      play(prevTrack, state.playlist);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolumeControl = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  const setPlaylist = (tracks: MusicTrack[], startIndex: number = 0) => {
    setState(prev => ({
      ...prev,
      playlist: tracks,
      currentIndex: startIndex
    }));
  };

  const getPlaybackHistory = useCallback((): MusicTrack[] => {
    try {
      const historyKey = 'music_playback_history';
      const existingHistory = localStorage.getItem(historyKey);
      if (!existingHistory) return [];
      
      const history: Array<{ track: MusicTrack; playedAt: number }> = JSON.parse(existingHistory);
      return history.map(h => h.track);
    } catch (error) {
      console.error('Error reading playback history:', error);
      return [];
    }
  }, []);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume / 100;
    }
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        ...state,
        audioRef,
        play,
        pause,
        togglePlayPause,
        next,
        previous,
        seek,
        setVolume: setVolumeControl,
        setPlaylist,
        getPlaybackHistory
      }}
    >
      {children}
      <audio 
        ref={audioRef} 
        preload="metadata"
        onError={(e) => {
          const target = e.target as HTMLAudioElement;
          console.error('❌ Audio element error:', {
            error: target.error,
            code: target.error?.code,
            message: target.error?.message,
            src: target.src,
            networkState: target.networkState,
            readyState: target.readyState
          });
        }}
        onLoadStart={() => console.log('🔄 Audio load started:', audioRef.current?.src)}
        onCanPlay={() => console.log('✅ Audio can play:', audioRef.current?.src)}
        onLoadedData={() => console.log('✅ Audio data loaded:', audioRef.current?.src)}
      />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};
