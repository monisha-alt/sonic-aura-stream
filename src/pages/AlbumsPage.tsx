
import { useSongs } from "@/hooks/useSongs";
import AlbumGrid from "@/components/AlbumGrid";

const AlbumsPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();

  // Group songs by album
  const albumsMap = new Map();
  songs.forEach(song => {
    const albumKey = `${song.album}-${song.artist}`;
    if (!albumsMap.has(albumKey)) {
      albumsMap.set(albumKey, {
        id: song.id,
        title: song.album || 'Unknown Album',
        artist: song.artist,
        cover: song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop',
        releaseYear: song.release_year || 2023,
        tracks: [song.id],
        genre: song.genre || [],
        language: song.language || 'English',
        mood: song.mood || []
      });
    } else {
      const album = albumsMap.get(albumKey);
      album.tracks.push(song.id);
    }
  });

  const albums = Array.from(albumsMap.values());

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
          <p>Error loading albums</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Albums</h1>
        <p className="text-gray-400">{albums.length} albums</p>
      </div>
      
      <AlbumGrid albums={albums} />
    </div>
  );
};

export default AlbumsPage;
