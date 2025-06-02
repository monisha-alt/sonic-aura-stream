
import { useSongs } from "@/hooks/useSongs";
import AlbumGrid from "@/components/AlbumGrid";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AlbumsPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");

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

  let albums = Array.from(albumsMap.values());

  // Get unique languages and genres for filters
  const languages = [...new Set(songs.map(song => song.language).filter(Boolean))];
  const genres = [...new Set(songs.flatMap(song => song.genre || []))];

  // Apply filters
  if (searchTerm) {
    albums = albums.filter(album => 
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (languageFilter !== "all") {
    albums = albums.filter(album => album.language === languageFilter);
  }

  if (genreFilter !== "all") {
    albums = albums.filter(album => album.genre.includes(genreFilter));
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Albums</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{albums.length} albums</Badge>
            <Badge variant="outline">{languages.length} languages</Badge>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search albums or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
          
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(language => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick language filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setLanguageFilter("all")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              languageFilter === "all" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All
          </button>
          {["Hindi", "English", "Punjabi", "Tamil", "Telugu"].map(lang => {
            const count = albums.filter(album => album.language === lang).length;
            if (count === 0) return null;
            
            return (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  languageFilter === lang 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {lang} ({count})
              </button>
            );
          })}
        </div>
        
        <AlbumGrid albums={albums} />
      </div>
    </div>
  );
};

export default AlbumsPage;
