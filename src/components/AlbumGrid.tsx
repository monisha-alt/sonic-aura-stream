
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface AlbumType {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseYear: number;
  tracks: string[];
  genre: string[];
  language: string;
  mood: string[];
}

interface AlbumGridProps {
  albums?: AlbumType[];
  showYear?: boolean;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ 
  albums = [],
  showYear = true
}) => {
  if (albums.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No albums found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album) => (
        <Link to={`/albums/${album.id}`} key={album.id}>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
            <CardContent className="p-4">
              <img 
                src={album.cover} 
                alt={`${album.title} album cover`}
                className="w-full aspect-square object-cover rounded-md mb-3"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop';
                }}
              />
              <h3 className="font-semibold text-white truncate">{album.title}</h3>
              <p className="text-sm text-gray-400 truncate">{album.artist}</p>
              {showYear && (
                <p className="text-xs text-gray-500 mt-1">{album.releaseYear}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {album.genre.slice(0, 2).map((g, index) => (
                  <span key={index} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {g}
                  </span>
                ))}
                {album.language && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    {album.language}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default AlbumGrid;
