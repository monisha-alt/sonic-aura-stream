
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface CurrentSongDisplayProps {
  currentSong: {
    title: string;
    artist: string;
    duration: string;
    cover: string;
  };
}

const CurrentSongDisplay = ({ currentSong }: CurrentSongDisplayProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <img 
          src={currentSong.cover} 
          alt={`${currentSong.title} by ${currentSong.artist}`}
          className="w-48 h-48 rounded-lg shadow-lg"
        />
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{currentSong.title}</h3>
          <p className="text-gray-300">{currentSong.artist}</p>
          <p className="text-gray-400">Duration: {currentSong.duration}</p>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Add to Favorites
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSongDisplay;
