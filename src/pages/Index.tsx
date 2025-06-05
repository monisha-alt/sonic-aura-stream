
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <div className="flex-1 p-4 pb-24">
          <h2 className="text-2xl font-bold mb-6">Your AI-Powered Recommendations</h2>
          <p className="text-sm text-gray-400 mb-4">Found {songs.length} songs in your library</p>
          
          {displayCurrentSong && <CurrentSongDisplay currentSong={displayCurrentSong} />}
          
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
          
          <MoodGenerator />
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

export default Index;
