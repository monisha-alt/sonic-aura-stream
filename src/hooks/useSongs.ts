
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

export const useSongs = (source: 'auto' | 'itunes' | 'supabase' = 'itunes') => {
  return useQuery({
    queryKey: ['songs', source],
    queryFn: async () => {
      // Prioritize iTunes API by default
      if (source === 'supabase') {
        console.log('Fetching songs from Supabase...');
        try {
          const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('listens', { ascending: false });

          if (error) throw error;
          if (data && data.length > 0) {
            console.log('Successfully fetched songs:', data.length, 'songs');
            return data as Song[];
          }
          console.warn('Supabase returned no songs.');
          return [];
        } catch (err) {
          console.error('Supabase fetch failed:', err);
          throw err;
        }
      }

      // Fetch ~50 Indian songs with legal 30s previews from iTunes Search API
      console.log('Fetching Indian sample songs from iTunes (previews)...');

      const languages = [
        { lang: 'Hindi', artists: ['Arijit Singh','Shreya Ghoshal','Pritam','Sonu Nigam'] },
        { lang: 'Tamil', artists: ['A. R. Rahman','Anirudh Ravichander','Sid Sriram'] },
        { lang: 'Telugu', artists: ['Devi Sri Prasad','Sid Sriram','Shankar Mahadevan'] },
        { lang: 'Malayalam', artists: ['Vijay Yesudas','KS Chithra','Gopi Sundar'] },
        { lang: 'Kannada', artists: ['Vijay Prakash','Armaan Malik','Ankit Tiwari'] },
        { lang: 'Punjabi', artists: ['Diljit Dosanjh','AP Dhillon','Guru Randhawa'] },
        { lang: 'Marathi', artists: ['Ajay-Atul','Shreya Ghoshal Marathi','Avadhoot Gupte'] },
        { lang: 'Bengali', artists: ['Anupam Roy','Arijit Singh Bengali','Shreya Ghoshal Bengali'] },
        { lang: 'Gujarati', artists: ['Kinjal Dave','Geeta Rabari'] },
        { lang: 'Odia', artists: ['Sushant Panda','Goodly Rath'] },
        { lang: 'Urdu', artists: ['Atif Aslam','Rahat Fateh Ali Khan'] },
      ];

      const guessMood = (r: any): string[] => {
        const name = `${r.trackName} ${r.primaryGenreName}`.toLowerCase();
        const moods: string[] = [];
        if (/(love|romance|romantic|heart)/.test(name)) moods.push('romantic');
        if (/(dance|party|club|beat|electro)/.test(name)) moods.push('energetic');
        if (/(sad|melancholy|alone|cry)/.test(name)) moods.push('sad');
        if (/(calm|ambient|lofi|classical|devotional|bhajan)/.test(name)) moods.push('calm');
        if (moods.length === 0) moods.push('happy');
        return moods;
      };

      const estimateListens = (id: number | undefined): number => {
        const base = typeof id === 'number' ? id : Math.floor(Math.random() * 1_000_000);
        return (base % 800_000) + 20_000;
      };

      const fetchArtist = async (artist: string, lang: string) => {
        const term = encodeURIComponent(artist);
        const url = `https://itunes.apple.com/search?term=${term}&country=IN&media=music&entity=song&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return [] as Song[];
        const json = await res.json();
        const items = (json.results || []).filter((r: any) => r.previewUrl);
        return items.map((r: any) => ({
          id: String(r.trackId ?? r.collectionId ?? `${r.artistId}-${r.trackName}`),
          title: r.trackName,
          artist: r.artistName,
          album: r.collectionName ?? null,
          duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : null,
          cover_url: r.artworkUrl100 ? r.artworkUrl100.replace('100x100', '600x600') : null,
          audio_url: r.previewUrl ?? null,
          release_year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
          genre: r.primaryGenreName ? [r.primaryGenreName] : null,
          language: lang,
          mood: guessMood(r),
          listens: estimateListens(r.trackId),
          created_at: null,
          updated_at: null,
        } as Song));
      };

      const results: Song[] = [];
      const tasks: Promise<Song[]>[] = [];
      for (const group of languages) {
        for (const a of group.artists) {
          tasks.push(fetchArtist(a, group.lang));
        }
      }

      const settled = await Promise.allSettled(tasks);
      for (const s of settled) {
        if (s.status === 'fulfilled') results.push(...s.value);
      }

      // Dedupe by id and ensure audio available
      const map = new Map<string, Song>();
      for (const s of results) {
        if (!s.audio_url) continue;
        if (!map.has(s.id)) map.set(s.id, s);
      }

      const final = Array.from(map.values()).slice(0, 50);
      console.log(`Fetched ${final.length} Indian sample songs from iTunes.`);
      return final;
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
