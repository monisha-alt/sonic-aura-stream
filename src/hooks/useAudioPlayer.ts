
import { useState, useRef, useEffect } from 'react';
import { Song } from './useSongs';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([50]);
  const [duration, setDuration] = useState(0);
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
      setIsPlaying(false);
      setProgress([0]);
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
    playSong,
    togglePlayPause,
    seekTo,
    setVolume,
    formatTime
  };
};
