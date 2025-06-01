
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CurrentSongDisplay from "@/components/CurrentSongDisplay";
import RecommendedSongs from "@/components/RecommendedSongs";
import MoodGenerator from "@/components/MoodGenerator";
import PlayerControls from "@/components/PlayerControls";
import { useSongs } from "@/hooks/useSongs";
import { usePlaylists } from "@/hooks/usePlaylists";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { toast } = useToast();

  // Fetch songs from Supabase - hooks must be called before any early returns
  const { data: songs = [], isLoading: songsLoading, error: songsError } = useSongs();
  const { data: playlists = [], isLoading: playlistsLoading } = usePlaylists();

  // Set initial song when data loads
  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      const firstSong = songs[0];
      setCurrentSong({
        title: firstSong.title,
        artist: firstSong.artist,
        duration: firstSong.duration ? `${Math.floor(firstSong.duration / 60)}:${(firstSong.duration % 60).toString().padStart(2, '0')}` : '0:00',
        cover: firstSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
      });
    }
  }, [songs, currentSong]);

  // Real-time song rotation effect
  useEffect(() => {
    if (!isPlaying || songs.length === 0) return;
    
    // Update progress in real-time when playing
    const progressInterval = setInterval(() => {
      setProgress(current => {
        // Progress ranges from 0-100
        if (current[0] >= 100) {
          // When song completes, move to next song
          const nextIndex = (currentSongIndex + 1) % songs.length;
          setCurrentSongIndex(nextIndex);
          const nextSong = songs[nextIndex];
          setCurrentSong({
            title: nextSong.title,
            artist: nextSong.artist,
            duration: nextSong.duration ? `${Math.floor(nextSong.duration / 60)}:${(nextSong.duration % 60).toString().padStart(2, '0')}` : '0:00',
            cover: nextSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
          });
          
          toast({
            title: "Now Playing",
            description: `${nextSong.title} by ${nextSong.artist}`,
            duration: 2000,
          });
          
          return [0]; // Reset progress for new song
        }
        return [current[0] + 1];
      });
    }, 1000); // Update every second
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, currentSongIndex, songs, toast]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (currentSong) {
      toast({
        title: isPlaying ? "Paused" : "Playing",
        description: `${currentSong.title} by ${currentSong.artist}`,
        duration: 2000,
      });
    }
  };

  const handleSkipForward = () => {
    if (songs.length === 0) return;
    
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    const nextSong = songs[nextIndex];
    setCurrentSong({
      title: nextSong.title,
      artist: nextSong.artist,
      duration: nextSong.duration ? `${Math.floor(nextSong.duration / 60)}:${(nextSong.duration % 60).toString().padStart(2, '0')}` : '0:00',
      cover: nextSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${nextSong.title} by ${nextSong.artist}`,
        duration: 2000,
      });
    }
  };

  const handleSkipBack = () => {
    if (songs.length === 0) return;
    
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    const prevSong = songs[prevIndex];
    setCurrentSong({
      title: prevSong.title,
      artist: prevSong.artist,
      duration: prevSong.duration ? `${Math.floor(prevSong.duration / 60)}:${(prevSong.duration % 60).toString().padStart(2, '0')}` : '0:00',
      cover: prevSong.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${prevSong.title} by ${prevSong.artist}`,
        duration: 2000,
      });
    }
  };

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

  // Show loading state - moved after all hooks
  if (songsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your music...</p>
        </div>
      </div>
    );
  }

  // Show error state - moved after all hooks
  if (songsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">Error loading songs</p>
          <p className="text-sm text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Filter out the current song from recommendations
  const recommendedSongs = songs.filter((song) => song.title !== currentSong?.title).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <div className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-6">Your AI-Powered Recommendations</h2>
          
          {currentSong && <CurrentSongDisplay currentSong={currentSong} />}
          
          <RecommendedSongs songs={recommendedSongs.map(song => ({
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
            listens: song.listens || 0
          }))} />
          
          <MoodGenerator />
        </div>
      </div>

      {currentSong && (
        <PlayerControls 
          isPlaying={isPlaying}
          currentSong={currentSong}
          handlePlayPause={handlePlayPause}
          handleSkipForward={handleSkipForward}
          handleSkipBack={handleSkipBack}
          progress={progress}
          setProgress={setProgress}
          volume={volume}
          setVolume={setVolume}
        />
      )}
    </div>
  );
};

export default Index;
