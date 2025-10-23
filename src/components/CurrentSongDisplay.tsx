import React from "react";

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
    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
      <img
        src={currentSong.cover}
        alt={`${currentSong.title} cover`}
        className="h-16 w-16 rounded-md object-cover"
      />
      <div className="flex-1">
        <div className="text-lg font-semibold">{currentSong.title}</div>
        <div className="text-sm text-gray-400">{currentSong.artist}</div>
      </div>
      <div className="text-xs text-gray-400">{currentSong.duration}</div>
    </div>
  );
};

export default CurrentSongDisplay;


