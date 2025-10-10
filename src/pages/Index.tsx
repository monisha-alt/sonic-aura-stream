import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CurrentSongDisplay from "@/components/CurrentSongDisplay";
import RecommendedSongs from "@/components/RecommendedSongs";
import MoodGenerator from "@/components/MoodGenerator";
import PlayerControls from "@/components/PlayerControls";
import { songs } from "@/data";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState({
    title: songs[0].title,
    artist: songs[0].artist,
    duration: songs[0].duration,
    cover: songs[0].cover
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const { toast } = useToast();

  // Filter out the current song from recommendations
  const recommendedSongs = songs.filter((song) => song.title !== currentSong.title).slice(0, 5);

  // Real-time song rotation effect
  useEffect(() => {
    if (!isPlaying) return;
    
    // Update progress in real-time when playing
    const progressInterval = setInterval(() => {
      setProgress(current => {
        // Progress ranges from 0-100
        if (current[0] >= 100) {
          // When song completes, move to next song
          const nextIndex = (currentSongIndex + 1) % songs.length;
          setCurrentSongIndex(nextIndex);
          setCurrentSong({
            title: songs[nextIndex].title,
            artist: songs[nextIndex].artist,
            duration: songs[nextIndex].duration,
            cover: songs[nextIndex].cover
          });
          
          toast({
            title: "Now Playing",
            description: `${songs[nextIndex].title} by ${songs[nextIndex].artist}`,
            duration: 2000,
          });
          
          return [0]; // Reset progress for new song
        }
        return [current[0] + 1];
      });
    }, 1000); // Update every second
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, currentSongIndex, toast]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${currentSong.title} by ${currentSong.artist}`,
      duration: 2000,
    });
  };

  const handleSkipForward = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong({
      title: songs[nextIndex].title,
      artist: songs[nextIndex].artist,
      duration: songs[nextIndex].duration,
      cover: songs[nextIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${songs[nextIndex].title} by ${songs[nextIndex].artist}`,
        duration: 2000,
      });
    }
  };

  const handleSkipBack = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentSong({
      title: songs[prevIndex].title,
      artist: songs[prevIndex].artist,
      duration: songs[prevIndex].duration,
      cover: songs[prevIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${songs[prevIndex].title} by ${songs[prevIndex].artist}`,
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
          
          <CurrentSongDisplay currentSong={currentSong} />
          
          <RecommendedSongs songs={recommendedSongs} />
          
          <MoodGenerator />
        </div>
      </div>

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
    </div>
  );
};

export default Index;
