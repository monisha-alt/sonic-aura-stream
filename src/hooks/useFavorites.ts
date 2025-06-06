
import { useState, useEffect } from 'react';
import { Song } from '@/hooks/useSongs';
import { supabase } from '@/integrations/supabase/client';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to load favorites from local storage (or Supabase in the future)
  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use localStorage
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      // In the future, when auth is implemented:
      // const { data, error } = await supabase
      //   .from('user_favorites')
      //   .select('*, songs(*)')
      //   .eq('user_id', userId);
      
      // if (error) throw new Error(error.message);
      // setFavorites(data.map(item => item.songs));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load favorites'));
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle a song as favorite
  const toggleFavorite = (song: Song) => {
    let updatedFavorites: Song[];
    
    const isFavorited = favorites.some(fav => fav.id === song.id);
    
    if (isFavorited) {
      // Remove from favorites
      updatedFavorites = favorites.filter(fav => fav.id !== song.id);
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, song];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // In the future, when auth is implemented:
    // if (isFavorited) {
    //   await supabase.from('user_favorites').delete().eq('user_id', userId).eq('song_id', song.id);
    // } else {
    //   await supabase.from('user_favorites').insert({ user_id: userId, song_id: song.id });
    // }
    
    return !isFavorited;
  };

  // Check if a song is favorited
  const isFavorited = (songId: string) => {
    return favorites.some(fav => fav.id === songId);
  };

  // Load favorites on component mount
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
