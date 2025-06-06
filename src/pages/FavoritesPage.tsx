
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import SongCard from "@/components/SongCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Search } from "lucide-react";

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { favorites, isLoading, toggleFavorite, isFavorited } = useFavorites();
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

  const filteredFavorites = favorites.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={false}
          handleAiModeToggle={() => {}}
        />
        
        <div className="flex-1 p-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
            
            <div className="flex items-center mb-6 space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search favorites..." 
                  className="bg-gray-800 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => playPlaylist(filteredFavorites, 0)} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={filteredFavorites.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            </div>
            
            {filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFavorites.map((song) => (
                  <SongCard 
                    key={song.id}
                    id={song.id}
                    title={song.title}
                    artist={song.artist}
                    album={song.album || ""}
                    duration={formatDuration(song.duration)}
                    cover={song.cover_url || ""}
                    releaseYear={song.release_year || 0}
                    genre={song.genre}
                    language={song.language || "Unknown"}
                    mood={song.mood}
                    listens={song.listens || 0}
                    onPlay={() => playSong(song)}
                    onLike={() => toggleFavorite(song)}
                    isFavorited={isFavorited(song.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-2 text-gray-300">No favorites yet</h2>
                <p className="text-gray-400 mb-6">Start adding songs to your favorites</p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.location.href = '/library'}
                >
                  Browse Library
                </Button>
              </div>
            )}
          </div>
        </div>
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

export default FavoritesPage;
