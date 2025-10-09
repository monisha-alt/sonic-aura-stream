
import { useState } from "react";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useFavorites } from "@/hooks/useFavorites";
import { useListeningHistory } from "@/hooks/useListeningHistory";
import SongCard from "@/components/SongCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Shuffle as ShuffleIcon, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MusicLibraryPage = () => {
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState<'auto' | 'itunes' | 'supabase'>('auto');
  const { data: songs = [], isLoading, error } = useSongs(source);
  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const { hasListened, trackListen } = useListeningHistory();
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

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
  };

  const filteredSongs = songs.filter(song =>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <p className="text-red-400">Error loading songs</p>
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
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />
        
        <div className="flex-1 p-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Music Library</h1>
            
            {songs.length > 0 && songs.some(s => s.audio_url && s.audio_url.includes('itunes')) && (
              <Alert className="mb-4">
                <AlertTitle>Loaded sample songs</AlertTitle>
                <AlertDescription>
                  Showing ~50 Indian previews from iTunes. Tap Play All or any song to listen.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center mb-6 space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search songs..." 
                  className="bg-gray-800 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
<Button variant="secondary" onClick={() => setSource('itunes')}>
  Load iTunes Previews
</Button>
<Button variant="outline" onClick={() => toggleShuffle()}>
  <ShuffleIcon className="mr-2 h-4 w-4" />
  Shuffle
</Button>
<Button onClick={() => playPlaylist(filteredSongs, 0)} className="bg-purple-600 hover:bg-purple-700">
  <Play className="mr-2 h-4 w-4" />
  Play All
</Button>
            </div>
            
            {filteredSongs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map((song) => (
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
                    onPlay={() => {
                      playSong(song);
                      trackListen(song.id, song.duration || 0);
                    }}
                    onLike={() => toggleFavorite(song)}
                    isFavorited={isFavorited(song.id)}
                    isUnlistened={!hasListened(song.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-10">No songs match your search criteria.</p>
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

export default MusicLibraryPage;
