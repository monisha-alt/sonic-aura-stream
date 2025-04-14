
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2 } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentSong: {
    title: string;
    artist: string;
    duration: string;
    cover: string;
  };
  handlePlayPause: () => void;
  handleSkipForward: () => void;
  handleSkipBack: () => void;
  progress: number[];
  setProgress: (value: number[]) => void;
  volume: number[];
  setVolume: (value: number[]) => void;
}

const PlayerControls = ({
  isPlaying,
  currentSong,
  handlePlayPause,
  handleSkipForward,
  handleSkipBack,
  progress,
  setProgress,
  volume,
  setVolume
}: PlayerControlsProps) => {
  // Calculate current playback time based on progress percentage
  const getCurrentTime = () => {
    const totalSeconds = parsePlaybackTime(currentSong.duration);
    const currentSeconds = Math.floor(totalSeconds * progress[0] / 100);
    return formatPlaybackTime(currentSeconds);
  };
  
  // Convert "3:45" format to total seconds
  const parsePlaybackTime = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  };
  
  // Format seconds to "m:ss" format
  const formatPlaybackTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex items-center space-x-4 w-full md:w-1/3">
          <img 
            src={currentSong.cover}
            alt="Album cover" 
            className="h-12 w-12 rounded"
          />
          <div>
            <p className="font-medium">{currentSong.title}</p>
            <p className="text-sm text-gray-400">{currentSong.artist}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="w-full md:w-1/3 flex flex-col items-center space-y-2 my-4 md:my-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleSkipBack}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handlePlayPause}
              variant="secondary" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSkipForward}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs text-gray-400">{getCurrentTime()}</span>
            <Slider 
              value={progress} 
              max={100}
              step={1}
              className="w-full" 
              onValueChange={setProgress}
            />
            <span className="text-xs text-gray-400">{currentSong.duration}</span>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 flex justify-end items-center space-x-2">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <Slider 
            value={volume} 
            max={100}
            step={1}
            className="w-24" 
            onValueChange={setVolume}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
