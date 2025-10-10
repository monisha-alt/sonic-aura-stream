import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { songs as allSongs, SongType } from "@/data";
import { KeyRound } from "lucide-react";

interface RecommendedSongsProps {
  songs: SongType[];
  listenedSongIds?: Set<string>;
  onSelectSong?: (songId: string) => void;
}

const RecommendedSongs = ({ songs, listenedSongIds, onSelectSong }: RecommendedSongsProps) => {
  const isUnlistened = (id: string) => !listenedSongIds || !listenedSongIds.has(id);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Recommended for you</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <button
            key={song.id}
            onClick={() => onSelectSong?.(song.id)}
            className="text-left"
          >
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
              <CardContent className="p-3">
                <div className="relative">
                  <img
                    src={song.cover}
                    alt={`${song.title} cover`}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  {isUnlistened(song.id) && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                      <KeyRound className="h-3 w-3" />
                      <span>Unlistened</span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-semibold truncate">{song.title}</div>
                  <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedSongs;

