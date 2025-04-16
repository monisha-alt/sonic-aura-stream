
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { songs } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import SongRemixer from "@/components/SongRemixer";

const RemixPage = () => {
  const { songId } = useParams<{ songId: string }>();
  const [song, setSong] = useState<typeof songs[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "",
    artist: "",
    duration: "",
    cover: ""
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  useEffect(() => {
    // Find the song
    const foundSong = songs.find(s => s.id === songId);
    setSong(foundSong || null);
    
    // Set current song if found
    if (foundSong) {
      setCurrentSong({
        title: foundSong.title,
        artist: foundSong.artist,
        duration: foundSong.duration,
        cover: foundSong.cover
      });
    }
  }, [songId]);

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    // Skip functionality simplified for remix page
  };

  const handleSkipBack = () => {
    // Skip functionality simplified for remix page
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <h2 className="text-2xl">Song not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <div className="flex-1 p-4 pb-24">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to={`/lyrics/${song.id}`} 
              className="inline-flex items-center text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to song
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img 
              src={song.cover} 
              alt={`${song.title} cover`}
              className="w-40 h-40 object-cover rounded-lg shadow-lg"
            />
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{song.title}</h1>
              <p className="text-xl text-gray-300">{song.artist}</p>
              <p className="text-gray-400">Album: {song.album}</p>
              <p className="text-gray-400">Duration: {song.duration}</p>
              <div className="flex space-x-2 mt-2">
                <Button 
                  onClick={handlePlayPause} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isPlaying ? "Pause" : "Play"} Original
                </Button>
              </div>
            </div>
          </div>
          
          <div className="max-w-6xl">
            <SongRemixer songId={songId || ""} />
          </div>
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

export default RemixPage;
