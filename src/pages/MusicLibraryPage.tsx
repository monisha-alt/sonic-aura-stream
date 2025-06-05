import { useSongs } from "@/hooks/useSongs";
import SongCard from "@/components/SongCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useToast } from "@/hooks/use-toast";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import { Button, Play, Shuffle } from "@/components/ui/button";

const MusicLibraryPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("listens");
  const { toast } = useToast();

  // Audio player hook with enhanced features
  const {
    isPlaying,
    currentSong,
    progress,
    volume,
    duration,
    isShuffled,
    repeatMode,
    playSong,
    playPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    setVolume,
    formatTime
  } = useAudioPlayer();

  console.log('MusicLibraryPage - Songs:', songs.length);
  console.log('MusicLibraryPage - Loading:', isLoading);
  console.log('MusicLibraryPage - Error:', error);

  const handleSongPlay = (song: any) => {
    // Create a playlist from filtered songs and play the selected one
    const songIndex = filteredSongs.findIndex(s => s.id === song.id);
    playPlaylist(filteredSongs, songIndex);
    toast({
      title: "Now Playing",
      description: `${song.title} by ${song.artist}`,
      duration: 2000,
    });
  };

  // Get unique languages and genres for filters
  const languages = [...new Set(songs.map(song => song.language).filter(Boolean))];
  const genres = [...new Set(songs.flatMap(song => song.genre || []))];

  // Apply filters and sorting
  let filteredSongs = [...songs];

  if (searchTerm) {
    filteredSongs = filteredSongs.filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (languageFilter !== "all") {
    filteredSongs = filteredSongs.filter(song => song.language === languageFilter);
  }

  if (genreFilter !== "all") {
    filteredSongs = filteredSongs.filter(song => song.genre?.includes(genreFilter));
  }

  // Sort songs
  filteredSongs.sort((a, b) => {
    switch (sortBy) {
      case "listens":
        return (b.listens || 0) - (a.listens || 0);
      case "title":
        return a.title.localeCompare(b.title);
      case "artist":
        return a.artist.localeCompare(b.artist);
      case "year":
        return (b.release_year || 0) - (a.release_year || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="ml-4 text-white">Loading music library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p>Error loading music library</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
          <p className="text-xs text-gray-500 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Music Library</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredSongs.length} of {songs.length} songs</Badge>
            <Badge variant="outline">{languages.length} languages</Badge>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search songs, artists, albums..."
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listens">Most Popular</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="artist">Artist A-Z</SelectItem>
              <SelectItem value="year">Newest First</SelectItem>
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
            All ({songs.length})
          </button>
          {["Hindi", "English", "Punjabi", "Tamil", "Telugu"].map(lang => {
            const count = songs.filter(song => song.language === lang).length;
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
        
        {/* Quick actions for playlist management */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredSongs.length} of {songs.length} songs</Badge>
            <Badge variant="outline">{languages.length} languages</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => playPlaylist(filteredSongs)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Play All
            </Button>
            <Button
              onClick={() => {
                const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
                playPlaylist(shuffled);
              }}
              variant="outline"
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle All
            </Button>
          </div>
        </div>
        
        {/* Songs Grid */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No songs found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid gap-4">
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
                onPlay={() => handleSongPlay(song)}
                onLike={() => console.log('Liked:', song.title)}
              />
            ))}
          </div>
        )}
      </div>

      <AudioPlayerControls
        isPlaying={isPlaying}
        currentSong={currentSong}
        progress={progress}
        volume={volume}
        duration={duration}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        onPlayPause={togglePlayPause}
        onSeek={seekTo}
        onVolumeChange={setVolume}
        onNext={playNext}
        onPrevious={playPrevious}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        formatTime={formatTime}
      />
    </div>
  );
};

export default MusicLibraryPage;
