
import { useState, useRef, useEffect } from 'react';
import { Song } from './useSongs';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([50]);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      if (duration > 0) {
        setProgress([Math.floor((currentTime / duration) * 100)]);
      }
    };

    const handleEnded = () => {
      handleSongEnd();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all' || currentIndex < currentPlaylist.length - 1) {
      // Play next song
      playNext();
    } else {
      // Stop playing
      setIsPlaying(false);
      setProgress([0]);
    }
  };

  const playPlaylist = (playlist: Song[], startIndex: number = 0) => {
    const shuffledPlaylist = isShuffled ? [...playlist].sort(() => Math.random() - 0.5) : playlist;
    setCurrentPlaylist(shuffledPlaylist);
    setCurrentIndex(startIndex);
    playSong(shuffledPlaylist[startIndex]);
  };

  const playSong = (song: Song) => {
    if (!audioRef.current || !song.audio_url) return;

    const audio = audioRef.current;
    
    // If same song is playing, just toggle play/pause
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }

    // Load new song
    setCurrentSong(song);
    audio.src = song.audio_url;
    audio.load();
    
    audio.addEventListener('canplay', () => {
      audio.play();
      setIsPlaying(true);
    }, { once: true });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentPlaylist.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentPlaylist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    setCurrentIndex(nextIndex);
    playSong(currentPlaylist[nextIndex]);
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = currentPlaylist.length - 1;
      } else {
        return;
      }
    }
    
    setCurrentIndex(prevIndex);
    playSong(currentPlaylist[prevIndex]);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    if (currentPlaylist.length > 0) {
      const newPlaylist = !isShuffled 
        ? [...currentPlaylist].sort(() => Math.random() - 0.5)
        : [...currentPlaylist]; // You might want to restore original order here
      setCurrentPlaylist(newPlaylist);
    }
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const seekTo = (progressValue: number[]) => {
    if (!audioRef.current || !duration) return;
    
    const newTime = (progressValue[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(progressValue);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isPlaying,
    currentSong,
    progress,
    volume,
    duration,
    isShuffled,
    repeatMode,
    currentPlaylist,
    currentIndex,
    playSong,
    playPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    setVolume,
    formatTime
  };
};
