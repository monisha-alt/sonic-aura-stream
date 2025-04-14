
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Music } from "lucide-react";

interface CurrentSongDisplayProps {
  currentSong: {
    title: string;
    artist: string;
    duration: string;
    cover: string;
  };
}

const CurrentSongDisplay = ({ currentSong }: CurrentSongDisplayProps) => {
  const [isLive, setIsLive] = useState(false);
  const [realTimeInfo, setRealTimeInfo] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleTimeString();
      
      // Update real-time information with random listener count
      const listeners = Math.floor(Math.random() * 500) + 100;
      setRealTimeInfo(`${listeners.toLocaleString()} listeners at ${formattedTime}`);
      
      // Toggle live status occasionally for effect
      if (Math.random() > 0.7) {
        setIsLive(prev => !prev);
      }
    }, 3000);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative">
          <img 
            src={currentSong.cover} 
            alt={`${currentSong.title} by ${currentSong.artist}`}
            className="w-48 h-48 rounded-lg shadow-lg"
          />
          {isLive && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white mr-1"></span>
              LIVE
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{currentSong.title}</h3>
          <p className="text-gray-300">{currentSong.artist}</p>
          <p className="text-gray-400">Duration: {currentSong.duration}</p>
          <div className="flex space-x-2 mb-2">
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Add to Favorites
            </Button>
          </div>
          {realTimeInfo && (
            <div className="flex items-center mt-2 text-sm text-purple-400">
              <Music className="h-4 w-4 mr-1" />
              <span>{realTimeInfo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentSongDisplay;
