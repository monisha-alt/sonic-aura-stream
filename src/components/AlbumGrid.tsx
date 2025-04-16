
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { albums, AlbumType } from "@/data";

interface AlbumGridProps {
  albums?: AlbumType[];
  showYear?: boolean;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ 
  albums: propAlbums = albums,
  showYear = true
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {propAlbums.map((album) => (
        <Link to={`/albums/${album.id}`} key={album.id}>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
            <CardContent className="p-4">
              <img 
                src={album.cover} 
                alt={`${album.title} album cover`}
                className="w-full aspect-square object-cover rounded-md mb-3"
              />
              <h3 className="font-semibold text-white truncate">{album.title}</h3>
              <p className="text-sm text-gray-400">{album.artist}</p>
              {showYear && (
                <p className="text-xs text-gray-500 mt-1">{album.releaseYear}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default AlbumGrid;
