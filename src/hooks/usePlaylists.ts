
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  user_id: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching playlists:', error);
        throw error;
      }
      
      return data as Playlist[];
    },
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            position,
            songs (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching playlist:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });
};
