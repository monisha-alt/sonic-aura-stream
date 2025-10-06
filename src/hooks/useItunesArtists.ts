import { useQuery } from "@tanstack/react-query";

export interface ItunesArtist {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  popularSongs: string[];
  albums: string[];
  languages: string[];
  country: string;
}

export const useItunesArtists = () => {
  return useQuery({
    queryKey: ['itunes-artists'],
    queryFn: async () => {
      console.log('Fetching artists from iTunes API...');

      const artistsList = [
        { name: 'Arijit Singh', country: 'India', lang: 'Hindi' },
        { name: 'Shreya Ghoshal', country: 'India', lang: 'Hindi' },
        { name: 'A. R. Rahman', country: 'India', lang: 'Tamil' },
        { name: 'Anirudh Ravichander', country: 'India', lang: 'Tamil' },
        { name: 'Diljit Dosanjh', country: 'India', lang: 'Punjabi' },
        { name: 'Pritam', country: 'India', lang: 'Hindi' },
        { name: 'Sonu Nigam', country: 'India', lang: 'Hindi' },
        { name: 'Devi Sri Prasad', country: 'India', lang: 'Telugu' },
        { name: 'Sid Sriram', country: 'India', lang: 'Tamil' },
        { name: 'Gopi Sundar', country: 'India', lang: 'Malayalam' },
        { name: 'AP Dhillon', country: 'India', lang: 'Punjabi' },
        { name: 'Guru Randhawa', country: 'India', lang: 'Punjabi' },
      ];

      const fetchArtistDetails = async (artist: { name: string; country: string; lang: string }) => {
        const term = encodeURIComponent(artist.name);
        const url = `https://itunes.apple.com/search?term=${term}&country=IN&media=music&entity=musicArtist,song,album&limit=20`;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const json = await res.json();
          const results = json.results || [];
          
          const artistData = results.find((r: any) => r.wrapperType === 'artist');
          const songs = results.filter((r: any) => r.wrapperType === 'track').slice(0, 10);
          const albums = results.filter((r: any) => r.wrapperType === 'collection').slice(0, 8);
          
          const genres = new Set<string>();
          [...songs, ...albums].forEach((item: any) => {
            if (item.primaryGenreName) genres.add(item.primaryGenreName);
          });

          return {
            id: String(artistData?.artistId || artist.name.replace(/\s+/g, '-').toLowerCase()),
            name: artist.name,
            image: artistData?.artistLinkUrl 
              ? `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop`
              : `https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop`,
            bio: `${artist.name} is a renowned ${artist.lang} playback singer and music composer.`,
            genres: Array.from(genres).slice(0, 3),
            popularSongs: songs.map((s: any) => s.trackName).slice(0, 10),
            albums: albums.map((a: any) => a.collectionName).slice(0, 8),
            languages: [artist.lang],
            country: artist.country,
          } as ItunesArtist;
        } catch (err) {
          console.error(`Failed to fetch artist ${artist.name}:`, err);
          return null;
        }
      };

      const tasks = artistsList.map(fetchArtistDetails);
      const settled = await Promise.allSettled(tasks);
      const results: ItunesArtist[] = [];
      
      for (const s of settled) {
        if (s.status === 'fulfilled' && s.value) {
          results.push(s.value);
        }
      }

      console.log(`Fetched ${results.length} artists from iTunes`);
      return results;
    },
  });
};
