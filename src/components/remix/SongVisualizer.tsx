
import React from "react";
import { Button } from "@/components/ui/button";

interface SongVisualizerProps {
  currentSong: {
    title: string;
    artist: string;
    cover: string;
  } | null;
  isPlaying: boolean;
  handlePlayPause: () => void;
}

const SongVisualizer = ({ currentSong, isPlaying, handlePlayPause }: SongVisualizerProps) => {
  if (!currentSong) return null;

  return (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <img src={currentSong.cover} alt={currentSong.title} className="h-16 w-16 rounded mr-4" />
        <div>
          <h3 className="font-medium">{currentSong.title}</h3>
          <p className="text-sm text-gray-400">{currentSong.artist}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={handlePlayPause} variant="secondary" size="sm">
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <div className="relative h-32 w-full bg-gray-900 rounded overflow-hidden mb-4">
        {/* Visualizer mockup */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <p className="text-gray-500 text-sm">Press Play to see waveform</p>
          )}
          {isPlaying && (
            <div className="flex items-end space-x-1 h-full w-full px-4 py-8">
              {Array.from({ length: 40 }).map((_, i) => {
                const height = Math.random() * 100;
                return (
                  <div 
                    key={i} 
                    className="w-2 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t"
                    style={{ 
                      height: `${height}%`,
                      opacity: false ? 0.8 : 0.5
                    }} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongVisualizer;
