
import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { SongType } from "@/data";

interface RecommendedSongsProps {
  songs: SongType[];
}

const RecommendedSongs = ({ songs }: RecommendedSongsProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recommended Based on Your Taste</h3>
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex justify-between items-center p-3 rounded-md hover:bg-gray-800"
          >
            <div className="flex items-center">
              <img 
                src={song.cover} 
                alt={`${song.title} cover`}
                className="w-10 h-10 rounded mr-3"
              />
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{song.duration}</span>
              <Button size="sm" variant="ghost">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedSongs;
