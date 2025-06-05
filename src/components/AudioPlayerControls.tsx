
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Heart, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { Song } from "@/hooks/useSongs";

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number[];
  volume: number[];
  duration: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onPlayPause: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  formatTime: (seconds: number) => string;
}

const AudioPlayerControls = ({
  isPlaying,
  currentSong,
  progress,
  volume,
  duration,
  isShuffled,
  repeatMode,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  formatTime
}: AudioPlayerControlsProps) => {
  if (!currentSong) {
    return null;
  }

  const currentTime = (progress[0] / 100) * duration;

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="h-4 w-4" />;
      case 'all':
        return <Repeat className="h-4 w-4" />;
      default:
        return <Repeat className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 w-full md:w-1/3">
          <img 
            src={currentSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'}
            alt="Album cover" 
            className="h-12 w-12 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Player Controls */}
        <div className="w-full md:w-1/3 flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleShuffle}
              className={isShuffled ? "text-purple-400" : "text-gray-400"}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onPrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={onPlayPause}
              variant="secondary" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleRepeat}
              className={repeatMode !== 'off' ? "text-purple-400" : "text-gray-400"}
            >
              {getRepeatIcon()}
            </Button>
          </div>
          
          <div className="w-full flex items-center space-x-2 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <Slider 
              value={progress} 
              max={100}
              step={1}
              className="flex-1" 
              onValueChange={onSeek}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Volume Control */}
        <div className="w-full md:w-1/3 flex justify-end items-center space-x-2">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <Slider 
            value={volume} 
            max={100}
            step={1}
            className="w-24" 
            onValueChange={onVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerControls;
