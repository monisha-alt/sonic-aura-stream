import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useListeningHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if a song has been listened to
  const { data: listenedSongs = new Set<string>() } = useQuery({
    queryKey: ['listening-history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return new Set<string>();

      const { data, error } = await supabase
        .from('listening_history')
        .select('song_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching listening history:', error);
        return new Set<string>();
      }

      return new Set(data.map(item => item.song_id));
    },
  });

  // Track that a song has been listened to
  const trackListenMutation = useMutation({
    mutationFn: async ({ songId, duration }: { songId: string; duration?: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('listening_history')
        .insert({
          user_id: session.user.id,
          song_id: songId,
          duration_listened: duration || 0,
        });

      if (error) throw error;
      return songId;
    },
    onSuccess: (songId) => {
      queryClient.setQueryData(['listening-history'], (old: Set<string>) => {
        const newSet = new Set(old);
        newSet.add(songId);
        return newSet;
      });
    },
    onError: (error) => {
      console.error('Error tracking listen:', error);
    },
  });

  const hasListened = (songId: string) => listenedSongs.has(songId);
  const trackListen = (songId: string, duration?: number) => 
    trackListenMutation.mutate({ songId, duration });

  return {
    hasListened,
    trackListen,
    listenedSongs,
  };
};
