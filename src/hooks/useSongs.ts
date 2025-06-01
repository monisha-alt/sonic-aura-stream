
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number | null;
  cover_url: string | null;
  audio_url: string | null;
  release_year: number | null;
  genre: string[] | null;
  language: string | null;
  mood: string[] | null;
  listens: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useSongs = () => {
  return useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('listens', { ascending: false });
      
      if (error) {
        console.error('Error fetching songs:', error);
        throw error;
      }
      
      return data as Song[];
    },
  });
};

export const useSong = (id: string) => {
  return useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching song:', error);
        throw error;
      }
      
      return data as Song;
    },
    enabled: !!id,
  });
};
