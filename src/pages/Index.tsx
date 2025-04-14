
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CurrentSongDisplay from "@/components/CurrentSongDisplay";
import RecommendedSongs from "@/components/RecommendedSongs";
import MoodGenerator from "@/components/MoodGenerator";
import PlayerControls from "@/components/PlayerControls";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "Cosmic Harmony",
    artist: "Neural Waves",
    duration: "3:45",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Cosmic+Harmony"
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([30]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const { toast } = useToast();

  // Mock playlist of songs for real-time rotation
  const songPlaylist = [
    {
      title: "Cosmic Harmony",
      artist: "Neural Waves",
      duration: "3:45",
      cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Cosmic+Harmony"
    },
    {
      title: "Digital Dreams",
      artist: "The Algorithms",
      duration: "4:12",
      cover: "https://placehold.co/400x400/6366F1/FFFFFF?text=Digital+Dreams"
    },
    {
      title: "Neural Network",
      artist: "Binary Beats",
      duration: "3:28",
      cover: "https://placehold.co/400x400/A855F7/FFFFFF?text=Neural+Network"
    },
    {
      title: "Quantum Waves",
      artist: "AI Collective",
      duration: "5:01",
      cover: "https://placehold.co/400x400/EC4899/FFFFFF?text=Quantum+Waves"
    }
  ];

  // Mock recommended songs
  const recommendedSongs = [
    { id: 1, title: "Digital Dreams", artist: "The Algorithms", duration: "4:12" },
    { id: 2, title: "Neural Network", artist: "Binary Beats", duration: "3:28" },
    { id: 3, title: "Quantum Waves", artist: "AI Collective", duration: "5:01" },
    { id: 4, title: "Synthetic Soul", artist: "Deep Learning", duration: "3:56" },
  ];

  // Real-time song rotation effect
  useEffect(() => {
    if (!isPlaying) return;
    
    // Update progress in real-time when playing
    const progressInterval = setInterval(() => {
      setProgress(current => {
        // Progress ranges from 0-100
        if (current[0] >= 100) {
          // When song completes, move to next song
          const currentIndex = songPlaylist.findIndex(
            song => song.title === currentSong.title
          );
          const nextIndex = (currentIndex + 1) % songPlaylist.length;
          setCurrentSong(songPlaylist[nextIndex]);
          
          toast({
            title: "Now Playing",
            description: `${songPlaylist[nextIndex].title} by ${songPlaylist[nextIndex].artist}`,
            duration: 2000,
          });
          
          return [0]; // Reset progress for new song
        }
        return [current[0] + 1];
      });
    }, 1000); // Update every second
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, currentSong, toast, songPlaylist]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${currentSong.title} by ${currentSong.artist}`,
      duration: 2000,
    });
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
        progress={progress}
        setProgress={setProgress}
        volume={volume}
        setVolume={setVolume}
      />
    </div>
  );
};

export default Index;
