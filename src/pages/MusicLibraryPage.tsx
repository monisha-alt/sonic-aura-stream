
import React, { useState } from "react";
import { useSongs } from "@/hooks/useSongs";
import SongCard from "@/components/SongCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MusicLibraryPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("listens");

  // Get unique languages and genres for filters
  const languages = [...new Set(songs.map(song => song.language).filter(Boolean))];
  const genres = [...new Set(songs.flatMap(song => song.genre || []))];

  // Apply filters and sorting
  let filteredSongs = songs.filter(song => {
    const matchesSearch = !searchTerm || 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === "all" || song.language === languageFilter;
    const matchesGenre = genreFilter === "all" || song.genre?.includes(genreFilter);
    
    return matchesSearch && matchesLanguage && matchesGenre;
  });

  // Sort songs
  filteredSongs.sort((a, b) => {
    switch (sortBy) {
      case "listens":
        return (b.listens || 0) - (a.listens || 0);
      case "release_year":
        return (b.release_year || 0) - (a.release_year || 0);
      case "title":
        return a.title.localeCompare(b.title);
      case "artist":
        return a.artist.localeCompare(b.artist);
      default:
        return 0;
    }
  });

  // Group songs by language for tabs
  const songsByLanguage = languages.reduce((acc, language) => {
    acc[language] = songs.filter(song => song.language === language);
    return acc;
  }, {} as Record<string, typeof songs>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your music library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">Error loading music library</p>
          <p className="text-sm text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Music Library</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredSongs.length} songs</Badge>
            <Badge variant="outline">{languages.length} languages</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search songs, artists, albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
          
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Language" />
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
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listens">Most Popular</SelectItem>
              <SelectItem value="release_year">Latest</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="artist">Artist A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-gray-800 mb-6">
            <TabsTrigger value="all">All Songs ({songs.length})</TabsTrigger>
            {Object.entries(songsByLanguage).map(([language, langSongs]) => (
              <TabsTrigger key={language} value={language}>
                {language} ({langSongs.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  id={song.id}
                  title={song.title}
                  artist={song.artist}
                  album={song.album || 'Unknown Album'}
                  duration={song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                  cover={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'}
                  releaseYear={song.release_year || 2023}
                  genre={song.genre || []}
                  language={song.language || 'Unknown'}
                  mood={song.mood || []}
                  listens={song.listens || 0}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(songsByLanguage).map(([language, langSongs]) => (
            <TabsContent key={language} value={language}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {langSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    id={song.id}
                    title={song.title}
                    artist={song.artist}
                    album={song.album || 'Unknown Album'}
                    duration={song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                    cover={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'}
                    releaseYear={song.release_year || 2023}
                    genre={song.genre || []}
                    language={song.language || 'Unknown'}
                    mood={song.mood || []}
                    listens={song.listens || 0}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MusicLibraryPage;
