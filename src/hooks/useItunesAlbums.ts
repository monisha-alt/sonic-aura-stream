import { useQuery } from "@tanstack/react-query";

export interface ItunesAlbum {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseYear: number;
  tracks: string[];
  genre: string[];
  language: string;
  mood: string[];
}

export const useItunesAlbums = () => {
  return useQuery({
    queryKey: ['itunes-albums'],
    queryFn: async () => {
      console.log('Fetching albums from iTunes API...');

      const languages = [
        { lang: 'Hindi', artists: ['Arijit Singh', 'Pritam', 'A.R. Rahman', 'Shreya Ghoshal'] },
        { lang: 'Tamil', artists: ['A. R. Rahman', 'Anirudh Ravichander', 'Ilaiyaraaja'] },
        { lang: 'Telugu', artists: ['Devi Sri Prasad', 'M. M. Keeravani', 'Thaman S'] },
        { lang: 'Punjabi', artists: ['Diljit Dosanjh', 'AP Dhillon', 'Guru Randhawa'] },
        { lang: 'Malayalam', artists: ['Gopi Sundar', 'Sushin Shyam', 'Bijibal'] },
      ];

      const guessMood = (name: string): string[] => {
        const lower = name.toLowerCase();
        const moods: string[] = [];
        if (/(love|romance|romantic)/.test(lower)) moods.push('romantic');
        if (/(dance|party|beat)/.test(lower)) moods.push('energetic');
        if (/(sad|melancholy)/.test(lower)) moods.push('sad');
        if (/(calm|devotional|classical)/.test(lower)) moods.push('calm');
        if (moods.length === 0) moods.push('happy');
        return moods;
      };

      const fetchArtistAlbums = async (artist: string, lang: string) => {
        const term = encodeURIComponent(artist);
        const url = `https://itunes.apple.com/search?term=${term}&country=IN&media=music&entity=album&limit=10`;
        try {
          const res = await fetch(url);
          if (!res.ok) return [];
          const json = await res.json();
          const items = json.results || [];
          
          return items.map((r: any) => ({
            id: String(r.collectionId),
            title: r.collectionName,
            artist: r.artistName,
            cover: r.artworkUrl100 ? r.artworkUrl100.replace('100x100', '600x600') : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
            releaseYear: r.releaseDate ? new Date(r.releaseDate).getFullYear() : 2023,
            tracks: Array(r.trackCount || 10).fill('').map((_, i) => `Track ${i + 1}`),
            genre: r.primaryGenreName ? [r.primaryGenreName] : ['Pop'],
            language: lang,
            mood: guessMood(r.collectionName || ''),
          } as ItunesAlbum));
        } catch (err) {
          console.error(`Failed to fetch albums for ${artist}:`, err);
          return [];
        }
      };

      const tasks = [];
      for (const group of languages) {
        for (const artist of group.artists) {
          tasks.push(fetchArtistAlbums(artist, group.lang));
        }
      }

      const settled = await Promise.allSettled(tasks);
      const results: ItunesAlbum[] = [];
      for (const s of settled) {
        if (s.status === 'fulfilled') results.push(...s.value);
      }

      // Dedupe by id
      const map = new Map<string, ItunesAlbum>();
      for (const album of results) {
        if (!map.has(album.id)) map.set(album.id, album);
      }

      const final = Array.from(map.values()).slice(0, 40);
      console.log(`Fetched ${final.length} albums from iTunes`);
      return final;
    },
  });
};
