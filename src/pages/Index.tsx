
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CurrentSongDisplay from "@/components/CurrentSongDisplay";
import RecommendedSongs from "@/components/RecommendedSongs";
import MoodGenerator from "@/components/MoodGenerator";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const { toast } = useToast();

  // Fetch songs from Supabase
  const { data: songs = [], isLoading: songsLoading, error: songsError } = useSongs();
  
  // Audio player hook with new features
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

  // Debug logging
  useEffect(() => {
    console.log('Songs data:', songs);
    console.log('Songs loading:', songsLoading);
    console.log('Songs error:', songsError);
    console.log('Songs length:', songs.length);
  }, [songs, songsLoading, songsError]);

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
    toast({
      title: aiModeEnabled ? "AI Mode Disabled" : "AI Mode Enabled",
      description: aiModeEnabled 
        ? "Switched to standard recommendations" 
        : "Personalizing your music experience with AI",
      duration: 3000,
    });
  };

  const handleSongPlay = (song: any) => {
    // Create a playlist from all songs and play the selected one
    const songIndex = songs.findIndex(s => s.id === song.id);
    playPlaylist(songs, songIndex);
    toast({
      title: "Now Playing",
      description: `${song.title} by ${song.artist}`,
      duration: 2000,
    });
  };

  // Show loading state
  if (songsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your music...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching songs from database...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (songsError) {
    console.error('Error loading songs:', songsError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">Error loading songs</p>
          <p className="text-sm text-gray-400">Please check your database connection</p>
          <p className="text-xs text-gray-500 mt-2">Error: {songsError.message}</p>
        </div>
      </div>
    );
  }

  // Show no data state
  if (songs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-yellow-400 mb-4">No songs found</p>
          <p className="text-sm text-gray-400">Your music database appears to be empty</p>
          <p className="text-xs text-gray-500 mt-2">Please add some songs to your database</p>
        </div>
      </div>
    );
  }

  // Filter out the current song from recommendations
  const recommendedSongs = songs.filter((song) => song.id !== currentSong?.id).slice(0, 5);

  // Convert current song for display
  const displayCurrentSong = currentSong ? {
    title: currentSong.title,
    artist: currentSong.artist,
    duration: formatTime(duration),
    cover: currentSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <main className="flex-1 overflow-auto">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Your Music, Reimagined
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Discover your perfect soundtrack with AI-powered recommendations tailored to your mood, time, and location.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {songs.length} songs in your library
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      AI-powered recommendations
                    </span>
                  </div>
                </div>
                
                {displayCurrentSong && (
                  <div className="lg:w-96">
                    <CurrentSongDisplay currentSong={displayCurrentSong} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="p-8">
            <div className="max-w-7xl mx-auto space-y-12">
              {/* Recommended Songs Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Made for You</h2>
                    <p className="text-muted-foreground">Personalized recommendations based on your taste</p>
                  </div>
                </div>
                <RecommendedSongs 
                  songs={recommendedSongs.map(song => ({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || '',
                    duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00',
                    cover: song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop',
                    releaseYear: song.release_year || 2023,
                    genre: song.genre || [],
                    language: song.language || 'English',
                    mood: song.mood || [],
                    listens: song.listens || 0,
                    onPlay: () => handleSongPlay(song)
                  }))} 
                />
              </div>

              {/* Mood Generator Section */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Discover by Mood</h2>
                <MoodGenerator />
              </div>
            </div>
          </section>
        </main>
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

export default Index;
