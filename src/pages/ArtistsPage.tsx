
import { useSongs } from "@/hooks/useSongs";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ArtistsPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();

  // Group songs by artist
  const artistsMap = new Map();
  songs.forEach(song => {
    if (!artistsMap.has(song.artist)) {
      artistsMap.set(song.artist, {
        id: song.id,
        name: song.artist,
        image: song.cover_url || 'https://images.unsplash.com/photo-1621153359446-75218a80796a?q=80&w=400&h=400&auto=format&fit=crop',
        bio: `${song.artist} is a talented artist known for their unique style and musical innovation.`,
        genres: song.genre || [],
        popularSongs: [song.id],
        albums: [song.album],
        languages: [song.language],
        country: 'Unknown'
      });
    } else {
      const artist = artistsMap.get(song.artist);
      artist.popularSongs.push(song.id);
      if (song.album && !artist.albums.includes(song.album)) {
        artist.albums.push(song.album);
      }
      if (song.genre) {
        song.genre.forEach(genre => {
          if (!artist.genres.includes(genre)) {
            artist.genres.push(genre);
          }
        });
      }
    }
  });

  const artists = Array.from(artistsMap.values());

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p>Error loading artists</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artists</h1>
        <p className="text-gray-400">{artists.length} artists</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Link key={artist.id} to={`/artists/${artist.id}`}>
            <Card className="group hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-center truncate">{artist.name}</h3>
                <p className="text-sm text-gray-400 text-center">
                  {artist.popularSongs.length} song{artist.popularSongs.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ArtistsPage;
