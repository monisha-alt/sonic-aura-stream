
import { useState, useEffect } from 'react';
import { Song } from '@/hooks/useSongs';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to load favorites from localStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err as Error);
    }
  };

  // Function to toggle a song as favorite
  const toggleFavorite = async (song: Song) => {
    try {
      const isFavorited = favorites.some(fav => fav.id === song.id);
      let updatedFavorites;
      
      if (isFavorited) {
        updatedFavorites = favorites.filter(fav => fav.id !== song.id);
        toast({
          title: "Removed from favorites",
          description: `${song.title} removed from your favorites`
        });
      } else {
        updatedFavorites = [...favorites, song];
        toast({
          title: "Added to favorites",
          description: `${song.title} added to your favorites`
        });
      }

      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return !isFavorited;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if a song is favorited
  const isFavorited = (songId: string) => {
    return favorites.some(fav => fav.id === songId);
  };

  // Load favorites when user changes
  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorited,
    loadFavorites
  };
};
