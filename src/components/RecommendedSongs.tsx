
import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  releaseYear: number;
  genre: string[];
  language: string;
  mood: string[];
  listens: number;
  onPlay?: () => void;
}

interface RecommendedSongsProps {
  songs: Song[];
}

const RecommendedSongs = ({ songs }: RecommendedSongsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <div
          key={song.id}
          className="group relative bg-card rounded-lg p-4 hover:bg-muted/50 transition-all duration-300 border border-border/50"
        >
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src={song.cover} 
                alt={`${song.title} cover`}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <Button 
                size="sm" 
                variant="secondary"
                onClick={song.onPlay}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{song.duration}</span>
                <div className="flex gap-1">
                  {song.genre?.slice(0, 2).map((g, index) => (
                    <span key={index} className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedSongs;
