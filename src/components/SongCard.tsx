
import React, { useState } from "react";
import { Play, Heart, MoreHorizontal, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import UnlistenedBadge from "./UnlistenedBadge";

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  releaseYear: number;
  genre?: string[];
  language: string;
  mood?: string[];
  listens: number;
  onPlay?: () => void;
  onLike?: () => void;
  isFavorited?: boolean;
  isUnlistened?: boolean;
  commentCount?: number;
}

const SongCard: React.FC<SongCardProps> = ({
  id,
  title,
  artist,
  album,
  duration,
  cover,
  releaseYear,
  genre = [],
  language,
  mood = [],
  listens,
  onPlay,
  onLike,
  isFavorited = false,
  isUnlistened = false,
  commentCount = 0
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  
  const formatListens = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = () => {
    setIsFavorite(!isFavorite);
    
    if (onLike) {
      onLike();
    }
    
    toast({
      title: !isFavorite ? "Added to favorites" : "Removed from favorites",
      description: !isFavorite ? `${title} has been added to your favorites` : `${title} has been removed from your favorites`,
      duration: 2000,
    });
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/song/${id}`)}
    >
      <CardContent className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src={cover} 
              alt={`${title} cover`}
              className="w-16 h-16 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop';
              }}
            />
            {isUnlistened && (
              <div className="absolute -top-1 -right-1">
                <UnlistenedBadge />
              </div>
            )}
            <button
              onClick={onPlay}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-opacity-70"
            >
              <Play className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate text-sm">{title}</h3>
            <p className="text-gray-400 text-sm truncate">{artist}</p>
            <p className="text-gray-500 text-xs truncate">{album}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs px-1 py-0">
                {language}
              </Badge>
              {genre.slice(0, 1).map((g, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`transition-colors ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              >
                <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">{duration}</p>
              <p className="text-xs text-gray-500">{formatListens(listens)} plays</p>
              <p className="text-xs text-gray-600">{releaseYear}</p>
            </div>
          </div>
        </div>
        
        {mood && mood.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {mood.slice(0, 3).map((m, index) => (
              <span 
                key={index} 
                className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SongCard;
