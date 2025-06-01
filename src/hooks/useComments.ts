
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  song_id: string | null;
  user_id: string | null;
  content: string;
  timestamp_in_song: number | null;
  likes_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useComments = (songId: string) => {
  return useQuery({
    queryKey: ['comments', songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('song_comments')
        .select('*')
        .eq('song_id', songId)
        .order('timestamp_in_song', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      
      return data as Comment[];
    },
    enabled: !!songId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: {
      song_id: string;
      content: string;
      timestamp_in_song?: number;
    }) => {
      const { data, error } = await supabase
        .from('song_comments')
        .insert([{
          ...comment,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.song_id] });
    },
  });
};
