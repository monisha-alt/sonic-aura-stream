
import { useState, useEffect } from 'react';
import { Song } from '@/hooks/useSongs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Function to load favorites from Supabase
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      // Get user's favorite song IDs
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('song_id')
        .eq('user_id', user.id);
      
      if (favError) throw new Error(favError.message);
      
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      // Get the actual song data for favorited songs
      const songIds = favoriteIds.map(fav => fav.song_id);
      const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .in('id', songIds);
      
      if (songsError) throw new Error(songsError.message);
      
      setFavorites(songs || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load favorites'));
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle a song as favorite
  const toggleFavorite = async (song: Song) => {
    if (!user) {
      console.error('User must be logged in to manage favorites');
      return false;
    }

    try {
      const isFavorited = favorites.some(fav => fav.id === song.id);
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', song.id);
        
        if (error) throw new Error(error.message);
        
        setFavorites(prev => prev.filter(fav => fav.id !== song.id));
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            song_id: song.id
          });
        
        if (error) throw new Error(error.message);
        
        setFavorites(prev => [...prev, song]);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle favorite'));
      console.error('Error toggling favorite:', err);
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
  }, [user]);

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorited,
    loadFavorites
  };
};
